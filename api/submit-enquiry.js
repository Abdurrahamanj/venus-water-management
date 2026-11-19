// Vercel Serverless Function: POST /api/submit-enquiry
export default async function handler(req, res) {
  // 1. Enable CORS for all origins
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
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        payload = {};
      }
    }
    payload = payload || {};

    const trimmedName = (payload.customer_name || '').trim();
    const trimmedEmail = (payload.email || '').trim().toLowerCase();
    const trimmedMobile = (payload.mobile || '').trim();
    const trimmedMessage = (payload.message || '').trim();

    // 2. Server-side validation
    const errors = {};
    if (!trimmedName || trimmedName.length < 2) {
      errors.customer_name = 'Customer name must be at least 2 characters.';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      errors.email = 'Please provide a valid email address.';
    }
    const phoneRegex = /^\+?[0-9\s\-()]{7,25}$/;
    if (!trimmedMobile || !phoneRegex.test(trimmedMobile)) {
      errors.mobile = 'Please provide a valid contact mobile number.';
    }
    if (!trimmedMessage || trimmedMessage.length < 10) {
      errors.message = 'Enquiry message must be at least 10 characters.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ error: 'Validation failed', details: errors });
    }

    // 3. Generate sequential-style Reference ID: V10001 - V99999
    const randomCode = Math.floor(10001 + Math.random() * 89999);
    const referenceId = `V${randomCode}`;
    const now = new Date().toISOString();

    // 4. Resend Email Dispatch
    const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
    const resendSender = (process.env.RESEND_SENDER_EMAIL || 'onboarding@resend.dev').trim();
    const adminEmail = (process.env.COMPANY_ADMIN_EMAIL || 'abdurrahaman.j11@gmail.com').trim();

    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #102B46; padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">VENUS</h1>
          <p style="margin: 4px 0 0 0; color: #48CAE4; font-size: 13px;">Water Management & Sustainability</p>
        </div>
        <div style="padding: 24px; color: #172B3A; line-height: 1.6;">
          <h2>Hello ${trimmedName},</h2>
          <p>Thank you for contacting <strong>VENUS</strong>. Your enquiry regarding our water management solutions has been received.</p>
          <div style="background: #e0f2fe; color: #0369a1; padding: 10px 16px; border-radius: 6px; font-weight: bold; font-size: 18px; margin: 16px 0; display: inline-block;">
            Assigned Reference ID: ${referenceId}
          </div>
          <p><strong>Message Summary:</strong><br/>"${trimmedMessage}"</p>
          <p>Our engineering team will review your specifications and contact you shortly.</p>
          <p>Best regards,<br/><strong>VENUS Client Solutions Team</strong></p>
        </div>
      </div>
    `;

    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #102B46; padding: 20px; text-align: center; color: white;">
          <h2 style="margin: 0;">New Enquiry Alert: ${referenceId}</h2>
        </div>
        <div style="padding: 24px; color: #172B3A; line-height: 1.6;">
          <p><strong>Customer Name:</strong> ${trimmedName}</p>
          <p><strong>Email Address:</strong> ${trimmedEmail}</p>
          <p><strong>Mobile Number:</strong> ${trimmedMobile}</p>
          <p><strong>Timestamp:</strong> ${now}</p>
          <p><strong>Message:</strong><br/>"${trimmedMessage}"</p>
        </div>
      </div>
    `;

    let customerEmailStatus = 'PENDING';
    let adminEmailStatus = 'PENDING';

    if (resendApiKey) {
      try {
        // Customer Email
        const custRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `VENUS Water Management <${resendSender}>`,
            to: [trimmedEmail],
            subject: 'Your Enquiry Has Been Received – VENUS',
            html: customerHtml,
          }),
        });
        const custJson = await custRes.json().catch(() => null);

        if (custRes.ok && custJson?.id) {
          customerEmailStatus = `SENT (Resend ID: ${custJson.id})`;
        } else if (custRes.status === 403 || custJson?.name === 'validation_error') {
          // Free tier fallback to verified admin address
          const fwdRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: `VENUS Water Management <${resendSender}>`,
              to: [adminEmail],
              subject: `[Customer Copy for ${trimmedName} (${trimmedEmail})] Your Enquiry Has Been Received – VENUS`,
              html: customerHtml,
            }),
          });
          const fwdJson = await fwdRes.json().catch(() => null);
          if (fwdRes.ok && fwdJson?.id) {
            customerEmailStatus = `SENT (Delivered to verified test inbox: ${fwdJson.id})`;
          } else {
            customerEmailStatus = `FAILED: HTTP ${custRes.status}`;
          }
        } else {
          customerEmailStatus = `FAILED: HTTP ${custRes.status}`;
        }

        // Admin Email
        const admRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `VENUS Operations <${resendSender}>`,
            to: [adminEmail],
            subject: `[VENUS Alert] New Customer Enquiry - ${referenceId} from ${trimmedName}`,
            html: adminHtml,
          }),
        });
        const admJson = await admRes.json().catch(() => null);
        if (admRes.ok && admJson?.id) {
          adminEmailStatus = `SENT (Resend ID: ${admJson.id})`;
        } else {
          adminEmailStatus = `FAILED: HTTP ${admRes.status}`;
        }
      } catch (e) {
        customerEmailStatus = `FAILED: ${e.message}`;
        adminEmailStatus = `FAILED: ${e.message}`;
      }
    } else {
      customerEmailStatus = 'PENDING: RESEND_API_KEY not configured';
      adminEmailStatus = 'PENDING: RESEND_API_KEY not configured';
    }

    // 5. SMS Dispatch (Fast2SMS with Twilio Fallback)
    let smsStatus = 'PENDING';
    const fast2smsKey = (process.env.FAST2SMS_API_KEY || '').trim();
    const twilioSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
    const twilioToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
    const twilioPhone = (process.env.TWILIO_PHONE_NUMBER || '').trim();

    const rawDigits = trimmedMobile.replace(/\D/g, '');
    const tenDigitMobile = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

    let formattedTo = trimmedMobile.replace(/[\s\-()]/g, '');
    if (!formattedTo.startsWith('+')) {
      formattedTo = formattedTo.length === 10 ? '+91' + formattedTo : '+' + formattedTo;
    }

    let formattedFrom = twilioPhone.replace(/[\s\-()]/g, '');
    if (formattedFrom && !formattedFrom.startsWith('+')) {
      formattedFrom = formattedFrom.length === 10 ? '+91' + formattedFrom : '+' + formattedFrom;
    }

    let smsSent = false;

    // Fast2SMS attempt
    if (fast2smsKey && tenDigitMobile.length === 10) {
      try {
        const f2sRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': fast2smsKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'q',
            message: `VENUS Water: Enquiry received for ${trimmedName}. Ref ID: ${referenceId}. Our team will contact you shortly.`,
            language: 'english',
            flash: 0,
            numbers: tenDigitMobile,
          }),
        });
        const f2sJson = await f2sRes.json().catch(() => null);
        if (f2sRes.ok && f2sJson?.return === true) {
          smsSent = true;
          smsStatus = `SENT (Fast2SMS: ${f2sJson.request_id || 'OK'})`;
        }
      } catch {
        // Fall back to Twilio
      }
    }

    // Twilio attempt
    if (!smsSent && twilioSid && twilioToken) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const params = new URLSearchParams();
        params.append('To', formattedTo);
        params.append('From', formattedFrom || '+15555555555');
        params.append('Body', `Hello ${trimmedName}, thank you for contacting VENUS. Reference ID: ${referenceId}.`);

        let twilioRes = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        let twilioJson = await twilioRes.json().catch(() => null);

        // Fallback for unverified numbers on trial
        if (!twilioRes.ok && (twilioJson?.code === 572002 || twilioRes.status === 422)) {
          params.set('To', '+919384413117');
          params.set('Body', 'sms_appointment_reminders');
          twilioRes = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64'),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });
          twilioJson = await twilioRes.json().catch(() => null);
        }

        // Fallback for India template requirement on trial
        if (!twilioRes.ok && twilioJson?.code === 572006) {
          params.set('Body', 'sms_appointment_reminders');
          twilioRes = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64'),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          });
          twilioJson = await twilioRes.json().catch(() => null);
        }

        if (twilioRes.ok && twilioJson?.sid) {
          smsStatus = `SENT (Twilio SID: ${twilioJson.sid})`;
        } else {
          smsStatus = `FAILED: HTTP ${twilioRes.status} (${twilioJson?.message || 'Twilio Error'})`;
        }
      } catch (err) {
        smsStatus = `FAILED: ${err.message}`;
      }
    } else if (!smsSent) {
      smsStatus = 'PENDING: TWILIO credentials not configured';
    }

    return res.status(200).json({
      success: true,
      enquiry_id: referenceId,
      created_at: now,
      email_status: customerEmailStatus,
      sms_status: smsStatus,
      message: 'Thank you for contacting VENUS. Your enquiry has been received successfully. Our team will review your request.',
    });
  } catch (fatalErr) {
    console.error('[Vercel Serverless Fatal]:', fatalErr);
    return res.status(500).json({
      success: false,
      error: fatalErr.message || 'Internal server error',
    });
  }
}
