// api/geolocation.ts
// This endpoint gets the visitor's geolocation based on their IP
// It uses Vercel's built-in geolocation data from headers

export default async function handler(req: any, res: any) {
  try {
    // Get geolocation from Vercel request headers
    const ip = req.headers['x-forwarded-for']?.split(',')[0] ||
               req.headers['x-real-ip'] ||
               req.socket?.remoteAddress ||
               null;

    // Vercel provides geolocation via cf-ipcountry and other headers
    const country = req.headers['cf-ipcountry'] || null;
    const city = req.headers['x-vercel-ip-city'] || null;
    const latitude = req.headers['x-vercel-ip-latitude'] || null;
    const longitude = req.headers['x-vercel-ip-longitude'] || null;

    console.log('[Geolocation API] Request data:', {
      ip,
      country,
      city,
      latitude,
      longitude,
    });

    res.status(200).json({
      ip: ip || null,
      country: country || null,
      city: city || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
    });
  } catch (error) {
    console.error('[Geolocation API] Error:', error);
    res.status(200).json({
      ip: null,
      country: null,
      city: null,
      latitude: null,
      longitude: null,
    });
  }
}
