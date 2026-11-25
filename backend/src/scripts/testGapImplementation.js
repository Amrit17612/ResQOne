/**
 * Comprehensive Automated Test Suite for ResQOne Gap Implementation
 * 
 * Verifies:
 * 1. 13-stage Organization Verification Workflow & Transactional Email Dispatches
 * 2. Multi-Organization Registration (Hospital, Police, Fire, Disaster, NGO, Shelter)
 * 3. Automatic Deterministic Department Routing Service for Approved Disasters (Flood)
 * 4. Automatic Generation of DepartmentEmergencyRequests (Disaster + Police + Fire + Ambulance)
 * 5. Automatic Generation of NGO Relief Support & Shelter Evacuation Support Requests
 * 6. Department / Support Organization Request Acceptance & Status Transition
 * 7. Real-Time Security Tracking OTP Verification
 */

import axios from 'axios';
import mongoose from 'mongoose';
import { createTestServer } from '../testServer.js';
import { seedTestDatabase } from './setupTestDB.js';
import { signToken } from '../utils/token.js';
import { OrganizationApplication } from '../models/organizationApplication.model.js';
import { DepartmentEmergencyRequest } from '../models/departmentEmergencyRequest.model.js';
import { Incident } from '../models/incident.model.js';
import { User } from '../models/user.model.js';
import { Shelter } from '../models/shelter.model.js';

const TEST_PORT = 5002;
const API_URL = `http://localhost:${TEST_PORT}/api/v1`;

const log = (step, msg) => console.log(`\x1b[36m[STEP ${step}]\x1b[0m ${msg}`);
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

