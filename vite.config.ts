import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { processEnquirySubmission, getAllEnquiries } from './server/enquiryHandler.ts';

function enquiryBackendPlugin() {
  const handler = async (req: any, res: any, next: any) => {
    const url = req.url?.split('?')[0];

    // Handle submit enquiry endpoint
    if (url === '/api/submit-enquiry' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body || '{}');
          const result = await processEnquirySubmission(parsed);
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = result.status;
          res.end(JSON.stringify(result.body));
        } catch (err: any) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message || 'Server error' }));
        }
      });
      return;
    }

    // Handle fetch enquiries endpoint
    if (url === '/api/enquiries' && req.method === 'GET') {
      try {
        const records = getAllEnquiries();
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify(records));
      } catch (err: any) {
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    next();
  };

  return {
    name: 'enquiry-backend-plugin',
    configureServer(server: any) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server: any) {
      server.middlewares.use(handler);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables into process.env for server-side handlers
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      tailwindcss(),
      enquiryBackendPlugin(),
    ],
  };
});
