import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { initSocket } from './events/socket.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import organizationRoutes from './routes/organization.routes.js';
import incidentRoutes from './routes/incident.routes.js';
import hospitalRoutes from './routes/hospital.routes.js';
import ambulanceRoutes from './routes/ambulance.routes.js';
import adminRoutes from './routes/admin.routes.js';
import dispatchRoutes from './routes/dispatch.routes.js';
import staffApplicationRoutes from './routes/staffApplication.routes.js';
import policeAdminRoutes from './routes/policeAdmin.routes.js';
import fireAdminRoutes from './routes/fireAdmin.routes.js';
import departmentEmergencyRequestRoutes from './routes/departmentEmergencyRequest.routes.js';
import disasterAdminRoutes from './routes/disasterAdmin.routes.js';
import ngoAdminRoutes from './routes/ngoAdmin.routes.js';
import shelterAdminRoutes from './routes/shelterAdmin.routes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API Base Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organizations', organizationRoutes);
app.use('/api/v1/incidents', incidentRoutes);
app.use('/api/v1/hospitals', hospitalRoutes);
app.use('/api/v1/ambulances', ambulanceRoutes);
app.use('/api/v1/operations', adminRoutes);
app.use('/api/v1/dispatch', dispatchRoutes);
app.use('/api/v1/staff-applications', staffApplicationRoutes);
app.use('/api/v1/police-admin', policeAdminRoutes);
app.use('/api/v1/fire-admin', fireAdminRoutes);
app.use('/api/v1/emergency-requests', departmentEmergencyRequestRoutes);
app.use('/api/v1/disaster-admin', disasterAdminRoutes);
app.use('/api/v1/ngo-admin', ngoAdminRoutes);
app.use('/api/v1/shelter-admin', shelterAdminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    platform: 'ResQOne Emergency Response & Disaster Management',
    architecture: 'Public Citizen Auth + Restricted Department RBAC + Organization Onboarding',
    timestamp: new Date().toISOString()
  });
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ResQOne Server Error]', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5001;

// Connect database and start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[ResQOne] Node.js/Express server active on http://localhost:${PORT}`);
  });
});
