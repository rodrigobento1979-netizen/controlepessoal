// Endpoint Serverless da Vercel para Sincronização e Persistência do JSON
import type { Request, Response } from 'express';

// Cache em memória para instâncias ativas
let cloudCache: any = null;

const STORAGE_KEY = 'contr_clientes_main_db';

export default async function handler(req: any, res: any) {
  // Configuração de CORS para permitir requisições seguras
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Verifica se há Vercel KV configurado no ambiente
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  // 1. SALVAR DADOS NO JSON DA VERCEL (POST)
  if (req.method === 'POST') {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const enrichedData = {
        ...data,
        serverSavedAt: new Date().toISOString(),
        serverSavedAtFormatted: new Date().toLocaleString('pt-BR'),
        stats: {
          totalClients: data.clients?.length || 0,
          totalExpenses: data.expenses?.length || 0,
        }
      };

      cloudCache = enrichedData;

      // Se o Vercel KV estiver ativo na conta do usuário, grava na nuvem permanente
      if (kvUrl && kvToken) {
        try {
          await fetch(`${kvUrl}/set/${STORAGE_KEY}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${kvToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(enrichedData),
          });
        } catch (kvErr) {
          console.warn('Vercel KV write fallback:', kvErr);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Base de dados JSON sincronizada com sucesso na Vercel.',
        timestamp: new Date().toLocaleString('pt-BR'),
        clientsCount: enrichedData.stats.totalClients,
        expensesCount: enrichedData.stats.totalExpenses,
        storageType: kvUrl ? 'Vercel KV (Persistência Permanente)' : 'Vercel Serverless Cache',
      });
    } catch (e: any) {
      return res.status(400).json({
        success: false,
        message: 'Falha ao processar e salvar JSON na Vercel: ' + e?.message,
      });
    }
  }

  // 2. BUSCAR DADOS DO JSON DA VERCEL (GET)
  if (req.method === 'GET') {
    // Se o Vercel KV estiver ativo, busca da nuvem permanente
    if (kvUrl && kvToken) {
      try {
        const kvRes = await fetch(`${kvUrl}/get/${STORAGE_KEY}`, {
          headers: {
            Authorization: `Bearer ${kvToken}`,
          },
        });
        if (kvRes.ok) {
          const kvData = await kvRes.json();
          if (kvData && kvData.result) {
            const parsed = typeof kvData.result === 'string' ? JSON.parse(kvData.result) : kvData.result;
            return res.status(200).json({
              success: true,
              data: parsed,
              storageType: 'Vercel KV',
              message: 'Dados recuperados com sucesso do Vercel KV.',
            });
          }
        }
      } catch (kvErr) {
        console.warn('Vercel KV read fallback:', kvErr);
      }
    }

    // Retorna do cache de memória serverless
    if (cloudCache) {
      return res.status(200).json({
        success: true,
        data: cloudCache,
        storageType: 'Vercel Serverless Cache',
        message: 'Dados recuperados do cache da Vercel.',
      });
    }

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Nenhum backup em JSON registrado no servidor no momento.',
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

