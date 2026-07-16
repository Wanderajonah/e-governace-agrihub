const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const mountRoutes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const swaggerSpec = require('./docs/swagger');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
});

app.use('/api', limiter);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'AgriHub API is running', docs: '/api-docs', health: '/api/health' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

mountRoutes(app);

app.use(errorHandler);

module.exports = app;
