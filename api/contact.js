export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, organization, message } = req.body;

  // Diagnostic logs
  console.log('=== DIAGNOSTIC ===');
  console.log('Method:', req.method);
  console.log('Body:', { name, email, organization, message });
  console.log('API Key exists:', !!process.env.RESEND_API_KEY);
  console.log('API Key length:', process.env.RESEND_API_KEY?.length || 0);
  console.log('API Key starts with:', process.env.RESEND_API_KEY?.substring(0, 5) || 'NONE');

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
    });
  }

  // If API key is missing, return error immediately
  if (!process.env.RESEND_API_KEY) {
    console.error('FATAL: RESEND_API_KEY not found in environment variables');
    return res.status(500).json({
      success: false,
      error: 'Configuration error: RESEND_API_KEY not found',
      debug: {
        hasApiKey: false,
        environment: 'production',
      },
    });
  }

  try {
    // Import Resend dynamically to catch any import errors
    const { Resend } = await import('resend');
    console.log('Resend imported successfully');

    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log('Resend client created');

    // Send to DST-System
    console.log('Sending email to DST-System...');
    const dstResult = await resend.emails.send({
      from: 'noreply@resend.dev',
      to: 'DST-System@hotmail.com',
      subject: `Nouvelle demande de contact - ${name}`,
      html: `<h2>Nouvelle demande de contact</h2><p><strong>Nom:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Organisation:</strong> ${organization || 'N/A'}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`,
      replyTo: email,
    });

    console.log('DST email result:', dstResult);

    if (dstResult.error) {
      console.error('Resend error:', dstResult.error);
      return res.status(500).json({
        success: false,
        error: dstResult.error.message,
      });
    }

    // Send confirmation
    console.log('Sending confirmation email...');
    const confirmResult = await resend.emails.send({
      from: 'noreply@resend.dev',
      to: email,
      subject: 'Confirmation - Votre message reçu',
      html: `<h2>Merci pour votre message!</h2><p>Bonjour ${name},</p><p>Nous avons bien reçu votre demande et vous répondrons bientôt.</p><p>L'équipe DST-System</p>`,
    });

    console.log('Confirmation email result:', confirmResult);

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('=== ERROR ===');
    console.error('Type:', error.constructor.name);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);

    return res.status(500).json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
    });
  }
}
