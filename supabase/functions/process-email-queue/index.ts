import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Récupérer les emails en attente
    const { data: emails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .lt('attempts', 3)
      .order('scheduled_at')
      .limit(10)

    if (fetchError) throw fetchError

    const results = []

    // Traiter chaque email
    for (const email of emails || []) {
      try {
        // Marquer comme en cours
        await supabase
          .from('email_queue')
          .update({ status: 'processing', attempts: email.attempts + 1 })
          .eq('id', email.id)

        // Envoyer l'email via la fonction send-email
        const { data: sendResult, error: sendError } = await supabase.functions.invoke('send-email', {
          body: {
            to: [email.to_email],
            template: email.template,
            data: email.data
          }
        })

        if (sendError) throw sendError

        // Marquer comme envoyé
        await supabase
          .from('email_queue')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString(),
            error: null
          })
          .eq('id', email.id)

        results.push({ id: email.id, status: 'sent' })

      } catch (error) {
        // En cas d'erreur, mettre à jour avec l'erreur
        await supabase
          .from('email_queue')
          .update({ 
            status: email.attempts >= 2 ? 'failed' : 'pending',
            error: error.message
          })
          .eq('id', email.id)

        results.push({ id: email.id, status: 'error', error: error.message })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})