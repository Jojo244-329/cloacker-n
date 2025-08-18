const express = require('express');
const router = express.Router();
const requestIp = require('request-ip');
const useragent = require('useragent');

// Middleware anti-bot / anti-clone
router.use((req, res, next) => {
  const ip = requestIp.getClientIp(req);
  const ua = req.headers['user-agent'] || '';
  const referer = req.get('referer') || '';
  const bait = req.query._ || ''; // honeypot

  const parsed = useragent.parse(ua);
  const device = parsed.device.toString().toLowerCase();

  const isBot = /(bot|crawler|spider|facebook|whatsapp|telegram|discord|slack|preview|curl|axios|python|node-fetch|datadome|monitor)/i.test(ua);
  const isTiktokBot = /(tiktok|adsbot|bytehouse|ads-tiktok)/i.test(ua);
  const devToolsOpen = ua.includes('HeadlessChrome') || ua.includes('puppeteer');

  // Bloqueios principais
  if (isBot || isTiktokBot || bait === 'trap' || devToolsOpen) {
    console.warn(`🧠 BLOQUEIO: IP ${ip} - UA: ${ua} - Device: ${device}`);
    return res.status(403).send('⛔ Você não tem permissão pra acessar isso aqui, maluco.');
  }

  // Referer: só bloqueia se for claramente suspeito
  const badReferer = /(scanner|antivirus|virustotal|crawler)/i.test(referer);
  if (badReferer) {
    return res.status(403).send('🚫 Referer suspeito detectado.');
  }

  next();
});

// Página protegida
router.get('/:slug', async (req, res) => {
  const slugData = await redisClient.get(`slug:${req.params.slug}`);
  if (!slugData) return res.status(404).send('Link expirado ou inválido');

  const ip = requestIp.getClientIp(req);
  const ua = req.headers['user-agent'] || 'unknown';
  const ref = req.get('referer') || 'direct';
  const time = new Date().toISOString();
  const parsedUA = useragent.parse(ua);
  const device = parsedUA.device.toString();

  const data = JSON.parse(slugData);
  const { destino, utm } = data;

  await trackClick(req.params.slug, { ip, ua, ref, time, utm: utm || '', device });

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>G1 - Últimas notícias</title>
    </head>
    <body>
      <h1>Notícias de Hoje</h1>
      <p>Atualizações em tempo real do Brasil e do mundo.</p>
      <script>
        // Cookie validando humano
        document.cookie = "approved=ok; path=/; max-age=600; SameSite=Lax";
        // Redireciona pro destino real
        window.location.replace("${destino}");
      </script>
      <noscript>
        <meta http-equiv="refresh" content="0;url=${destino}" />
      </noscript>
    </body>
    </html>
  `);
});

module.exports = router;
