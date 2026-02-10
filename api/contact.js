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
        error: 'Server configuration error',
      });
    }

    // For now, just return success
    // Email functionality will be added after we fix the basic function
    return res.status(200).json({
      success: true,
      message: 'Message received successfully',
      data: { name, email, organization },
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
