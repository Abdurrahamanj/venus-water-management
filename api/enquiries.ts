import { getAllEnquiries } from '../server/enquiryHandler';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    const enquiries = getAllEnquiries();
    return res.status(200).json(enquiries);
  } catch (err: any) {
    console.error('[API enquiries error]:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
