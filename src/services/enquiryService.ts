import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { EnquiryRecord } from '../lib/supabase';

export interface SubmitEnquiryData {
  customer_name: string;
  email: string;
  mobile: string;
  message: string;
}

export interface SubmitEnquiryResponse {
  success: boolean;
  enquiry_id: string; // Branded format: V10001, V10002...
  raw_uuid?: string;
  created_at: string;
  email_status: string;
  sms_status: string;
  message: string;
  is_demo?: boolean;
}

const LOCAL_STORAGE_KEY = 'venus_enquiries_local_store';
const SEQ_STORAGE_KEY = 'venus_enquiry_seq_counter';

/**
 * Generates sequential branded Reference IDs starting at V10001
 */
export function getNextSequenceNumber(): string {
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const storedSeq = localStorage.getItem(SEQ_STORAGE_KEY);
    let nextNum = storedSeq ? parseInt(storedSeq, 10) + 1 : 10000 + existing.length + 1;
    if (isNaN(nextNum) || nextNum < 10001) {
      nextNum = 10001;
    }
    localStorage.setItem(SEQ_STORAGE_KEY, nextNum.toString());
    return `V${nextNum}`;
  } catch {
    return 'V10001';
  }
}

/**
 * Formats any raw UUID or stored ID into clean V10001 format
 */
export function formatReferenceId(rawId: string, index?: number): string {
  if (!rawId) return 'V10001';
  if (/^V\d{5,}$/i.test(rawId)) {
    return rawId.toUpperCase();
  }
  if (typeof index === 'number' && index >= 0) {
    return `V${10001 + index}`;
  }
  let hash = 0;
  for (let i = 0; i < rawId.length; i++) {
    hash = (hash * 31 + rawId.charCodeAt(i)) & 0x7fffffff;
  }
  const code = 10001 + (hash % 89999);
  return `V${code}`;
}

export async function submitEnquiry(
  data: SubmitEnquiryData
): Promise<SubmitEnquiryResponse> {
  const sanitizedData = {
    customer_name: data.customer_name.trim(),
    email: data.email.trim().toLowerCase(),
    mobile: data.mobile.trim(),
    message: data.message.trim(),
  };

  const formattedRefId = getNextSequenceNumber();

  // If Supabase is fully configured, execute real backend integration
  if (isSupabaseConfigured) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const customFunctionUrl = import.meta.env.VITE_SUPABASE_FUNCTION_URL;
    const functionUrl = customFunctionUrl || `${supabaseUrl}/functions/v1/submit-enquiry`;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    try {
      // 1. Attempt to invoke Supabase Edge Function for end-to-end processing (DB + Resend + Twilio)
      const edgeRes = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          ...sanitizedData,
          reference_id: formattedRefId,
        }),
      });

      if (edgeRes.ok) {
        const edgeJson = await edgeRes.json();
        return {
          success: true,
          enquiry_id: formattedRefId,
          raw_uuid: edgeJson.enquiry_id,
          created_at: edgeJson.created_at,
          email_status: edgeJson.email_status || 'SENT',
          sms_status: edgeJson.sms_status || 'SENT',
          message:
            edgeJson.message ||
            'Thank you for contacting VENUS. Your enquiry has been received successfully. Our team will review your request.',
        };
      } else {
        const errJson = await edgeRes.json().catch(() => null);
        console.warn('Edge function returned error, falling back to direct table insertion:', errJson);
      }
    } catch (edgeErr) {
      console.warn('Edge function invoke attempt failed or not yet deployed; falling back to direct Supabase table insertion:', edgeErr);
    }

    // 2. Direct database insertion via Supabase client (using Row Level Security INSERT policy)
    const { data: insertedData, error: dbError } = await supabase
      .from('enquiries')
      .insert({
        customer_name: sanitizedData.customer_name,
        email: sanitizedData.email,
        mobile: sanitizedData.mobile,
        message: sanitizedData.message,
        email_status: 'PENDING: Awaiting Edge Function Dispatch',
        sms_status: 'PENDING: Awaiting Edge Function Dispatch',
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    return {
      success: true,
      enquiry_id: formattedRefId,
      raw_uuid: insertedData.id,
      created_at: insertedData.created_at,
      email_status: insertedData.email_status,
      sms_status: insertedData.sms_status,
      message:
        'Thank you for contacting VENUS. Your enquiry has been received successfully. Our team will review your request.',
    };
  }

  // 3. Fallback when Supabase credentials are pending in local environment
  const mockId = crypto.randomUUID();
  const now = new Date().toISOString();
  const localRecord: EnquiryRecord = {
    id: mockId,
    reference_id: formattedRefId,
    customer_name: sanitizedData.customer_name,
    email: sanitizedData.email,
    mobile: sanitizedData.mobile,
    message: sanitizedData.message,
    created_at: now,
    email_status: 'PENDING: Configure RESEND_API_KEY in Supabase Edge Secrets',
    sms_status: 'PENDING: Configure TWILIO credentials in Supabase Edge Secrets',
  };

  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    existing.unshift(localRecord);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
  } catch (storageErr) {
    console.error('Local storage error:', storageErr);
  }

  return {
    success: true,
    enquiry_id: formattedRefId,
    raw_uuid: mockId,
    created_at: now,
    email_status: localRecord.email_status,
    sms_status: localRecord.sms_status,
    message:
      'Thank you for contacting VENUS. Your enquiry has been received successfully. Our team will review your request.',
    is_demo: true,
  };
}

export function getLocalEnquiries(): EnquiryRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}
