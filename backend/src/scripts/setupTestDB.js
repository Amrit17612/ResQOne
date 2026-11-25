import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/user.model.js';
import { Hospital } from '../models/hospital.model.js';
import { Ambulance } from '../models/ambulance.model.js';
import { Shelter } from '../models/shelter.model.js';
import { Incident } from '../models/incident.model.js';
import { ResponseUnit, UnitStatus } from '../models/responseUnit.model.js';
import { OrganizationApplication } from '../models/organizationApplication.model.js';

dotenv.config();

/**
 * Seed baseline entities into resqone_test only
 */
export const seedTestDatabase = async () => {
  if (mongoose.connection.name !== 'resqone_test') {
    throw new Error(`SAFETY BLOCK: seedTestDatabase refused to seed database: "${mongoose.connection.name}". Only "resqone_test" is allowed!`);
  }

  // Clear test DB first
  await User.deleteMany({});
  await Hospital.deleteMany({});
  await Ambulance.deleteMany({});
  await Shelter.deleteMany({});
  await Incident.deleteMany({});
  await ResponseUnit.deleteMany({});
  await OrganizationApplication.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Seed Core Role Users
  await User.insertMany([
    { name: 'Rohan Sharma', email: 'citizen@resqone.org', phone: '9876543210', passwordHash, role: 'CITIZEN', isVerified: true },
    { name: 'Admin Vikram Verma', email: 'admin@resqone.org', phone: '9876543211', passwordHash, role: 'CENTRAL_ADMIN', isVerified: true },
    { name: 'Inspector Ajay Singh', email: 'police@resqone.org', phone: '9876543212', passwordHash, role: 'POLICE_DISPATCHER', isVerified: true },
    { name: 'Commander Priya Nair', email: 'fire@resqone.org', phone: '9876543213', passwordHash, role: 'FIRE_COMMANDER', isVerified: true },
    { name: 'Dr. Ananya Roy', email: 'hospital@resqone.org', phone: '9876543214', passwordHash, role: 'HOSPITAL_COORDINATOR', isVerified: true },
    { name: 'Paramedic Suresh Kumar', email: 'ambulance@resqone.org', phone: '9876543215', passwordHash, role: 'AMBULANCE_PARAMEDIC', isVerified: true },
    { name: 'Director Neha Gupta', email: 'disaster@resqone.org', phone: '9876543216', passwordHash, role: 'DISASTER_OFFICER', isVerified: true },
    { name: 'Manager Rajesh Patel', email: 'shelter@resqone.org', phone: '9876543217', passwordHash, role: 'SHELTER_MANAGER', isVerified: true },
    { name: 'Volunteer Amit Trivedi', email: 'volunteer@resqone.org', phone: '9876543218', passwordHash, role: 'VOLUNTEER', isVerified: true },
    { name: 'Chief Super Admin', email: 'superadmin@resqone.org', phone: '9876543219', passwordHash, role: 'SUPER_ADMIN', isVerified: true, status: 'ACTIVE' }
  ]);

  // 2. Seed Approved Test Hospital & Org Application
  const approvedHospitalOrg = await OrganizationApplication.create({
    applicationId: 'ORG-TEST-0001',
    organizationName: 'Fortis Escorts Heart & Trauma Institute',
    organizationType: 'HOSPITAL',
    officialEmail: 'director@fortisdelhi.org',
    contactNumber: '9811223344',
    address: 'Okhla Road, Sukhdev Vihar, New Delhi',
    registrationNumber: 'DL-HOSP-FORTIS-2026',
    authorizedPersonName: 'Dr. Ashok Seth',
    authorizedPersonDesignation: 'Chairman & Medical Director',
    status: 'APPROVED',
    location: { type: 'Point', coordinates: [77.2805, 28.5605] },
    locationVerifiedByAdmin: true
  });

  await Hospital.create({
    name: 'Fortis Escorts Heart & Trauma Institute',
    registrationNumber: 'DL-HOSP-FORTIS-2026',
    phone: '9811223344',
    emergencyHotline: '102',
    address: 'Okhla Road, Sukhdev Vihar, New Delhi',
    location: { type: 'Point', coordinates: [77.2805, 28.5605] },
    hasTraumaCenter: true,
    hasICU: true
  });

  await Hospital.create({
    name: 'Max Super Speciality Trauma Care',
    registrationNumber: 'DL-HOSP-MAX-2026',
    phone: '011-26515050',
    emergencyHotline: '102',
    address: '1, 2, Press Enclave Marg, Saket, New Delhi',
    location: { type: 'Point', coordinates: [77.2180, 28.5280] },
    hasTraumaCenter: true,
    hasICU: true
  });

  // 3. Seed Response Units
  await ResponseUnit.insertMany([
    {
      unitIdentifier: 'PCR-SOUTH-01',
      departmentType: 'POLICE',
      vehicleType: 'PATROL_CAR',
      organizationName: 'Delhi Police - South District',
      assignedStaffName: 'Inspector Ajay Singh',
      status: UnitStatus.AVAILABLE,
      currentLocation: { type: 'Point', coordinates: [77.2185, 28.5410], heading: 45, speed: 0, accuracy: 5 }
    },
    {
      unitIdentifier: 'AMB-ALS-101',
      departmentType: 'AMBULANCE',
      vehicleType: 'ALS_AMBULANCE',
      organizationName: 'Delhi Central EMS',
      assignedStaffName: 'Paramedic Suresh Kumar',
      status: UnitStatus.AVAILABLE,
      currentLocation: { type: 'Point', coordinates: [77.2100, 28.5700], heading: 0, speed: 0, accuracy: 5 }
    },
    {
      unitIdentifier: 'FIRE-TENDER-09',
      departmentType: 'FIRE_RESCUE',
      vehicleType: 'FIRE_ENGINE',
      organizationName: 'Delhi Fire Service - HQ',
      assignedStaffName: 'Commander Priya Nair',
      status: UnitStatus.AVAILABLE,
      currentLocation: { type: 'Point', coordinates: [77.2300, 28.5300], heading: 120, speed: 0, accuracy: 5 }
    }
  ]);

  console.log('[ResQOne Test Setup] Seeded clean baseline fixtures into resqone_test.');
};
