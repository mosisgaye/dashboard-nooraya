import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const SMTP_HOST = Deno.env.get('SMTP_HOST')
const SMTP_PORT = Deno.env.get('SMTP_PORT')
const SMTP_USER = Deno.env.get('SMTP_USER')
const SMTP_PASS = Deno.env.get('SMTP_PASS')

// Interface pour la requête
interface EmailRequest {
  to: string
  from: string
  replyTo?: string
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    filename: string
    content: string
    encoding?: string
  }>
}

// Fonction pour envoyer via Resend (recommandé)
async function sendViaResend(emailData: EmailRequest) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: emailData.from,
      to: emailData.to,
      reply_to: emailData.replyTo,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      attachments: emailData.attachments,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend error: ${error}`)
  }

  const data = await response.json()
  return { messageId: data.id, provider: 'resend' }
}

// Fonction pour envoyer via SendGrid (alternative)
async function sendViaSendGrid(emailData: EmailRequest) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: emailData.to }],
      }],
      from: { email: emailData.from },
      reply_to: { email: emailData.replyTo || emailData.from },
      subject: emailData.subject,
      content: [
        { type: 'text/html', value: emailData.html },
        ...(emailData.text ? [{ type: 'text/plain', value: emailData.text }] : []),
      ],
      attachments: emailData.attachments?.map(att => ({
        content: att.content,
        filename: att.filename,
        type: 'application/pdf',
        disposition: 'attachment',
      })),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SendGrid error: ${error}`)
  }

  const messageId = response.headers.get('x-message-id')
  return { messageId, provider: 'sendgrid' }
}

// Fonction pour envoyer via SMTP (fallback)
async function sendViaSMTP(emailData: EmailRequest) {
  // Pour SMTP, vous devrez utiliser une bibliothèque Deno compatible
  // ou faire un appel à un service SMTP via HTTP
  throw new Error('SMTP not implemented yet')
}

// Fonction principale
serve(async (req) => {
  // Vérifier CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Parser la requête
    const emailData: EmailRequest = await req.json()

    // Valider les données
    if (!emailData.to || !emailData.subject || !emailData.html) {
      throw new Error('Missing required fields: to, subject, html')
    }

    // Définir l'expéditeur par défaut
    if (!emailData.from) {
      emailData.from = 'Nooraya Voyage <noreply@noorayavoyage.com>'
    }

    let result

    // Essayer d'envoyer avec le provider disponible
    if (RESEND_API_KEY) {
      result = await sendViaResend(emailData)
    } else if (SENDGRID_API_KEY) {
      result = await sendViaSendGrid(emailData)
    } else if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      result = await sendViaSMTP(emailData)
    } else {
      throw new Error('No email provider configured. Please set RESEND_API_KEY, SENDGRID_API_KEY, or SMTP credentials.')
    }

    // Log success
    console.log(`Email sent successfully via ${result.provider} to ${emailData.to}`)

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.messageId,
        provider: result.provider,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )

  } catch (error) {
    console.error('Email sending error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})