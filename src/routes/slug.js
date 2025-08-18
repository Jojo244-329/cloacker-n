const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { redisClient } = require('../config');
const requestIp = require('request-ip');
const useragent = require('useragent');
const { trackClick } = require('../services/trackingService');
const gatekeeper = require('../middlewares/gatekeeper');


// POST /gerar-slug
router.post('/gerar-slug', async (req, res) => {
  let { cliente, geo, utm, destino } = req.body;

  // Se destino direto não foi passado, monta a URL
  if (!destino) {
    if (!cliente || !geo || !utm) {
      return res.status(400).json({ erro: 'Você deve fornecer ou um destino direto, ou cliente, geo e utm.' });
    }
    destino = `https://quiztikoficial.shop/tiktokofc/${cliente}/${geo}/?utm_source=${encodeURIComponent(utm)}`;
  }

  const slug = crypto.randomBytes(6).toString('hex');
  await redisClient.set(`slug:${slug}`, JSON.stringify({ destino, utm }));

  res.json({
  slug,
  link: `${req.protocol}://${req.get('host')}/${slug}`,
  destino
  });

});

// GET /:slug
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

  
  res.send(`
    <script>
      sessionStorage.setItem('approved', 'ok');
      window.location.href = '${destino}';
    </script>
  `);
});

module.exports = router;
