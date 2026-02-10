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
    console.log('[Contact API] Processing message from:', email);

    // Send to DST-System (using deliverability@resend.dev for testing)
    // In production, replace with verified domain
    const dstResult = await resend.emails.send({
      from: 'noreply@resend.dev',
      to: 'deliverability@resend.dev', // Test address - replace with DST-System@hotmail.com when domain verified
      subject: `Nouvelle demande de contact - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; border: 2px solid #f00; padding: 20px;">
          <h3 style="color: #f00;">⚠️ TEST EMAIL - Domain not verified</h3>
          <h2>Nouvelle demande de contact</h2>
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Organisation:</strong> ${organization || 'N/A'}</p>
          <p><strong>Message:</strong></p>
          <p style="background: #f5f5f5; padding: 10px; border-radius: 4px;">
            ${message.replace(/\n/g, '<br>')}
          </p>
          <p style="color: #f00; font-weight: bold;">
            ⚠️ This is a test email. To send real emails, verify a domain at resend.com/domains
          </p>
        </div>
      `,
      replyTo: email,
    });

    if (dstResult.error) {
      console.error('[Contact API] Error:', dstResult.error);
      return res.status(500).json({
        success: false,
        error: dstResult.error.message,
      });
    }

    console.log('[Contact API] Test email sent successfully');

    // Send confirmation to user
    const confirmResult = await resend.emails.send({
      from: 'noreply@resend.dev',
      to: email,
      subject: 'Confirmation - Votre message reçu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Merci pour votre message !</h2>
          <p>Bonjour ${name},</p>
          <p>Nous avons bien reçu votre demande et vous répondrons dans les meilleurs délais.</p>
          <p>Cordialement,<br/>L'équipe DST-System</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            Vous pouvez aussi nous contacter directement au +33 6 65 44 52 26
          </p>
        </div>
      `,
    });

    if (confirmResult.error) {
      console.error('[Contact API] Confirmation error:', confirmResult.error);
      // Don't fail - at least the test email was sent
    }

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully (TEST MODE)',
      note: 'Your message was received. To send emails to real recipients, verify a domain at resend.com/domains',
    });
  } catch (error) {
    console.error('[Contact API] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
