const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { port, redisClient } = require('./config');

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
const gatekeeper = require('./middlewares/gatekeeper');
const cloakRoute = require('./routes/cloak'); // (reservado)
const secretRoute = require('./routes/areaSecreta');
const slugRoute = require('./routes/slug');

app.use('/cloak', gatekeeper, cloakRoute);     // futuro uso
app.use('/x7as2j', gatekeeper, secretRoute);   // rota secreta
app.use('/', slugRoute);                      // slug handler

(async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis conectado com sucesso');

    app.listen(port, () => {
      console.log(`🔥 Cloaker rodando na porta ${port}`);
    });
  } catch (err) {
    console.error('❌ Falha ao conectar Redis:', err);
  }
})();

