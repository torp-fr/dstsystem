const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, organization, message } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields (name, email, message)',
    });
  }

  try {
    // Nodemailer transporter configuration for Hotmail/Outlook
    const transporter = nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send email to DST-System
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'DST-System@hotmail.com',
      subject: `Nouvelle demande de contact - ${name}`,
      html: `
        <h2>Nouvelle demande de contact</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Organisation:</strong> ${organization || 'Non spécifiée'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Message automatique - Ne pas répondre à cet email</em></p>
      `,
      replyTo: email,
    });

    // Send confirmation email to user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirmation - Votre message a été reçu | DST-System',
      html: `
        <h2>Merci pour votre message !</h2>
        <p>Bonjour ${name},</p>
        <p>Nous avons bien reçu votre demande et nous vous répondrons dans les meilleurs délais.</p>
        <p>L'équipe DST-System</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email',
      details: error.message,
    });
  }
};
