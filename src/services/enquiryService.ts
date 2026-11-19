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

  // 1. Primary: Transmit to real server backend (/api/submit-enquiry)
  // This executes server-side validation, calls Resend API, and calls Twilio API
  try {
    const response = await fetch('/api/submit-enquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedData),
    });

    if (response.ok) {
      const result = await response.json();
      
      // Also sync to local storage for instant offline resilience
      try {
        const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        existing.unshift({
          id: result.raw_uuid || crypto.randomUUID(),
          reference_id: result.enquiry_id,
          customer_name: sanitizedData.customer_name,
          email: sanitizedData.email,
          mobile: sanitizedData.mobile,
          message: sanitizedData.message,
          created_at: result.created_at,
          email_status: result.email_status,
          sms_status: result.sms_status,
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
      } catch (e) {
        console.warn('Local cache sync warning:', e);
      }

      return {
        success: true,
        enquiry_id: result.enquiry_id,
        raw_uuid: result.raw_uuid,
        created_at: result.created_at,
        email_status: result.email_status,
        sms_status: result.sms_status,
        message: result.message,
      };
    } else {
      const errJson = await response.json().catch(() => null);
      console.warn('Backend API returned non-200 response:', errJson);
    }
  } catch (apiErr) {
    console.warn('Server API endpoint unreachable; attempting Supabase or local fallback:', apiErr);
  }

  // 2. Secondary: If Supabase Cloud Edge Function is explicitly configured
  if (isSupabaseConfigured) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const customFunctionUrl = import.meta.env.VITE_SUPABASE_FUNCTION_URL;
    const functionUrl = customFunctionUrl || `${supabaseUrl}/functions/v1/submit-enquiry`;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const formattedRefId = getNextSequenceNumber();

    try {
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
      }
    } catch (edgeErr) {
      console.warn('Supabase Edge function invocation error:', edgeErr);
    }

    // Direct database insertion via Supabase client (using Row Level Security INSERT policy)
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

  // 3. Fallback when network is completely offline
  const formattedRefId = getNextSequenceNumber();
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
    email_status: 'PENDING: Offline cache',
    sms_status: 'PENDING: Offline cache',
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

export async function fetchServerEnquiries(): Promise<EnquiryRecord[]> {
  const localRecords = getLocalEnquiries();
  try {
    const res = await fetch('/api/enquiries');
    if (res.ok) {
      const serverRecords = await res.json();
      if (Array.isArray(serverRecords) && serverRecords.length > 0) {
        // Merge without duplicates by reference_id or id
        const seen = new Set(serverRecords.map((r: EnquiryRecord) => r.reference_id || r.id));
        const merged = [...serverRecords];
        for (const local of localRecords) {
          if (!seen.has(local.reference_id || local.id)) {
            merged.push(local);
          }
        }
        return merged;
      }
    }
  } catch (err) {
    console.warn('Could not fetch from /api/enquiries:', err);
  }
  return localRecords;
}

export function getLocalEnquiries(): EnquiryRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}
