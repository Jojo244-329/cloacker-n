const asyncHandler = require('express-async-handler');

module.exports = asyncHandler(async (req, res, next) => {
  const userAgent = req.headers['user-agent']?.toLowerCase() || '';
  const referer = req.headers['referer'] || '';

  const isBot = /(bot|crawler|spider|facebook|preview|whatsapp|telegram|discord|slack|python|go-http-client)/i.test(userAgent);
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
  const isTiktokBot = /(tiktok|bytehouse|adsbot|ads-tiktok|curl|node-fetch|axios|monitor|datadome)/i.test(userAgent);

  // ATENÇÃO: sessionStorage NÃO é visível no servidor — então só bots e desktops serão bloqueados aqui
  if (isBot || isTiktokBot) {
    return res.status(403).send('Acesso negado (bot).');
  }

  if (isDesktop) {
    return res.status(403).send('Acesso negado (desktop).');
  }

  if (!isMobile) {
  return res.send('Acesso negado (desktop).');
  } 

  next();
});
