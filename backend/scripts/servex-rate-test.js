#!/usr/bin/env node
/*
 * Script de medición de rate limit para Servex
 * Ejecuta bursts de peticiones con intervalos decrecientes y registra cuándo aparecen errores 429
 */
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno desde la raíz del backend
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

typeof process.env.SERVEX_API_KEY === 'string';
const API_KEY = process.env.SERVEX_API_KEY;
const BASE_URL = process.env.SERVEX_API_URL || 'https://servex.ws/api';

if (!API_KEY) {
  console.error('❌ Falta SERVEX_API_KEY en el entorno (.env).');
  process.exit(1);
}

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

const intervals = [5000, 4000, 3000, 2000, 1500, 1200, 1000];
const REQUESTS_PER_STEP = 5;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runBurst(intervalMs) {
  const summary = {
    intervalMs,
    total: 0,
    successes: 0,
    failures: 0,
    firstError: null,
  };

  for (let i = 0; i < REQUESTS_PER_STEP; i += 1) {
    const startedAt = Date.now();
    summary.total += 1;

    try {
      const response = await client.get('/clients', {
        params: {
          limit: 10,
          scope: 'meus',
        },
      });
      console.log(
        `✅ Intervalo ${intervalMs}ms | Request ${i + 1}/${REQUESTS_PER_STEP} | ` +
          `Status ${response.status} | ${response.data?.clients?.length ?? 'n/a'} clientes`
      );
      summary.successes += 1;
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      console.error(
        `⚠️ Intervalo ${intervalMs}ms | Request ${i + 1}/${REQUESTS_PER_STEP} | ` +
          `Status ${status ?? 'desconocido'} | ${message}`
      );
      summary.failures += 1;
      if (!summary.firstError) {
        summary.firstError = { status, message };
      }
      // Si obtenemos 429, no tiene sentido continuar con este intervalo
      if (status === 429) {
        break;
      }
    }

    const elapsed = Date.now() - startedAt;
    const wait = Math.max(0, intervalMs - elapsed);
    if (wait > 0 && i < REQUESTS_PER_STEP - 1) {
      await sleep(wait);
    }
  }

  return summary;
}

async function main() {
  console.log('🚀 Iniciando test de rate limit contra Servex');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Intervals: ${intervals.join(', ')} ms`);
  console.log('--------------------------------------------------');

  const results = [];

  for (const interval of intervals) {
    console.log(`\n⏱️  Probando intervalo de ${interval} ms`);
    const summary = await runBurst(interval);
    results.push(summary);

    if (summary.firstError && summary.firstError.status === 429) {
      console.log('\n🚫 Se detectó HTTP 429. Deteniendo pruebas.');
      break;
    }
  }

  console.log('\n📊 Resumen final');
  results.forEach((result) => {
    const { intervalMs, total, successes, failures, firstError } = result;
    console.log(
      `- Intervalo ${intervalMs} ms -> éxitos: ${successes}/${total}, ` +
        `fallos: ${failures}, primer error: ${firstError ? `${firstError.status} (${firstError.message})` : 'ninguno'}`
    );
  });

  console.log('\n✅ Test completado');
}

main().catch((error) => {
  console.error('❌ Error inesperado en el test:', error);
  process.exit(1);
});
