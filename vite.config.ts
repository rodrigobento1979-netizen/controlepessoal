import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// Middleware embutido para responder à rota /api/sync no servidor Vite
function apiSyncPlugin(): Plugin {
  let devCloudData: any = null;

  return {
    name: 'api-sync-dev-server',
    configureServer(server) {
      server.middlewares.use('/api/sync', (req, res, next) => {
        // Headers de CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              devCloudData = {
                ...data,
                serverSavedAt: new Date().toISOString(),
                serverSavedAtFormatted: new Date().toLocaleString('pt-BR'),
              };
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                message: 'Dados salvos com sucesso na nuvem Vercel / Servidor.',
                timestamp: new Date().toLocaleString('pt-BR'),
                storageType: 'Vercel Serverless / Cloud Sync',
                clientsCount: devCloudData.clients?.length || 0,
                expensesCount: devCloudData.expenses?.length || 0,
              }));
            } catch (e: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'JSON inválido: ' + e?.message }));
            }
          });
          return;
        }

        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            data: devCloudData,
            storageType: 'Vercel Serverless / Cloud Sync',
            message: devCloudData ? 'Dados JSON recuperados da nuvem!' : 'Nenhum dado salvo no servidor ainda.',
          }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiSyncPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
