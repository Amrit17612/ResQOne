import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
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

export const createTestServer = async (port = 5002) => {
  const testMongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/resqone_test';

  // Strict safety check: Must contain resqone_test and must NOT end with /resqone
  if (!testMongoUri.includes('resqone_test') || testMongoUri.endsWith('/resqone')) {
    throw new Error(`CRITICAL TEST DATABASE SAFETY VIOLATION: Test server attempted to use "${testMongoUri}". Tests MUST run exclusively on "resqone_test".`);
  }

  // Connect dedicated test database
  const conn = await mongoose.connect(testMongoUri);
  if (conn.connection.name !== 'resqone_test') {
    throw new Error(`CRITICAL TEST SAFETY VIOLATION: Connected to database "${conn.connection.name}" instead of "resqone_test"! Aborting.`);
  }
  console.log(`[ResQOne Test Server] Dedicated Test Database Connected: ${conn.connection.name}`);

  const app = express();
  const server = http.createServer(app);

  initSocket(server);

  app.use(helmet());
  app.use(cors({ origin: '*', credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Attach test identifier middleware
  app.use((req, res, next) => {
    res.setHeader('X-ResQOne-Environment', 'TEST_SANDBOX');
    res.setHeader('X-ResQOne-Database', 'resqone_test');
    next();
  });

  // API Routes
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
      environment: 'TEST_SANDBOX',
      database: mongoose.connection.name,
      platform: 'ResQOne Emergency Response & Disaster Management',
      timestamp: new Date().toISOString()
    });
  });

  // Global 404 handler
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    res.status(500).json({ success: false, message: err.message || 'Internal Test Server Error' });
  });

  await new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`[ResQOne Test Server] Isolated Test HTTP Server active on http://localhost:${port} -> mongodb://127.0.0.1:27017/resqone_test`);
      resolve();
    });
  });

  return {
    server,
    port,
    close: async () => {
      await new Promise((resolve) => server.close(resolve));
      await mongoose.disconnect();
      console.log(`[ResQOne Test Server] Test server on port ${port} closed safely.`);
    }
  };
};

// Standalone start support if executed directly via CLI
if (process.argv[1]?.endsWith('testServer.js')) {
  const PORT = process.env.TEST_PORT || 5002;
  createTestServer(PORT).catch((err) => {
    console.error('[ResQOne Test Server Startup Error]', err);
    process.exit(1);
  });
}

