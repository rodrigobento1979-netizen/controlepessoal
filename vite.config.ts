import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

const DB_FILE_PATH = path.resolve(__dirname, 'data', 'database.json');

// Middleware embutido para responder à rota /api/sync e persistir no JSON físico do sistema
function apiSyncPlugin(): Plugin {
  // Inicialização / leitura segura do arquivo JSON no disco
  function readDbFromDisk() {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[DB JSON] Erro ao ler database.json:', err);
    }
    return null;
  }

  function writeDbToDisk(data: any) {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('[DB JSON] Erro ao salvar database.json no disco:', err);
      return false;
    }
  }

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
              const enrichedData = {
                ...data,
                serverSavedAt: new Date().toISOString(),
                serverSavedAtFormatted: new Date().toLocaleString('pt-BR'),
                lastModifiedDevice: req.headers['user-agent']?.includes('Mobile') ? 'Mobile' : 'Desktop',
              };

              // Grava fisicamente no disco no arquivo JSON
              writeDbToDisk(enrichedData);

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                message: 'Dados gravados com sucesso no banco de dados JSON do sistema.',
                timestamp: new Date().toLocaleString('pt-BR'),
                storageType: 'Sistema JSON (data/database.json)',
                clientsCount: enrichedData.clients?.length || 0,
                expensesCount: enrichedData.expenses?.length || 0,
              }));
            } catch (e: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'JSON inválido: ' + e?.message }));
            }
          });
          return;
        }

        if (req.method === 'GET') {
          const dbData = readDbFromDisk();
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            data: dbData,
            storageType: 'Sistema JSON (data/database.json)',
            message: dbData ? 'Dados JSON recuperados com sucesso do banco de dados do sistema!' : 'Nenhum dado salvo no servidor ainda.',
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
