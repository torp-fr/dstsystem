import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, organization, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Missing RESEND_API_KEY' });
  }

  try {
    console.log('[Contact API] Sending email from:', 'noreply@resend.dev');

    // Send to DST-System
    const dstResult = await resend.emails.send({
      from: 'noreply@resend.dev',
      to: 'DST-System@hotmail.com',
      subject: `Nouvelle demande de contact - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Nouvelle demande de contact</h2>
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Organisation:</strong> ${organization || 'N/A'}</p>
          <p><strong>Message:</strong></p>
          <p style="background: #f5f5f5; padding: 10px; border-radius: 4px;">
            ${message.replace(/\n/g, '<br>')}
          </p>
        </div>
      `,
      replyTo: email,
    });

    if (dstResult.error) {
      console.error('[Contact API] Error:', dstResult.error);
      return res.status(500).json({ error: dstResult.error.message });
    }

    // Send confirmation
    await resend.emails.send({
      from: 'noreply@resend.dev',
      to: email,
      subject: 'Confirmation - Votre message reçu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Merci pour votre message !</h2>
          <p>Bonjour ${name},</p>
          <p>Nous avons bien reçu votre demande et vous répondrons dans les meilleurs délais.</p>
          <p>Cordialement,<br/>L'équipe DST-System</p>
        </div>
      `,
    });

    console.log('[Contact API] Emails sent successfully');

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('[Contact API] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
