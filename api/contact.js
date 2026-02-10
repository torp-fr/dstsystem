import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Debug
  console.log('[Contact API] Method:', req.method);
  console.log('[Contact API] API Key exists:', !!process.env.RESEND_API_KEY);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, organization, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Missing RESEND_API_KEY configuration',
      });
    }

    console.log('[Contact API] Sending email via Resend...');

    // Send to DST-System
    const dstResult = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: 'DST-System@hotmail.com',
      subject: `Nouvelle demande de contact - ${name}`,
      html: `<h2>Nouvelle demande de contact</h2><p><strong>Nom:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Organisation:</strong> ${organization || 'N/A'}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`,
      replyTo: email,
    });

    if (dstResult.error) {
      console.error('[Contact API] Resend error:', dstResult.error);
      return res.status(500).json({
        success: false,
        error: dstResult.error.message,
      });
    }

    // Send confirmation to user
    await resend.emails.send({
      from: 'DST-System <onboarding@resend.dev>',
      to: email,
      subject: 'Confirmation - Votre message reçu',
      html: `<h2>Merci pour votre message!</h2><p>Bonjour ${name},</p><p>Nous avons bien reçu votre demande et vous répondrons bientôt.</p><p>L'équipe DST-System</p>`,
    });

    console.log('[Contact API] Emails sent successfully');

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('[Contact API] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
