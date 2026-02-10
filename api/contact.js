export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  console.log('[TEST] Received:', { name, email, message });
  console.log('[TEST] API Key exists:', !!process.env.RESEND_API_KEY);
  console.log('[TEST] API Key preview:', process.env.RESEND_API_KEY?.substring(0, 10));

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    // Test simple - juste retourner du JSON
    return res.status(200).json({
      success: true,
      message: 'Test successful',
      debug: {
        hasApiKey: !!process.env.RESEND_API_KEY,
        apiKeyStart: process.env.RESEND_API_KEY?.substring(0, 10) || 'MISSING',
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
