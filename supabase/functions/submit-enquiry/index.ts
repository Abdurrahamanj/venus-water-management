// Supabase Edge Function: submit-enquiry
// Handles server-side validation, database storage, Resend email dispatch, and Twilio SMS dispatch

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EnquiryPayload {
  customer_name?: string;
  email?: string;
  mobile?: string;
  message?: string;
}

// In-memory rate limiting map for edge runtime instances (IP/Email -> timestamp)
const rateLimitMap = new Map<string, number>();

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid JSON request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { customer_name, email, mobile, message } = rawBody as EnquiryPayload;

    // 1. Server-side validation and sanitization
    const trimmedName = (customer_name || "").trim();
    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedMobile = (mobile || "").trim();
    const trimmedMessage = (message || "").trim();

    const errors: Record<string, string> = {};

    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 150) {
      errors.customer_name = "Customer name must be between 2 and 150 characters.";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail) || trimmedEmail.length > 255) {
      errors.email = "Please provide a valid email address.";
    }

    // Accept international or standard mobile numbers: +? followed by digits, spaces, hyphens, min 7 max 25 chars
    const phoneRegex = /^\+?[0-9\s\-()]{7,25}$/;
    if (!trimmedMobile || !phoneRegex.test(trimmedMobile)) {
      errors.mobile = "Please provide a valid contact mobile number with country/area code.";
    }

    if (!trimmedMessage || trimmedMessage.length < 10 || trimmedMessage.length > 3000) {
      errors.message = "Enquiry message must be between 10 and 3,000 characters.";
    }

    if (Object.keys(errors).length > 0) {
      return new Response(
        JSON.stringify({ error: "Validation failed.", details: errors }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Anti-Spam / Rate Limiting (Simple cooldown per email)
    const clientIdentifier = trimmedEmail;
    const now = Date.now();
    const lastSubmission = rateLimitMap.get(clientIdentifier);
    if (lastSubmission && now - lastSubmission < 30_000) {
      // 30 seconds cooldown per email
      return new Response(
        JSON.stringify({
          error: "Too many requests. Please wait at least 30 seconds between enquiries.",
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    rateLimitMap.set(clientIdentifier, now);

    // 3. Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are not configured in edge function runtime.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Insert enquiry record into database
    const { data: enquiryData, error: dbError } = await supabase
      .from("enquiries")
      .insert({
        customer_name: trimmedName,
        email: trimmedEmail,
        mobile: trimmedMobile,
        message: trimmedMessage,
        email_status: "PENDING",
        sms_status: "PENDING",
      })
      .select()
      .single();

    if (dbError || !enquiryData) {
      console.error("Database insert error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to store enquiry in database.", details: dbError?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const enquiryId = enquiryData.id;
    const createdAtUTC = enquiryData.created_at;

    let emailStatus = "PENDING";
    let smsStatus = "PENDING";

    // 5. Trigger Resend API for Email Confirmation
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const verifiedSender = Deno.env.get("RESEND_SENDER_EMAIL") || "enquiries@venuswater.com";
    const companyAdminEmail = Deno.env.get("COMPANY_ADMIN_EMAIL") || "admin@venuswater.com";

    if (!resendApiKey) {
      emailStatus = "PENDING: RESEND_API_KEY not configured in environment";
      console.warn("Resend email skipped: RESEND_API_KEY not configured.");
    } else {
      try {
        const customerEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8" />
            <title>Enquiry Confirmation - VENUS</title>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f8fa; margin: 0; padding: 20px; color: #172B3A; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e1e8ed; }
              .header { background-color: #102B46; padding: 28px 24px; text-align: center; }
              .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; }
              .header p { color: #48CAE4; margin: 6px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
              .body-content { padding: 32px 28px; line-height: 1.6; }
              .badge { display: inline-block; background-color: #e0f2fe; color: #0369a1; padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 13px; margin-bottom: 16px; }
              .details-box { background: #f8fafc; border-left: 4px solid #168AAD; padding: 16px; margin: 20px 0; border-radius: 4px; }
              .details-row { margin-bottom: 8px; font-size: 14px; }
              .details-label { font-weight: bold; color: #164E78; }
              .footer { background: #0b1d30; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>VENUS</h1>
                <p>Water Management & Sustainability Solutions</p>
              </div>
              <div class="body-content">
                <div class="badge">Enquiry Received</div>
                <h2 style="color: #102B46; margin-top: 0;">Hello ${trimmedName},</h2>
                <p>Thank you for reaching out to <strong>VENUS</strong>. Your enquiry regarding our water management solutions has been received successfully.</p>
                
                <div class="details-box">
                  <div class="details-row"><span class="details-label">Reference ID:</span> ${enquiryId}</div>
                  <div class="details-row"><span class="details-label">Submission Date (UTC):</span> ${new Date(createdAtUTC).toUTCString()}</div>
                  <div class="details-row"><span class="details-label">Contact Mobile:</span> ${trimmedMobile}</div>
                  <div class="details-row"><span class="details-label">Message Summary:</span><br/>"${trimmedMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;")}"</div>
                </div>

                <p>Our technical water management advisory team is reviewing your requirements and will contact you promptly.</p>
                <p>Sincerely,<br/><strong>The VENUS Client Solutions Team</strong></p>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} VENUS Water Management. Proposed Positioning & Sustainable Infrastructure.
              </div>
            </div>
          </body>
          </html>
        `;

        // Send customer confirmation
        const customerRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `VENUS Water Management <${verifiedSender}>`,
            to: [trimmedEmail],
            subject: "Your Enquiry Has Been Received – VENUS",
            html: customerEmailHtml,
          }),
        });

        const customerResJson = await customerRes.json();
        if (!customerRes.ok) {
          emailStatus = `FAILED: ${customerResJson?.message || customerRes.statusText}`;
        } else {
          emailStatus = "SENT";

          // Also send internal admin notification
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `VENUS Alerts <${verifiedSender}>`,
              to: [companyAdminEmail],
              subject: `[New Enquiry] from ${trimmedName} (${enquiryId})`,
              html: `
                <h3>New Customer Enquiry Submitted</h3>
                <p><strong>Name:</strong> ${trimmedName}</p>
                <p><strong>Email:</strong> ${trimmedEmail}</p>
                <p><strong>Mobile:</strong> ${trimmedMobile}</p>
                <p><strong>ID:</strong> ${enquiryId}</p>
                <p><strong>Message:</strong></p>
                <blockquote>${trimmedMessage}</blockquote>
              `,
            }),
          }).catch((err) => console.error("Admin notification email error:", err));
        }
      } catch (err: any) {
        emailStatus = `FAILED: ${err.message || "Unknown email error"}`;
        console.error("Resend API call error:", err);
      }
    }

    // 6. Trigger Twilio API for SMS Notification
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      smsStatus = "PENDING: TWILIO credentials not configured in environment";
      console.warn("Twilio SMS skipped: Credentials missing in environment.");
    } else {
      try {
        const smsBody = `Hello ${trimmedName}, thank you for contacting VENUS. Your enquiry has been received successfully. Reference ID: ${enquiryId}.`;

        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const params = new URLSearchParams();
        params.append("To", trimmedMobile);
        params.append("From", twilioPhoneNumber);
        params.append("Body", smsBody);

        const twilioRes = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": "Basic " + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        });

        const twilioResJson = await twilioRes.json();
        if (!twilioRes.ok) {
          smsStatus = `FAILED: ${twilioResJson?.message || twilioRes.statusText}`;
        } else {
          smsStatus = "SENT";
        }
      } catch (err: any) {
        smsStatus = `FAILED: ${err.message || "Unknown Twilio error"}`;
        console.error("Twilio API call error:", err);
      }
    }

    // 7. Update enquiry record with actual notification statuses
    await supabase
      .from("enquiries")
      .update({
        email_status: emailStatus,
        sms_status: smsStatus,
      })
      .eq("id", enquiryId);

    // 8. Return response
    return new Response(
      JSON.stringify({
        success: true,
        enquiry_id: enquiryId,
        created_at: createdAtUTC,
        email_status: emailStatus,
        sms_status: smsStatus,
        message: "Thank you for contacting VENUS. Your enquiry has been received successfully. Our team will review your request.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("submit-enquiry handler error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error occurred while processing enquiry.", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
