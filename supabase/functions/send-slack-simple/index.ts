import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const SLACK_WEBHOOK_URL = Deno.env.get('SLACK_WEBHOOK_URL') || 'https://hooks.slack.com/services/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'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SlackMessage {
  text: string
  channel?: string
  username?: string
  icon_emoji?: string
  attachments?: any[]
  blocks?: any[]
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body: SlackMessage = await req.json()
    
    // Formater le message selon le type
    const slackPayload = {
      text: body.text || '📢 Notification Nooraya',
      username: body.username || 'Nooraya Bot',
      icon_emoji: body.icon_emoji || ':airplane:',
      ...(body.attachments && { attachments: body.attachments }),
      ...(body.blocks && { blocks: body.blocks })
    }

    // Déterminer le webhook selon le canal (pour l'instant un seul)
    const webhookUrl = SLACK_WEBHOOK_URL
    
    // Envoyer à Slack
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackPayload)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Slack API error: ${error}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification envoyée avec succès'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error: any) {
    console.error('Erreur Slack:', error)
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