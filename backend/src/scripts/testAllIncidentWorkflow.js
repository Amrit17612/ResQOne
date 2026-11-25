/**
 * Complete End-to-End Test Suite for All-Incident Workflows, P0/P1 Fixes,
 * Subcategories, Rescue Routing, Strict Idempotency, and Final Incident Closure.
 */

import axios from 'axios';
import mongoose from 'mongoose';
import { createTestServer } from '../testServer.js';
import { seedTestDatabase } from './setupTestDB.js';
import { signToken } from '../utils/token.js';
import { Incident } from '../models/incident.model.js';
import { DepartmentEmergencyRequest } from '../models/departmentEmergencyRequest.model.js';
import { User } from '../models/user.model.js';
import { IncidentCategory, IncidentSubcategory } from '../constants/enums.js';

const TEST_PORT = 5002;
const API_URL = `http://localhost:${TEST_PORT}/api/v1`;

const log = (step, msg) => console.log(`\x1b[36m[TEST STEP ${step}]\x1b[0m ${msg}`);
const success = (msg) => console.log(`\x1b[32m✔ SUCCESS:\x1b[0m ${msg}`);
const fail = (msg, err) => {
  console.error(`\x1b[31m✖ FAILURE:\x1b[0m ${msg}`, err?.response?.data || err?.message || err);
  process.exit(1);
};

const createMockToken = (userObj) => {
  return signToken({
    userId: userObj._id.toString(),
    email: userObj.email,
    role: userObj.role,
    name: userObj.name,
    departmentType: userObj.departmentType || null,
    organizationId: userObj.organizationId ? userObj.organizationId.toString() : null
  });
};

let testServerInstance = null;