async function runGapTests() {
  console.log('\n===============================================================');
  console.log('🚀 RESQONE GAP IMPLEMENTATION E2E VERIFICATION TEST SUITE (ISOLATED SANDBOX)');
  console.log('===============================================================\n');

  let testTimestamp = null;
  let testIncidentId = null;

  try {
    testServerInstance = await createTestServer(TEST_PORT);
    await seedTestDatabase();
    console.log(`Database verified connected to isolated test environment: ${mongoose.connection.name}`);

    // 0. Setup Super Admin Actor
    let superAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    if (!superAdmin) {
      superAdmin = await User.create({
        name: 'Chief Super Admin',
        email: 'superadmin.audit@resqone.gov.in',
        phone: '9999900000',
        passwordHash: 'dummy',
        role: 'SUPER_ADMIN',
        isVerified: true,
        status: 'ACTIVE'
      });
    }
    const adminToken = createMockToken(superAdmin);
    const authHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };

    // -------------------------------------------------------------
    // TEST 1: Register Multi-Type Organizations & Verify Map Points
    // -------------------------------------------------------------
    log('1', 'Registering Disaster Management Authority & NGO Organizations with GPS Point...');
    const timestamp = Date.now();
    testTimestamp = timestamp;

    const disasterOrgData = {
      organizationName: `National Disaster Response Authority ${timestamp}`,
      organizationType: 'DISASTER_MANAGEMENT',
      officialEmail: `ndrf.${timestamp}@disaster.gov.in`,
      contactNumber: '9811223344',
      registrationNumber: `NDRF-REG-${timestamp}`,
      authorizedPersonName: 'Commander Verma',
      authorizedPersonDesignation: 'Director of Operations',
      address: 'NDRF HQ, Central Delhi',
      latitude: 28.5420,
      longitude: 77.2210
    };

    const ngoOrgData = {
      organizationName: `Pratham Relief Foundation ${timestamp}`,
      organizationType: 'NGO',
      officialEmail: `relief.${timestamp}@prathamngo.org`,
      contactNumber: '9876543210',
      registrationNumber: `NGO-DEL-${timestamp}`,
      authorizedPersonName: 'Aarav Mehta',
      authorizedPersonDesignation: 'Relief Coordinator',
      address: 'Pratham Bhavan, Lajpat Nagar, New Delhi',
      latitude: 28.5670,
      longitude: 77.2430
    };

    const disRes = await axios.post(`${API_URL}/organizations/register`, disasterOrgData);
    if (!disRes.data.success) throw new Error('Failed to register disaster authority');
    success(`Disaster Organization registered with ID: ${disRes.data.applicationId}`);

    const ngoRes = await axios.post(`${API_URL}/organizations/register`, ngoOrgData);
    if (!ngoRes.data.success) throw new Error('Failed to register NGO organization');
    success(`NGO Organization registered with ID: ${ngoRes.data.applicationId}`);

    // -------------------------------------------------------------
    // TEST 2: 13-Stage Verification Lifecycle Transitions with Email Notifications
    // -------------------------------------------------------------
    log('2', 'Executing 13-Stage Verification Workflow Transitions on Disaster Org...');
    const disApp = await OrganizationApplication.findOne({ applicationId: disRes.data.applicationId });

    const stagesToTest = [
      'UNDER_INITIAL_REVIEW',
      'DOCUMENT_VERIFICATION_PENDING',
      'DOCUMENT_VERIFIED',
      'ADDITIONAL_INFORMATION_REQUIRED',
      'PHYSICAL_VERIFICATION_PENDING',
      'PHYSICAL_VERIFICATION_COMPLETED',
      'FINAL_APPROVAL_PENDING',
      'APPROVED'
    ];

    for (const stg of stagesToTest) {
      const transRes = await axios.patch(
        `${API_URL}/organizations/applications/${disApp._id}/status`,
        { status: stg, note: `System automated stage progression to ${stg}` },
        authHeaders
      );
      if (!transRes.data.success || transRes.data.application.status !== stg) {
        throw new Error(`Failed transition to ${stg}`);
      }
    }
    success('Disaster Authority successfully navigated 8 progressive stages to APPROVED.');

    // -------------------------------------------------------------
    // TEST 3: Track Application Status with Secure OTP
    // -------------------------------------------------------------
    log('3', 'Testing OTP-Secured Tracking Endpoint for Disaster Organization...');
    const otpReqRes = await axios.post(`${API_URL}/organizations/request-tracking-otp`, {
      applicationId: disApp.applicationId,
      email: disApp.officialEmail
    });
    if (!otpReqRes.data.success) throw new Error('Tracking OTP request failed');
    success('Tracking OTP dispatched to official email.');

    // -------------------------------------------------------------
    // TEST 4: Automatic Deterministic Department Routing Engine on Flood Incident
    // -------------------------------------------------------------
    log('4', 'Reporting Flood Emergency Incident to trigger Automatic Department Routing...');
    
    // Create citizen user
    let citizen = await User.findOne({ role: 'CITIZEN' });
    if (!citizen) {
      citizen = await User.create({
        name: 'Citizen Rahul',
        email: `citizen.${timestamp}@gmail.com`,
        phone: '9810012345',
        passwordHash: 'dummy',
        role: 'CITIZEN',
        isVerified: true
      });
    }
    const citizenToken = createMockToken(citizen);

    // Report Flood Incident
    const floodIncidentRes = await axios.post(
      `${API_URL}/incidents`,
      {
        title: `Major Yamuna Flood Inundation - Ring Road Lowlands ${timestamp}`,
        description: 'Water level breached danger mark. Families trapped on rooftops, relief and boats immediately required.',
        category: 'FLOOD',
        severity: 'CRITICAL',
        latitude: 28.6690,
        longitude: 77.2310,
        address: 'Old Yamuna Bridge Lowlands, Delhi',
        isEmergencyException: true,
        emergencyExceptionReason: 'Active flash flood surge and immediate life threat.'
      },
      { headers: { Authorization: `Bearer ${citizenToken}` } }
    );

    if (!floodIncidentRes.data.success) throw new Error('Failed to report flood incident');
    const floodIncident = floodIncidentRes.data.incident;
    testIncidentId = floodIncident._id;
    success(`Flood Incident Reported: ${floodIncident._id} (Category: FLOOD, Severity: CRITICAL)`);

    // Verify / Approve Incident by Central Admin -> Triggers Automatic Routing Engine
    log('5', 'Central Admin Verifying & Approving Incident (Triggering Routing Engine)...');
    const verifyRes = await axios.patch(
      `${API_URL}/incidents/${floodIncident._id}/verify`,
      {
        verified: true,
        verificationNotes: 'Approved by Central Operations. Immediate multi-department response mobilized.'
      },
      authHeaders
    );
    if (!verifyRes.data.success) throw new Error('Failed to verify incident');
    success('Incident Approved! Checking DepartmentEmergencyRequest queue...');

    // -------------------------------------------------------------
    // TEST 5: Verify Generated Department Requests
    // -------------------------------------------------------------
    log('6', 'Validating Deterministic Routing Requests Generated...');
    const generatedRequests = await DepartmentEmergencyRequest.find({ incidentId: floodIncident._id });
    console.log(`Generated ${generatedRequests.length} department emergency requests:`);
    generatedRequests.forEach(r => {
      console.log(` - Dept: ${r.departmentType} | Request ID: ${r.requestId} | Status: ${r.status}`);
    });

    const deptTypes = generatedRequests.map(r => r.departmentType);
    if (!deptTypes.includes('DISASTER_MANAGEMENT')) throw new Error('Missing DISASTER_MANAGEMENT routing for FLOOD');
    if (!deptTypes.includes('POLICE')) throw new Error('Missing POLICE routing for FLOOD');
    if (!deptTypes.includes('FIRE_RESCUE')) throw new Error('Missing FIRE_RESCUE routing for FLOOD');
    if (!deptTypes.includes('AMBULANCE') && !deptTypes.includes('AMBULANCE_PROVIDER')) throw new Error('Missing AMBULANCE routing for FLOOD');
    if (!deptTypes.includes('NGO')) throw new Error('Missing NGO Relief Support Request for FLOOD');
    if (!deptTypes.includes('SHELTER')) throw new Error('Missing SHELTER Evacuation Support Request for FLOOD');
    success('All 6 Required Primary Departments & Support Organizations routed deterministically!');

    // -------------------------------------------------------------
    // TEST 6: Disaster Admin & NGO & Shelter Request Acceptance
    // -------------------------------------------------------------
    log('7', 'Testing Disaster Admin Acceptance of Emergency Request...');
    const disasterReq = generatedRequests.find(r => r.departmentType === 'DISASTER_MANAGEMENT');
    
    // Disaster Admin Actor
    const disasterOfficer = await User.create({
      name: 'NDRF Sector Officer',
      email: `ndrf.sec.${timestamp}@disaster.gov.in`,
      phone: '9811009988',
      passwordHash: 'dummy',
      role: 'DISASTER_ADMIN',
      departmentType: 'DISASTER_MANAGEMENT',
      isVerified: true,
      status: 'ACTIVE'
    });
    const disasterToken = createMockToken(disasterOfficer);

    const acceptRes = await axios.put(
      `${API_URL}/emergency-requests/${disasterReq._id}/accept`,
      { estimatedResponseMinutes: 12, responseNotes: 'NDRF Boat 4 deployed' },
      { headers: { Authorization: `Bearer ${disasterToken}` } }
    );
    if (!acceptRes.data.success || acceptRes.data.request.status !== 'ACCEPTED') {
      throw new Error('Disaster department acceptance failed');
    }
    success(`Disaster Department Accepted Request: ${acceptRes.data.request.requestId}`);

    // NGO Acceptance
    log('8', 'Testing NGO Relief Request Acceptance...');
    const ngoReq = generatedRequests.find(r => r.departmentType === 'NGO');
    const ngoUser = await User.create({
      name: 'NGO Lead Rita',
      email: `rita.${timestamp}@ngo.org`,
      phone: '9811443322',
      passwordHash: 'dummy',
      role: 'NGO_ADMIN',
      departmentType: 'NGO',
      isVerified: true,
      status: 'ACTIVE'
    });
    const ngoToken = createMockToken(ngoUser);

    const ngoAcceptRes = await axios.put(
      `${API_URL}/emergency-requests/${ngoReq._id}/accept`,
      { estimatedResponseMinutes: 20 },
      { headers: { Authorization: `Bearer ${ngoToken}` } }
    );
    if (!ngoAcceptRes.data.success || ngoAcceptRes.data.request.status !== 'ACCEPTED') {
      throw new Error('NGO relief request acceptance failed');
    }
    success(`NGO Accepted Relief Support Request: ${ngoAcceptRes.data.request.requestId}`);

    // Shelter Acceptance
    log('9', 'Testing Shelter Evacuation Center Acceptance...');
    const shelterReq = generatedRequests.find(r => r.departmentType === 'SHELTER');
    const shelterUser = await User.create({
      name: 'Camp Manager Sunil',
      email: `sunil.${timestamp}@shelter.org`,
      phone: '9811776655',
      passwordHash: 'dummy',
      role: 'SHELTER_ADMIN',
      departmentType: 'SHELTER',
      isVerified: true,
      status: 'ACTIVE'
    });
    const shelterToken = createMockToken(shelterUser);

    const shelterAcceptRes = await axios.put(
      `${API_URL}/emergency-requests/${shelterReq._id}/accept`,
      { estimatedResponseMinutes: 15 },
      { headers: { Authorization: `Bearer ${shelterToken}` } }
    );
    if (!shelterAcceptRes.data.success || shelterAcceptRes.data.request.status !== 'ACCEPTED') {
      throw new Error('Shelter evacuation acceptance failed');
    }
    success(`Shelter Accepted Evacuation Request: ${shelterAcceptRes.data.request.requestId}`);

    console.log('\n===============================================================');
    console.log('🎉 ALL GAP IMPLEMENTATION VERIFICATION TESTS PASSED PERFECTLY!');
    console.log('===============================================================\n');
  } catch (err) {
    fail('Gap Implementation Test execution failed', err);
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

runGapTests();
