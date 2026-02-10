import nodemailer from 'nodemailer';

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
        error: 'Missing required fields',
      });
    }

    // Check environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Missing email environment variables');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: Missing credentials',
      });
    }

    console.log('[Contact API] Starting email send for:', email);

    // Create Nodemailer transporter for Hotmail/Outlook
    const transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    console.log('[Contact API] Transporter created, sending email to DST-System...');

    // Send email to DST-System
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
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

    console.log('[Contact API] Email sent to DST-System successfully');

    // Send confirmation email to user
    console.log('[Contact API] Sending confirmation email to user...');
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
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

    console.log('[Contact API] Confirmation email sent successfully');

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: { name, email },
    });
  } catch (error) {
    console.error('[Contact API] Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      error: 'Failed to send email',
      details: error.message,
    });
  }
}
