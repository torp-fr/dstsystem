import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, organization, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields (name, email, message)',
      });
    }

    // Check API key
    if (!process.env.RESEND_API_KEY) {
      console.error('[Contact API] Missing RESEND_API_KEY');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: Missing API key',
      });
    }

    console.log('[Contact API] Sending email for:', email);

    // Send email to DST-System
    const dstEmailResult = await resend.emails.send({
      from: 'Contact DST-System <onboarding@resend.dev>',
      to: 'DST-System@hotmail.com',
      subject: `Nouvelle demande de contact - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #333;">Nouvelle demande de contact</h2>
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Organisation:</strong> ${organization || 'Non spécifiée'}</p>
          <p><strong>Message:</strong></p>
          <p style="background: #f5f5f5; padding: 10px; border-radius: 4px;">
            ${message.replace(/\n/g, '<br>')}
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            <em>Message automatique - Ne pas répondre directement à cet email</em>
          </p>
        </div>
      `,
      replyTo: email,
    });

    if (dstEmailResult.error) {
      console.error('[Contact API] Error sending to DST-System:', dstEmailResult.error);
      return res.status(500).json({
        success: false,
        error: 'Failed to send email to DST-System',
        details: dstEmailResult.error.message,
      });
    }

    console.log('[Contact API] Email sent to DST-System:', dstEmailResult.id);

    // Send confirmation email to user
    const confirmationResult = await resend.emails.send({
      from: 'DST-System <onboarding@resend.dev>',
      to: email,
      subject: 'Confirmation - Votre message a été reçu | DST-System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #333;">Merci pour votre message !</h2>
          <p>Bonjour ${name},</p>
          <p>Nous avons bien reçu votre demande et nous vous répondrons dans les meilleurs délais.</p>
          <p>À bientôt,<br/>
          <strong>L'équipe DST-System</strong></p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            Vous pouvez aussi nous contacter directement au +33 6 65 44 52 26
          </p>
        </div>
      `,
    });

    if (confirmationResult.error) {
      console.error('[Contact API] Error sending confirmation:', confirmationResult.error);
      // Still success for user, but log the error
    }

    console.log('[Contact API] Confirmation email sent:', confirmationResult.id);

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: { name, email },
    });
  } catch (error) {
    console.error('[Contact API] Unexpected error:', {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      error: 'Failed to process contact form',
      details: error.message,
    });
  }
}
