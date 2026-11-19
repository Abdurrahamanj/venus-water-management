import fs from 'node:fs';
import path from 'node:path';

export interface EnquiryRecord {
  id: string;
  reference_id: string;
  customer_name: string;
  email: string;
  mobile: string;
  message: string;
  created_at: string;
  email_status: string;
  sms_status: string;
  email_api_response?: any;
  sms_api_response?: any;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'enquiries.json');
const COUNTER_FILE = path.join(DATA_DIR, 'counter.txt');

function ensureDataStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
  }
  if (!fs.existsSync(COUNTER_FILE)) {
    fs.writeFileSync(COUNTER_FILE, '10000', 'utf8');
  }
}

export function getNextReferenceId(): string {
  ensureDataStorage();
  try {
    const raw = fs.readFileSync(COUNTER_FILE, 'utf8').trim();
    let num = parseInt(raw, 10);
    if (isNaN(num) || num < 10000) num = 10000;
    num += 1;
    fs.writeFileSync(COUNTER_FILE, num.toString(), 'utf8');
    return `V${num}`;
  } catch {
    return `V${10001 + Math.floor(Math.random() * 89999)}`;
  }
}

export function getAllEnquiries(): EnquiryRecord[] {
  ensureDataStorage();
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error('Error reading enquiries database file:', err);
    return [];
  }
}

export function saveEnquiryRecord(record: EnquiryRecord): void {
  ensureDataStorage();
  try {
    const records = getAllEnquiries();
    records.unshift(record);
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving enquiry to disk:', err);
  }
}

