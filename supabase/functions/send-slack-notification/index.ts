import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    // Récupérer les notifications Slack en attente
    const { data: notifications, error } = await supabase
      .from('slack_notifications_log')
      .select('*')
      .eq('status', 'pending')
      .order('sent_at')
      .limit(10)

    if (error) throw error

    const results = []

    for (const notification of notifications || []) {
      try {
        // Récupérer l'URL du webhook
        const { data: config } = await supabase
          .from('slack_config')
          .select('webhook_url')
          .eq('channel_name', notification.channel)
          .eq('is_active', true)
          .single()

        if (!config?.webhook_url) {
          throw new Error(`No webhook URL found for channel: ${notification.channel}`)
        }

        // Envoyer à Slack
        const slackResponse = await fetch(config.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification.message)
        })

        if (!slackResponse.ok) {
          throw new Error(`Slack API error: ${slackResponse.status}`)
        }

        // Mettre à jour le statut
        await supabase
          .from('slack_notifications_log')
          .update({ 
            status: 'sent',
            processed_at: new Date().toISOString()
          })
          .eq('id', notification.id)

        results.push({ 
          id: notification.id, 
          status: 'sent',
          channel: notification.channel
        })

      } catch (error) {
        // En cas d'erreur, marquer comme échoué
        await supabase
          .from('slack_notifications_log')
          .update({ 
            status: 'failed',
            error: error.message,
            processed_at: new Date().toISOString()
          })
          .eq('id', notification.id)

        results.push({ 
          id: notification.id, 
          status: 'failed',
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: results.length,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})