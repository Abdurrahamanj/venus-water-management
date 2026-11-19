import { processEnquirySubmission } from '../server/enquiryHandler';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // use raw body
      }
    }
    const result = await processEnquirySubmission(body || {});
    return res.status(result.status || 200).json(result.body);
  } catch (err: any) {
    console.error('[API submit-enquiry error]:', err);
    return res.status(500).json({
      error: err.message || 'Internal server error',
      success: false
    });
  }
}