export async function processEnquirySubmission(payload: {
  customer_name?: string;
  email?: string;
  mobile?: string;
  message?: string;
}) {
  const trimmedName = (payload.customer_name || '').trim();
  const trimmedEmail = (payload.email || '').trim().toLowerCase();
  const trimmedMobile = (payload.mobile || '').trim();
  const trimmedMessage = (payload.message || '').trim();

  // 1. Server-side validation
  const errors: Record<string, string> = {};
  if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 150) {
    errors.customer_name = 'Customer name must be between 2 and 150 characters.';
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    errors.email = 'Please provide a valid email address.';
  }
  const phoneRegex = /^\+?[0-9\s\-()]{7,25}$/;
  if (!trimmedMobile || !phoneRegex.test(trimmedMobile)) {
    errors.mobile = 'Please provide a valid contact mobile number.';
  }
  if (!trimmedMessage || trimmedMessage.length < 10 || trimmedMessage.length > 3000) {
    errors.message = 'Enquiry message must be between 10 and 3,000 characters.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: 422,
      body: { error: 'Validation failed.', details: errors },
    };
  }

  const referenceId = getNextReferenceId();
  const uuid = crypto.randomUUID();
  const now = new Date().toISOString();

  // 2. Resend API Email Integration
  const resendApiKey = process.env.RESEND_API_KEY || '';
  const resendSender = process.env.RESEND_SENDER_EMAIL || 'onboarding@resend.dev';
  const adminEmail = process.env.COMPANY_ADMIN_EMAIL || 'admin@venuswater.com';

  let emailResponseData: any = null;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f8fa; margin: 0; padding: 24px; color: #172B3A; }
        .box { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #102B46; padding: 28px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 2px; }
        .header p { color: #48CAE4; margin: 6px 0 0 0; font-size: 13px; text-transform: uppercase; }
        .content { padding: 32px 28px; line-height: 1.6; }
        .ref-badge { background: #e0f2fe; color: #0369a1; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin: 16px 0; font-family: monospace; }
        .footer { background: #0b1d30; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="header">
          <h1>VENUS</h1>
          <p>Water Management & Sustainability</p>
        </div>
        <div class="content">
          <h2 style="color: #102B46; margin-top: 0;">Hello ${trimmedName},</h2>
          <p>Thank you for contacting <strong>VENUS</strong>. Your enquiry regarding our water management solutions has been received successfully.</p>
          <div>
            <span>Your Assigned Reference ID:</span><br/>
            <span class="ref-badge">${referenceId}</span>
          </div>
          <p><strong>Submission Timestamp (UTC):</strong> ${new Date(now).toUTCString()}</p>
          <p><strong>Message Summary:</strong><br/>"${trimmedMessage}"</p>
          <p>Our technical water management advisory team is currently reviewing your enquiry and will be in touch shortly.</p>
          <p>Best regards,<br/><strong>The VENUS Client Solutions Team</strong></p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} VENUS Water Management. Proposed Positioning & Sustainable Infrastructure.
        </div>
      </div>
    </body>
    </html>
  `;

  let customerEmailStatus = 'PENDING';
  let adminEmailStatus = 'PENDING';

  const adminEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f8fa; margin: 0; padding: 24px; color: #172B3A; }
        .box { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #102B46; padding: 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 2px; }
        .header p { color: #48CAE4; margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; }
        .content { padding: 28px; line-height: 1.6; }
        .alert-pill { display: inline-block; background: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 12px; margin-bottom: 16px; }
        .card { background: #f8fafc; border-left: 4px solid #168AAD; padding: 16px; margin: 16px 0; border-radius: 6px; }
        .btn { display: inline-block; background: #102B46; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; margin-top: 16px; }
        .footer { background: #0b1d30; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="header">
          <h1>VENUS</h1>
          <p>Administrative Operations Gateway</p>
        </div>
        <div class="content">
          <div class="alert-pill">New Customer Enquiry</div>
          <h2 style="color: #102B46; margin: 0 0 12px 0;">New Enquiry Received</h2>
          <p style="margin: 0 0 16px 0; color: #475569;">A prospective client has submitted an enquiry through the VENUS public web portal.</p>
          
          <div class="card">
            <p style="margin: 0 0 8px 0;"><strong>Reference ID:</strong> <span style="font-family: monospace; font-size: 15px; color: #168AAD;">${referenceId}</span></p>
            <p style="margin: 0 0 8px 0;"><strong>Customer Name:</strong> ${trimmedName}</p>
            <p style="margin: 0 0 8px 0;"><strong>Email Address:</strong> <a href="mailto:${trimmedEmail}">${trimmedEmail}</a></p>
            <p style="margin: 0 0 8px 0;"><strong>Contact Mobile:</strong> <a href="tel:${trimmedMobile}">${trimmedMobile}</a></p>
            <p style="margin: 0 0 8px 0;"><strong>Submission Date (UTC):</strong> ${new Date(now).toUTCString()}</p>
            <p style="margin: 12px 0 4px 0;"><strong>Customer Message:</strong></p>
            <blockquote style="margin: 0; padding: 10px 14px; background: #ffffff; border-radius: 4px; border: 1px solid #e2e8f0; font-style: italic;">
              "${trimmedMessage}"
            </blockquote>
          </div>

          <div style="text-align: center;">
            <a href="http://localhost:5173/admin/dashboard" class="btn">Open Admin Dashboard &rarr;</a>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} VENUS Water Management Console. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    console.log(`[Email Dispatch] Transmitting customer confirmation to ${trimmedEmail}...`);
    // 1. Customer Confirmation Email
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey || 'dummy_key'}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `VENUS Water Management <${resendSender}>`,
        to: [trimmedEmail],
        subject: 'Your Enquiry Has Been Received – VENUS',
        html: emailHtml,
      }),
    });

    const resendJson: any = await resendRes.json().catch(() => null);
    emailResponseData = resendJson;

    if (resendRes.ok && resendJson?.id) {
      customerEmailStatus = `SENT (Resend ID: ${resendJson.id})`;
      console.log(`[Customer Email SUCCESS]: ID ${resendJson.id}`);
    } else {
      const errDetail = resendJson?.message || resendRes.statusText || 'Delivery pending credentials';
      customerEmailStatus = `FAILED: HTTP ${resendRes.status} (${errDetail})`;
      console.warn(`[Customer Email NOTICE]: Resend responded: ${errDetail}`);
    }

    // 2. Admin Notification Email
    console.log(`[Email Dispatch] Transmitting administrative alert to ${adminEmail}...`);
    const adminRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey || 'dummy_key'}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `VENUS Operations <${resendSender}>`,
        to: [adminEmail],
        subject: `[VENUS Alert] New Customer Enquiry - ${referenceId} from ${trimmedName}`,
        html: adminEmailHtml,
      }),
    });

    const adminJson: any = await adminRes.json().catch(() => null);
    if (adminRes.ok && adminJson?.id) {
      adminEmailStatus = `SENT (Resend ID: ${adminJson.id})`;
      console.log(`[Admin Email SUCCESS]: ID ${adminJson.id}`);
    } else {
      const errDetail = adminJson?.message || adminRes.statusText || 'Delivery pending credentials';
      adminEmailStatus = `FAILED: HTTP ${adminRes.status} (${errDetail})`;
      console.warn(`[Admin Email NOTICE]: Resend responded: ${errDetail}`);
    }
  } catch (err: any) {
    customerEmailStatus = `FAILED: ${err.message}`;
    adminEmailStatus = `FAILED: ${err.message}`;
    console.error('[Email Dispatch Fetch Error]:', err);
  }

  // Combined overall email status
  let emailStatus = customerEmailStatus;
  if (customerEmailStatus.includes('SENT') && adminEmailStatus.includes('SENT')) {
    emailStatus = 'SENT (Customer & Admin Dispatched)';
  } else if (customerEmailStatus.includes('SENT')) {
    emailStatus = `Customer SENT / Admin: ${adminEmailStatus}`;
  } else if (adminEmailStatus.includes('SENT')) {
    emailStatus = `Admin SENT / Customer: ${customerEmailStatus}`;
  } else {
    emailStatus = customerEmailStatus;
  }

  // 3. SMS Gateway Integration (Fast2SMS with Twilio Fallback)
  const fast2smsKey = (process.env.FAST2SMS_API_KEY || '').trim();
  const twilioSid = (process.env.TWILIO_ACCOUNT_SID || '').trim();
  const twilioToken = (process.env.TWILIO_AUTH_TOKEN || '').trim();
  const twilioPhone = (process.env.TWILIO_PHONE_NUMBER || '').trim();

  let smsStatus = 'PENDING';
  let smsResponseData: any = null;

  // Clean 10-digit mobile number for Indian SMS providers
  const rawDigits = trimmedMobile.replace(/\D/g, '');
  const tenDigitMobile = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

  // Normalize To mobile to E.164 format (+91 if 10-digit Indian number)
  let formattedTo = trimmedMobile.replace(/[\s\-()]/g, '');
  if (!formattedTo.startsWith('+')) {
    if (formattedTo.length === 10) {
      formattedTo = '+91' + formattedTo;
    } else {
      formattedTo = '+' + formattedTo;
    }
  }

  // Normalize From number to E.164 format
  let formattedFrom = twilioPhone.replace(/[\s\-()]/g, '');
  if (formattedFrom && !formattedFrom.startsWith('+')) {
    if (formattedFrom.length === 10) {
      formattedFrom = '+91' + formattedFrom;
    } else {
      formattedFrom = '+' + formattedFrom;
    }
  }

  const smsText = `Hello ${trimmedName}, thank you for contacting VENUS. Your enquiry has been received successfully. Reference ID: ${referenceId}.`;

  // Option A: Try Fast2SMS first if key is configured
  let fast2smsSent = false;
  if (fast2smsKey && tenDigitMobile.length === 10) {
    try {
      console.log(`[Fast2SMS Dispatch] Attempting dispatch to ${tenDigitMobile}...`);
      const fast2smsRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
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

      const fast2smsJson: any = await fast2smsRes.json().catch(() => null);
      if (fast2smsRes.ok && fast2smsJson?.return === true) {
        fast2smsSent = true;
        smsStatus = `SENT (Fast2SMS: ${fast2smsJson.request_id || 'OK'})`;
        smsResponseData = fast2smsJson;
        console.log(`[Fast2SMS SUCCESS]: Request ID: ${fast2smsJson.request_id}`);
      } else {
        const f2sErr = fast2smsJson?.message || `HTTP ${fast2smsRes.status}`;
        console.warn(`[Fast2SMS NOTICE]: ${f2sErr}. Falling back to Twilio...`);
      }
    } catch (err: any) {
      console.warn(`[Fast2SMS Fetch Error]: ${err.message}. Falling back to Twilio...`);
    }
  }

  // Option B: Twilio Gateway (if Fast2SMS did not send)
  if (!fast2smsSent) {
    try {
      console.log(`[SMS Dispatch] Transmitting SMS notification to ${formattedTo} from ${formattedFrom} via Twilio REST API...`);
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid || 'ACCOUNT_SID'}/Messages.json`;
      const params = new URLSearchParams();
      params.append('To', formattedTo);
      params.append('From', formattedFrom || '+15555555555');
      params.append('Body', smsText);

      let twilioRes = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioSid || 'dummy'}:${twilioToken || 'dummy'}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      let twilioJson: any = await twilioRes.json().catch(() => null);

      // If Twilio trial account restriction code 572006 occurs (India trial template requirement), retry with approved trial template
      if (!twilioRes.ok && twilioJson?.code === 572006) {
        console.log('[SMS Dispatch] Twilio trial account restriction detected (code 572006). Retrying with approved trial template (sms_appointment_reminders)...');
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

      smsResponseData = twilioJson;

      if (twilioRes.ok && twilioJson?.sid) {
        smsStatus = `SENT (Twilio SID: ${twilioJson.sid})`;
        console.log(`[SMS Dispatch SUCCESS]: Twilio SID: ${twilioJson.sid}`);
      } else {
        const errDetail = twilioJson?.message || twilioRes.statusText || 'SMS dispatch pending Twilio credentials';
        smsStatus = `FAILED: HTTP ${twilioRes.status} (${errDetail})`;
        console.warn(`[SMS Dispatch NOTICE]: Twilio responded with status ${twilioRes.status}: ${errDetail}`);
      }
    } catch (err: any) {
      smsStatus = `FAILED: ${err.message}`;
      console.error('[SMS Dispatch Fetch Error]:', err);
    }
  }

  // 4. Save Record to Database Storage
  const record: EnquiryRecord = {
    id: uuid,
    reference_id: referenceId,
    customer_name: trimmedName,
    email: trimmedEmail,
    mobile: trimmedMobile,
    message: trimmedMessage,
    created_at: now,
    email_status: emailStatus,
    sms_status: smsStatus,
    email_api_response: emailResponseData,
    sms_api_response: smsResponseData,
  };

  saveEnquiryRecord(record);

  // 5. Return Response
  return {
    status: 200,
    body: {
      success: true,
      enquiry_id: referenceId,
      raw_uuid: uuid,
      created_at: now,
      email_status: emailStatus,
      sms_status: smsStatus,
      message: 'Thank you for contacting VENUS. Your enquiry has been received successfully. Our team will review your request.',
    },
  };
}
