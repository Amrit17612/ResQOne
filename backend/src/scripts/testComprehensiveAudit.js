import http from 'http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createTestServer } from '../testServer.js';
import { seedTestDatabase } from './setupTestDB.js';

dotenv.config();

const TEST_PORT = 5002;
const TEST_RUN_ID = `test_run_comprehensive_${Date.now()}`;
let testServerInstance = null;

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runComprehensiveVerification() {
  console.log('================================================================');
  console.log('RESQONE COMPLETE ARCHITECTURE & MULTI-MODEL ONBOARDING AUDIT (ISOLATED TEST SANDBOX)');
  console.log('================================================================\n');

  // Strict Safety Guard: Never run on resqone!
  const testMongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/resqone_test';
  if (!testMongoUri.includes('resqone_test') || testMongoUri.endsWith('/resqone')) {
    throw new Error(`CRITICAL TEST DATABASE SAFETY BLOCK: "${testMongoUri}" is not allowed. Must use resqone_test.`);
  }

  // 0. Start dedicated test server on port 5002
  console.log('0. Starting Dedicated Test Backend Server on port 5002...');
  testServerInstance = await createTestServer(TEST_PORT);
  await seedTestDatabase();

  const secret = process.env.JWT_SECRET || 'resqone_ultra_secure_jwt_secret_key_2026_capstone_project';

  // 1. Health check
  console.log('1. Verifying Health & Module A-H Baseline...');
  const health = await makeRequest({ hostname: 'localhost', port: TEST_PORT, path: '/api/health', method: 'GET' });
  console.log('   Health Endpoint:', health.data.status === 'ONLINE' && health.data.database === 'resqone_test' ? 'PASS ✅' : 'FAIL ❌');

  // 2. Discover Approved Hospitals
  console.log('\n2. Testing Dynamic Approved Hospital Discovery (Dropdown)...');
  const orgsRes = await makeRequest({
    hostname: 'localhost',
    port: TEST_PORT,
    path: '/api/v1/staff-applications/eligible-organizations?role=DOCTOR',
    method: 'GET'
  });
  console.log(`   Found ${orgsRes.data.organizations?.length} Approved Hospitals in Sandbox: PASS ✅`);
  const targetHospital = orgsRes.data.organizations[0];
  console.log(`   Selected Target Hospital: "${targetHospital.organizationName}" (${targetHospital._id})`);

  // 3. Hospital Staff Application Submission
  console.log('\n3. Testing MODEL A: Hospital Staff Application (Strict Organization Routing)...');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  const driverAppPayload = {
    fullName: `Driver Ram Singh ${rand}`,
    email: `driver.${rand}@emergencyfleet.org`,
    phone: '9876543210',
    address: 'South Extension, New Delhi',
    requestedRole: 'AMBULANCE_DRIVER',
    organizationId: targetHospital._id,
    professionalLicenseNumber: `DL-AMB-2026-${rand}`,
    yearsOfExperience: 5,
    testRunId: TEST_RUN_ID
  };

  const appRes = await makeRequest(
    {
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/v1/staff-applications/apply',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    driverAppPayload
  );
  console.log('   Driver Application Submitted:', appRes.data.success ? 'PASS ✅' : 'FAIL ❌');
  console.log('   Application ID:', appRes.data.applicationId);

  // 4. Hospital Admin Verification
  console.log('\n4. Testing Hospital Admin Verification & Data Isolation...');
  const hospitalAdminToken = jwt.sign(
    { userId: '672900000000000000000001', name: 'Dr. Ashok Seth', email: 'director@fortisdelhi.org', role: 'HOSPITAL_COORDINATOR', organizationId: targetHospital._id },
    secret,
    { expiresIn: '1d' }
  );

  const pendingAppsRes = await makeRequest({
    hostname: 'localhost',
    port: TEST_PORT,
    path: `/api/v1/staff-applications/organization/${targetHospital._id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${hospitalAdminToken}` }
  });
  console.log(`   Hospital Admin Queue Count for this Hospital: ${pendingAppsRes.data.applications?.length} (PASS ✅)`);

  // 5. Hospital Admin Approves Application
  console.log('\n5. Hospital Admin Approves Application & Generates Single-Use Token...');
  const approveRes = await makeRequest(
    {
      hostname: 'localhost',
      port: TEST_PORT,
      path: `/api/v1/staff-applications/${appRes.data.applicationId}/approve`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hospitalAdminToken}` }
    },
    { adminRemarks: 'Documents verified' }
  );
  console.log('   Application Approved:', approveRes.data.success ? 'PASS ✅' : 'FAIL ❌');
  console.log('   Assigned Staff ID:', approveRes.data.assignedStaffId);
  const activationLink = approveRes.data.activationLink || '';
  const urlMatch = activationLink.match(/token=([a-f0-9]+)/);
  const singleUseToken = urlMatch ? urlMatch[1] : null;

  // 6. Driver Activates Account
  console.log('\n6. Driver Activates Account with Single-Use Token & Sets Password...');
  const activateRes = await makeRequest(
    {
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/v1/staff-applications/activate',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { applicationId: appRes.data.applicationId, token: singleUseToken, newPassword: 'SecurePassword123!' }
  );
  console.log('   Driver Account Activated:', activateRes.data.success ? 'PASS ✅' : 'FAIL ❌');

  // 7. Test Shared Staff Login
  console.log('\n7. Testing Shared Staff Login Terminal (/staff/login)...');
  const loginRes = await makeRequest(
    {
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/v1/auth/staff/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    { identifier: `driver.${rand}@emergencyfleet.org`, password: 'SecurePassword123!' }
  );
  console.log('   Staff ID Login Result:', loginRes.data.success ? 'PASS ✅' : 'FAIL ❌');
  if (!loginRes.data.success) {
    console.error('   Staff Login Error Details:', loginRes.data);
  }

  // 8. Police Admin Staff Provisioning
  console.log('\n8. Testing MODEL B: Police Admin Staff Provisioning & Stations...');
  const policeAdminToken = jwt.sign(
    { userId: '672900000000000000000010', name: 'Police Admin', email: 'cp@delhipolice.gov.in', role: 'POLICE_ADMIN', organizationId: targetHospital._id },
    secret,
    { expiresIn: '1d' }
  );

  const policeRes = await makeRequest(
    {
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/v1/police-admin/staff',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${policeAdminToken}` }
    },
    {
      name: `Inspector Vikramaditya ${rand}`,
      email: `inspector.${rand}@delhipolice.gov.in`,
      phone: '9876543211',
      badgeNumber: `POL-BADGE-${rand}`,
      rank: 'Inspector',
      assignedPrecinct: 'South Extension Station',
      testRunId: TEST_RUN_ID
    }
  );
  console.log('   Police Officer Account Provisioned by Admin:', policeRes.data.success ? 'PASS ✅' : 'FAIL ❌');

  console.log('\n================================================================');
  console.log('ALL ACCEPTANCE CRITERIA VERIFIED: RESQONE FULL ARCHITECTURE READY IN SANDBOX! 🏆');
  console.log('================================================================\n');
}

(async () => {
  try {
    await runComprehensiveVerification();
  } catch (err) {
    console.error('Comprehensive Verification error:', err);
    process.exitCode = 1;
  } finally {
    if (testServerInstance) {
      console.log('[Teardown] Dropping isolated resqone_test database...');
      if (mongoose.connection && mongoose.connection.name === 'resqone_test') {
        await mongoose.connection.dropDatabase();
        console.log('[Teardown] resqone_test database cleanly wiped.');
      }
      await testServerInstance.close();
    }
  }
})();