async function runAllIncidentWorkflowVerification() {
  console.log('\n===============================================================');
  console.log('🚀 RESQONE ALL-INCIDENT WORKFLOW & P0/P1 RESOLUTION E2E TESTS (ISOLATED SANDBOX)');
  console.log('===============================================================\n');

  let testTimestamp = null;
  let testRescueIncId = null;
  let testFireIncId = null;

  try {
    testServerInstance = await createTestServer(TEST_PORT);
    await seedTestDatabase();
    console.log(`Database connected for test verification in sandbox: ${mongoose.connection.name}`);

    // 0. Setup Actors (Citizen, Central Admin, Fire Commander)
    const timestamp = Date.now();
    testTimestamp = timestamp;
    let citizen = await User.findOne({ role: 'CITIZEN' });
    if (!citizen) {
      citizen = await User.create({
        name: 'Citizen Tester',
        email: `citizen.tester.${timestamp}@gmail.com`,
        phone: '9876501234',
        passwordHash: 'dummy',
        role: 'CITIZEN',
        isVerified: true
      });
    }

    let centralAdmin = await User.findOne({ role: 'CENTRAL_ADMIN' });
    if (!centralAdmin) {
      centralAdmin = await User.create({
        name: 'Operations Controller',
        email: `central.admin.${timestamp}@resqone.gov.in`,
        phone: '9810012345',
        passwordHash: 'dummy',
        role: 'CENTRAL_ADMIN',
        isVerified: true
      });
    }

    const citizenToken = createMockToken(citizen);
    const adminToken = createMockToken(centralAdmin);
    const citizenAuth = { headers: { Authorization: `Bearer ${citizenToken}` } };
    const adminAuth = { headers: { Authorization: `Bearer ${adminToken}` } };

    // -------------------------------------------------------------
    // TEST 1: P0 Category & Subcategory Schema Compatibility
    // -------------------------------------------------------------
    log('1', 'Testing Submission of newly supported P0 incident categories & subcategories...');

    const categoriesToTest = [
      { cat: IncidentCategory.LANDSLIDE, sub: 'MAJOR_STRUCTURAL_DAMAGE', title: 'Mountain Road Landslide' },
      { cat: IncidentCategory.CYCLONE, sub: 'FLASH_FLOOD', title: 'Severe Coastal Cyclone Storm' },
      { cat: IncidentCategory.CLOUDBURST, sub: 'FLASH_FLOOD', title: 'Himalayan Cloudburst Flash Flood' },
      { cat: IncidentCategory.EVACUATION_REQUIRED, sub: 'MASS_DISPLACEMENT', title: 'Riverbank Evacuation Mandate' },
      { cat: IncidentCategory.RELIEF_REQUIRED, sub: 'FOOD_WATER', title: 'Relief Camp Ration Distribution' },
      { cat: IncidentCategory.FIRE, sub: 'INDUSTRIAL_FIRE', title: 'Major Chemical Warehouse Fire' },
      { cat: IncidentCategory.RESCUE_REQUEST, sub: 'WATER_RESCUE', title: 'River Swimmer Water Rescue' }
    ];

    const createdIncidents = [];

    for (const testItem of categoriesToTest) {
      const res = await axios.post(
        `${API_URL}/incidents`,
        {
          title: `${testItem.title} ${timestamp}`,
          description: `Field testing for category ${testItem.cat} with subcategory ${testItem.sub}.`,
          category: testItem.cat,
          subcategory: testItem.sub,
          priority: 'CRITICAL',
          latitude: 28.6139,
          longitude: 77.2090,
          address: 'Central Connaught Sector, New Delhi'
        },
        citizenAuth
      );

      if (!res.data.success || res.data.incident.category !== testItem.cat) {
        throw new Error(`Failed to submit incident for category ${testItem.cat}`);
      }
      createdIncidents.push(res.data.incident);
    }
    success(`All ${categoriesToTest.length} P0/P1 emergency categories & subcategories accepted by Mongoose and Validator!`);

    // -------------------------------------------------------------
    // TEST 2: P1 Rescue Request Routing Verification
    // -------------------------------------------------------------
    log('2', 'Testing Dedicated P1 RESCUE_REQUEST Routing Engine Rules...');
    const rescueInc = createdIncidents.find((i) => i.category === IncidentCategory.RESCUE_REQUEST);
    testRescueIncId = rescueInc._id;

    const rescueVerifyRes = await axios.patch(
      `${API_URL}/incidents/${rescueInc._id}/verify`,
      { status: 'VERIFIED' },
      adminAuth
    );

    if (!rescueVerifyRes.data.success) throw new Error('Rescue incident verification failed');

    const rescueRequests = await DepartmentEmergencyRequest.find({ incidentId: rescueInc._id });
    const rescueDepts = rescueRequests.map((r) => r.departmentType);

    if (!rescueDepts.includes('FIRE_RESCUE')) throw new Error('RESCUE_REQUEST must route to FIRE_RESCUE');
    if (!rescueDepts.includes('DISASTER_MANAGEMENT')) throw new Error('RESCUE_REQUEST must route to DISASTER_MANAGEMENT');
    if (!rescueDepts.includes('AMBULANCE')) throw new Error('WATER_RESCUE / CRITICAL must conditionally route to AMBULANCE');
    success(`RESCUE_REQUEST successfully dispatched: ${rescueDepts.join(', ')} (no longer falls back to OTHER)!`);

    // -------------------------------------------------------------
    // TEST 3: P1 Fire Incident Support Routing (NGO & Shelter)
    // -------------------------------------------------------------
    log('3', 'Testing P1 Fire Support Routing (Industrial Fire with NGO & Shelter support)...');
    const fireInc = createdIncidents.find((i) => i.category === IncidentCategory.FIRE);
    testFireIncId = fireInc._id;

    const fireVerifyRes = await axios.patch(
      `${API_URL}/incidents/${fireInc._id}/verify`,
      { status: 'VERIFIED' },
      adminAuth
    );

    if (!fireVerifyRes.data.success) throw new Error('Fire incident verification failed');

    const fireRequests = await DepartmentEmergencyRequest.find({ incidentId: fireInc._id });
    const fireDepts = fireRequests.map((r) => r.departmentType);

    if (!fireDepts.includes('FIRE_RESCUE')) throw new Error('Fire must route to FIRE_RESCUE');
    if (!fireDepts.includes('NGO')) throw new Error('Large industrial fire must conditionally request NGO relief support');
    if (!fireDepts.includes('SHELTER')) throw new Error('Large industrial fire must conditionally request Shelter support');
    success(`Fire Support Routing verified: ${fireDepts.join(', ')} including NGO & Shelter!`);

    // -------------------------------------------------------------
    // TEST 4: P1 Routing Idempotency & Duplicate Prevention
    // -------------------------------------------------------------
    log('4', 'Testing P1 Routing Idempotency (Repeated Approval & Concurrent Requests)...');
    const initialRequestCount = await DepartmentEmergencyRequest.countDocuments({ incidentId: fireInc._id });

    // Repeated Verification Call
    await axios.patch(`${API_URL}/incidents/${fireInc._id}/verify`, { status: 'VERIFIED' }, adminAuth);
    // Concurrent Verification Call
    await Promise.all([
      axios.patch(`${API_URL}/incidents/${fireInc._id}/verify`, { status: 'VERIFIED' }, adminAuth),
      axios.patch(`${API_URL}/incidents/${fireInc._id}/verify`, { status: 'VERIFIED' }, adminAuth)
    ]);

    const postRequestCount = await DepartmentEmergencyRequest.countDocuments({ incidentId: fireInc._id });
    if (postRequestCount !== initialRequestCount) {
      throw new Error(`Idempotency violated! Expected ${initialRequestCount} requests, found ${postRequestCount}`);
    }
    success(`Strict Idempotency Verified! Zero duplicate requests generated across repeated and concurrent calls.`);

    // -------------------------------------------------------------
    // TEST 5: P1 Authorized Central Admin Final Incident Closure
    // -------------------------------------------------------------
    log('5', 'Testing P1 Final Incident Closure Safety & Debrief Workflow...');

    // 5a. Attempt closure while mandatory departments are still active (Must be blocked)
    try {
      await axios.post(
        `${API_URL}/incidents/${rescueInc._id}/close`,
        { closureSummary: 'Trying to close early' },
        adminAuth
      );
      throw new Error('Premature closure should have been rejected!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message.includes('Mandatory department operations')) {
        success('Premature closure correctly blocked while department operations are active.');
      } else {
        throw err;
      }
    }

    // 5b. Simulate department completion
    await DepartmentEmergencyRequest.updateMany(
      { incidentId: rescueInc._id },
      { status: 'COMPLETED', completedAt: new Date() }
    );

    // 5c. Citizen cannot close incident (403 expected)
    try {
      await axios.post(
        `${API_URL}/incidents/${rescueInc._id}/close`,
        { closureSummary: 'Citizen closing attempt' },
        citizenAuth
      );
      throw new Error('Citizen unauthorized closure was not blocked!');
    } catch (err) {
      if (err.response?.status === 403) {
        success('Citizen unauthorized closure blocked with 403 Forbidden.');
      } else {
        throw err;
      }
    }

    // 5d. Authorized Central Admin completes official closure with Debrief
    const closeRes = await axios.post(
      `${API_URL}/incidents/${rescueInc._id}/close`,
      {
        closureSummary: 'River swimmer successfully extracted, stabilized by ambulance paramedics, and all units returned to base.',
        isOverride: false
      },
      adminAuth
    );

    if (!closeRes.data.success || closeRes.data.incident.status !== 'CLOSED') {
      throw new Error('Official closure failed');
    }
    success(`Incident officially CLOSED with debrief! Status: ${closeRes.data.incident.status}`);

    // 5e. Verify closed incident cannot be closed again
    try {
      await axios.post(
        `${API_URL}/incidents/${rescueInc._id}/close`,
        { closureSummary: 'Closing again' },
        adminAuth
      );
      throw new Error('Closing an already closed incident should be rejected!');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message.includes('already closed')) {
        success('Double-closure correctly rejected.');
      } else {
        throw err;
      }
    }

    // 5f. Verify Citizen Tracking Feed shows CLOSED
    const trackingRes = await axios.get(`${API_URL}/dispatch/tracking/${rescueInc._id}`);
    if (trackingRes.data.incident.status !== 'CLOSED') {
      throw new Error('Citizen tracking feed does not reflect final CLOSED status');
    }
    success(`Citizen live tracking feed reflects final CLOSED status and timeline!`);

    console.log('\n===============================================================');
    console.log('🎉 ALL P0/P1 ISSUE RESOLUTIONS & WORKFLOW TESTS PASSED 100%!');
    console.log('===============================================================\n');
  } catch (err) {
    fail('All-Incident Workflow Verification failed', err);
  } finally {
    // Teardown: Safely wipe isolated resqone_test database and stop test server
    if (mongoose.connection && mongoose.connection.name === 'resqone_test') {
      console.log('[Teardown] Dropping isolated resqone_test database...');
      await mongoose.connection.dropDatabase();
      console.log('[Teardown] resqone_test database cleanly wiped.');
    }
    if (testServerInstance) {
      await testServerInstance.close();
    }
  }
}

runAllIncidentWorkflowVerification();

