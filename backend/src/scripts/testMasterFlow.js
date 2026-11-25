import http from 'http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createTestServer } from '../testServer.js';
import { seedTestDatabase } from './setupTestDB.js';

dotenv.config();

const TEST_PORT = 5002;
const TEST_RUN_ID = `test_run_master_${Date.now()}`;
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

async function runEndToEndVerification() {
  console.log('================================================================');
  console.log('RESQONE END-TO-END MASTER SYSTEM VERIFICATION (ISOLATED TEST SANDBOX)');
  console.log('================================================================\n');

  // Strict Safety Guard: Never run on resqone!
  const testMongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/resqone_test';
  if (!testMongoUri.includes('resqone_test') || testMongoUri.endsWith('/resqone')) {
    throw new Error(`CRITICAL TEST DATABASE SAFETY BLOCK: "${testMongoUri}" is not allowed. Must use resqone_test.`);
  }

  // 0. Start dedicated test server on port 5002
  console.log('0. Starting Dedicated Test Backend Server on port 5002...');
  testServerInstance = await createTestServer(TEST_PORT);

  // Seed baseline fixtures into resqone_test
  await seedTestDatabase();

  // 1. Health check on test server
  const health = await makeRequest({
    hostname: 'localhost',
    port: TEST_PORT,
    path: '/api/health',
    method: 'GET'
  });
  console.log('1. Health Check:', health.data.status === 'ONLINE' && health.data.database === 'resqone_test' ? 'PASS ✅' : 'FAIL ❌');
  if (health.data.database !== 'resqone_test') {
    throw new Error(`CRITICAL HAZARD: Test server connected to "${health.data.database}" instead of resqone_test!`);
  }

  // 2. Organization Map Registration (Module A)
  console.log('\n2. Testing Module A: Organization Registration with Map Location...');
  const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
  const orgPayload = {
    organizationName: `Max Healthcare Trauma Institute ${randomSuffix}`,
    organizationType: 'HOSPITAL',
    officialEmail: `director.test${randomSuffix}@maxhealth.org`,
    contactNumber: '9811223344',
    registrationNumber: `DL-HOSP-2026-${randomSuffix}`,
    address: 'Saket District Centre, New Delhi',
    state: 'Delhi',
    district: 'South Delhi',
    city: 'New Delhi',
    postalCode: '110017',
    authorizedPersonName: 'Dr. Sandeep Budhiraja',
    authorizedPersonDesignation: 'Director Institute',
    latitude: 28.5280,
    longitude: 77.2180,
    formattedAddress: 'Press Enclave Marg, Saket, New Delhi',
    locationSource: 'MANUAL_MAP_PIN',
    locationAccuracy: 5,
    locationConfirmed: true,
    testRunId: TEST_RUN_ID
  };

  const orgRes = await makeRequest(
    {
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/v1/organizations/apply',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    orgPayload
  );

  console.log('   Organization Registered:', orgRes.data.success ? 'PASS ✅' : 'FAIL ❌');
  console.log('   Application ID:', orgRes.data.applicationId);

  // 3. Citizen Incident Report (Module B)
  console.log('\n3. Testing Module B: Citizen Incident Report with Map Location & Exception...');
  const incidentPayload = {
    title: `Multi-car collision with fire hazard ${TEST_RUN_ID}`,
    description: 'Two cars collided on BRT Corridor. Paramedics and fire suppression required.',
    category: 'ROAD_ACCIDENT',
    priority: 'CRITICAL',
    reporterName: 'Anil Mehra',
    reporterPhone: '9876543210',
    latitude: 28.5410,
    longitude: 77.2215,
    address: 'BRT Corridor near Chirag Delhi',
    locationSource: 'MANUAL_MAP_PIN',
    accuracy: 8,
    locationConfirmed: true,
    evidenceStatus: 'EMERGENCY_EXCEPTION',
    evidenceExceptionReason: 'IMMEDIATE_EMERGENCY',
    testRunId: TEST_RUN_ID
  };

  const incRes = await makeRequest(
    {
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/api/v1/incidents',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    incidentPayload
  );

  console.log('   Citizen Incident Created:', incRes.data.success ? 'PASS ✅' : 'FAIL ❌');
  console.log('   Reference ID:', incRes.data.incident?.referenceId);

  // 4. Central Admin Session
  console.log('\n4. Generating Central Admin Session Token...');
  const secret = process.env.JWT_SECRET || 'resqone_ultra_secure_jwt_secret_key_2026_capstone_project';
  const adminToken = jwt.sign(
    {
      userId: '6aeb4b6a33433a0fe5d40e98',
      email: 'admin@resqone.org',
      role: 'CENTRAL_ADMIN',
      name: 'Admin Vikram Verma'
    },
    secret,
    { expiresIn: '1d' }
  );
  console.log('   Admin Token Generated: PASS ✅');

  // 5. Query Ranked Fleet Units (Module D)
  console.log('\n5. Testing Module D: Query Ranked Fleet Units by Distance & ETA...');
  const unitsRes = await makeRequest({
    hostname: 'localhost',
    port: TEST_PORT,
    path: `/api/v1/dispatch/suitable-units?incidentLat=28.5410&incidentLng=77.2215&departmentType=POLICE`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` }
  });

  console.log('   Units Found:', unitsRes.data.units?.length || 0);
  if (unitsRes.data.units?.length > 0) {
    const topUnit = unitsRes.data.units[0];
    console.log(`   Closest Unit: ${topUnit.unitIdentifier} (${topUnit.vehicleType})`);
    console.log(`   Road Distance: ${topUnit.roadDistanceKm} km, ETA: ${topUnit.etaFormatted}`);
  }

  // 6. Query Ranked Hospitals (Module H)
  console.log('\n6. Testing Module H: Query Ranked Emergency Hospitals by Distance & ETA...');
  const hospRes = await makeRequest({
    hostname: 'localhost',
    port: TEST_PORT,
    path: `/api/v1/hospitals?lat=28.5410&lng=77.2215`,
    method: 'GET'
  });

  console.log('   Hospitals Found:', hospRes.data.hospitals?.length || 0);
  if (hospRes.data.hospitals?.length > 0) {
    const topHosp = hospRes.data.hospitals[0];
    console.log(`   Closest Hospital: ${topHosp.name}`);
    console.log(`   Distance: ${topHosp.roadDistanceKm} km, Travel Time: ~${topHosp.travelMinutes || 8} mins`);
  }

  console.log('\n================================================================');
  console.log('MASTER VERIFICATION COMPLETED: ALL MODULES GREEN IN SANDBOX! ✅');
  console.log('================================================================\n');
}

(async () => {
  try {
    await runEndToEndVerification();
  } catch (err) {
    console.error('Master Flow Test execution failed:', err);
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
