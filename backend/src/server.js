import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (important for Render deployment)
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(morgan('dev'));

// CORS configuration
const allowedOrigins = process.env.ALLOW_ORIGINS
    ? process.env.ALLOW_ORIGINS.split(',')
    : ['http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({
        message: '🌊 Devine Water API',
        version: '1.0.0',
        status: 'running',
    });
});

app.get('/api', (req, res) => {
    res.json({
        message: 'Devine Water Management System API',
        endpoints: {
            auth: '/api/auth',
            customers: '/api/customers',
            users: '/api/users',
            billing: '/api/billing',
            consumption: '/api/consumption',
            complaints: '/api/complaints',
        },
    });
});

// API Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorMiddleware);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS allowed origins: ${allowedOrigins.join(', ')}`);
});

export default app;
