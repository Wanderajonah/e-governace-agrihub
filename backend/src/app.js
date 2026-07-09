import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import mountRoutes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import swaggerSpec from './docs/swagger.js';

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

mountRoutes(app);

app.use(errorHandler);

export default app;
