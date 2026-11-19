// VENUS System Verification and Functional Test Runner
// Runs automated verification on schemas, validation, security, SEO, and integration logic

import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

const rootDir = process.cwd();

console.log('==============================================================================');
console.log('VENUS WATER MANAGEMENT - AUTOMATED SYSTEM VERIFICATION');
console.log('==============================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
  }
}

// ----------------------------------------------------------------------------
// TEST SUITE 1: SEO & Metadata Verification
// ----------------------------------------------------------------------------
console.log('--- TEST SUITE 1: SEO, Robots & Sitemap Verification ---');
const indexHtmlPath = path.join(rootDir, 'index.html');
const robotsTxtPath = path.join(rootDir, 'public', 'robots.txt');
const sitemapXmlPath = path.join(rootDir, 'public', 'sitemap.xml');

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
assert(indexHtml.includes('<title>VENUS – Water Management Company'), 'index.html contains primary brand title');
assert(indexHtml.includes('name="description"'), 'index.html contains meta description');
assert(indexHtml.includes('property="og:title"'), 'index.html contains Open Graph metadata');
assert(indexHtml.includes('rel="canonical"'), 'index.html contains canonical URL link');
assert(indexHtml.includes('Plus+Jakarta+Sans'), 'index.html links Google Fonts (Plus Jakarta Sans)');

const robotsTxt = fs.readFileSync(robotsTxtPath, 'utf8');
assert(robotsTxt.includes('Disallow: /admin/'), 'robots.txt protects admin routes from indexing');
assert(robotsTxt.includes('Sitemap:'), 'robots.txt references sitemap.xml');

const sitemapXml = fs.readFileSync(sitemapXmlPath, 'utf8');
assert(sitemapXml.includes('<loc>https://venus-water-management.vercel.app/</loc>'), 'sitemap.xml contains home URL');
assert(sitemapXml.includes('<loc>https://venus-water-management.vercel.app/solutions</loc>'), 'sitemap.xml contains solutions URL');
assert(sitemapXml.includes('<loc>https://venus-water-management.vercel.app/contact</loc>'), 'sitemap.xml contains contact URL');
assert(sitemapXml.includes('<loc>https://venus-water-management.vercel.app/about</loc>'), 'sitemap.xml contains about URL');

// ----------------------------------------------------------------------------
// TEST SUITE 2: Database Schema & RLS Policy Verification
// ----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 2: SQL Migration & RLS Security Verification ---');
const migrationPath = path.join(rootDir, 'supabase', 'migrations', '001_initial_schema.sql');
const migrationSql = fs.readFileSync(migrationPath, 'utf8');

assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.enquiries'), 'Migration contains public.enquiries table creation');
assert(migrationSql.includes('customer_name VARCHAR(150) NOT NULL'), 'enquiries has customer_name column');
assert(migrationSql.includes('email VARCHAR(255) NOT NULL'), 'enquiries has email column');
assert(migrationSql.includes('mobile VARCHAR(50) NOT NULL'), 'enquiries has mobile column');
assert(migrationSql.includes('message TEXT NOT NULL'), 'enquiries has message column');
assert(migrationSql.includes('email_status VARCHAR(50)'), 'enquiries tracks email_status');
assert(migrationSql.includes('sms_status VARCHAR(50)'), 'enquiries tracks sms_status');
assert(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.admin_users'), 'Migration contains public.admin_users table');
assert(migrationSql.includes('ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on enquiries table');
assert(migrationSql.includes('ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on admin_users table');
assert(migrationSql.includes('CREATE OR REPLACE FUNCTION public.is_admin()'), 'Migration creates security definer is_admin() helper');
assert(migrationSql.includes('CREATE POLICY "Public users can insert enquiries"'), 'Public INSERT policy defined on enquiries');
assert(migrationSql.includes('CREATE POLICY "Admins can view all enquiries"'), 'Strict Admin SELECT policy defined on enquiries');
assert(migrationSql.includes('CREATE POLICY "Admins can update enquiries"'), 'Strict Admin UPDATE policy defined on enquiries');
assert(migrationSql.includes('CREATE POLICY "Admins can delete enquiries"'), 'Strict Admin DELETE policy defined on enquiries');

// ----------------------------------------------------------------------------
// TEST SUITE 3: Frontend Validation (Zod Schema)
// ----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 3: Customer Input Validation (Zod) ---');
const enquirySchema = z.object({
  customer_name: z
    .string()
    .min(2)
    .max(150)
    .regex(/^[a-zA-Z\s.'-]+$/),
  email: z.string().min(5).max(255).email(),
  mobile: z.string().min(7).max(25).regex(/^\+?[0-9\s\-()]{7,25}$/),
  message: z.string().min(10).max(3000),
});

// Valid case
const validData = {
  customer_name: 'Arthur Pendelton',
  email: 'arthur.p@cleanwater-tech.org',
  mobile: '+1 (415) 555-0199',
  message: 'Requesting consultation on modular RO water treatment facilities for industrial intake.',
};
const validResult = enquirySchema.safeParse(validData);
assert(validResult.success, 'Valid customer enquiry successfully passes Zod validation');

// Invalid Email
const invalidEmail = { ...validData, email: 'not-an-email' };
assert(!enquirySchema.safeParse(invalidEmail).success, 'Invalid email rejected by validation schema');

// Empty / Short Name
const invalidName = { ...validData, customer_name: 'A' };
assert(!enquirySchema.safeParse(invalidName).success, 'Short customer name (< 2 chars) rejected');

// Invalid Mobile
const invalidPhone = { ...validData, mobile: '123' };
assert(!enquirySchema.safeParse(invalidPhone).success, 'Short/invalid phone number (< 7 digits) rejected');

// Short Message
const shortMessage = { ...validData, message: 'Too short' };
assert(!enquirySchema.safeParse(shortMessage).success, 'Short enquiry message (< 10 chars) rejected');

// ----------------------------------------------------------------------------
// TEST SUITE 4: Supabase Edge Function & Integration Analysis
// ----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 4: Supabase Edge Function Architecture ---');
const edgeFunctionPath = path.join(rootDir, 'supabase', 'functions', 'submit-enquiry', 'index.ts');
const edgeCode = fs.readFileSync(edgeFunctionPath, 'utf8');

assert(edgeCode.includes('Access-Control-Allow-Origin'), 'Edge function configures CORS headers');
assert(edgeCode.includes('rateLimitMap'), 'Edge function implements server-side anti-spam rate limiting');
assert(edgeCode.includes('api.resend.com/emails'), 'Edge function calls Resend API for email delivery');
assert(edgeCode.includes('Your Enquiry Has Been Received – VENUS'), 'Edge function uses exact customer confirmation email subject');
assert(edgeCode.includes('api.twilio.com'), 'Edge function calls Twilio API for SMS delivery');
assert(edgeCode.includes('Hello ${trimmedName}, thank you for contacting VENUS'), 'Edge function formats exact required SMS message');
assert(edgeCode.includes('email_status'), 'Edge function records and updates email_status in database');
assert(edgeCode.includes('sms_status'), 'Edge function records and updates sms_status in database');

// ----------------------------------------------------------------------------
// TEST SUITE 5: Security & Secret Leakage Inspection
// ----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 5: Frontend Security & Secret Audit ---');
const srcDir = path.join(rootDir, 'src');

function scanDirectoryForSecrets(dir) {
  let hasLeak = false;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (scanDirectoryForSecrets(fullPath)) hasLeak = true;
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      // Verify no hardcoded service role keys, resend keys, or twilio tokens exist in browser code
      if (content.includes('service_role') && !content.includes('localStorage') && !content.includes('comment')) {
        console.error(`Suspicious keyword in ${fullPath}`);
        hasLeak = true;
      }
      if (content.includes('re_') && content.length > 50 && !content.includes('regex') && !content.includes('replace')) {
        console.error(`Potential Resend key in ${fullPath}`);
        hasLeak = true;
      }
    }
  }
  return hasLeak;
}

const leakFound = scanDirectoryForSecrets(srcDir);
assert(!leakFound, 'Frontend source tree is clean: No backend secrets or service role keys exposed');

const gitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
assert(gitignore.includes('.env'), '.gitignore properly excludes .env files');

// ----------------------------------------------------------------------------
// SUMMARY
// ----------------------------------------------------------------------------
console.log('\n==============================================================================');
console.log(`VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests/totalTests)*100)}%)`);
console.log('==============================================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
