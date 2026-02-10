import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Nodemailer transporter configuration
// Using Hotmail/Outlook SMTP service
const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'DST-System@hotmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your_password_here',
  },
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, organization, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
    });
  }

  try {
    // Send email to DST-System
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'DST-System@hotmail.com',
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

    // Optionally send confirmation email to user
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'DST-System@hotmail.com',
      to: email,
      subject: 'Confirmation - Votre message a été reçu | DST-System',
      html: `
        <h2>Merci pour votre message !</h2>
        <p>Bonjour ${name},</p>
        <p>Nous avons bien reçu votre demande et nous vous répondrons dans les meilleurs délais.</p>
        <p>L'équipe DST-System</p>
      `,
    });

    res.json({
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
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
