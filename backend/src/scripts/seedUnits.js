import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { ResponseUnit, UnitStatus } from '../models/responseUnit.model.js';

dotenv.config();

const seedUnits = async () => {
  await connectDB();
  console.log('[ResQOne] Seeding Initial Department Response Units...');

  await ResponseUnit.deleteMany({});

  const units = [
    // Police Units
    {
      unitIdentifier: 'PCR-SOUTH-01',
      departmentType: 'POLICE',
      vehicleType: 'PATROL_CAR',
      organizationName: 'Delhi Police - South District',
      assignedStaffName: 'Inspector Ajay Singh',
      status: UnitStatus.AVAILABLE,
      isLiveGps: false,
      isSimulatedGps: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.2185, 28.5410], // Near AIIMS / Ring Road
        heading: 45,
        speed: 0,
        accuracy: 5
      },
      capabilities: ['CROWD_CONTROL', 'FIRST_AID', 'TRAFFIC_MANAGEMENT']
    },
    {
      unitIdentifier: 'PCR-EAST-04',
      departmentType: 'POLICE',
      vehicleType: 'HIGHWAY_PATROL',
      organizationName: 'Delhi Police - East District',
      assignedStaffName: 'Sub-Inspector Rajesh Rao',
      status: UnitStatus.AVAILABLE,
      isLiveGps: false,
      isSimulatedGps: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.2800, 28.5300], // Near Okhla / Ashram
        heading: 90,
        speed: 0,
        accuracy: 8
      },
      capabilities: ['ARMED_RESPONSE', 'FIRST_AID']
    },

    // Ambulance Units
    {
      unitIdentifier: 'AMB-ALS-101',
      departmentType: 'AMBULANCE',
      vehicleType: 'ADVANCED_LIFE_SUPPORT',
      organizationName: 'AIIMS Emergency Medical Services',
      assignedStaffName: 'Paramedic Suresh Kumar',
      status: UnitStatus.AVAILABLE,
      isLiveGps: false,
      isSimulatedGps: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.2090, 28.5672], // AIIMS Trauma Centre
        heading: 180,
        speed: 0,
        accuracy: 4
      },
      capabilities: ['VENTILATOR', 'DEFIBRILLATOR', 'ICU_TRANSPORT', 'OXYGEN']
    },
    {
      unitIdentifier: 'AMB-BLS-205',
      departmentType: 'AMBULANCE',
      vehicleType: 'BASIC_LIFE_SUPPORT',
      organizationName: 'Safdarjung Emergency Services',
      assignedStaffName: 'EMT Manisha Rawat',
      status: UnitStatus.AVAILABLE,
      isLiveGps: false,
      isSimulatedGps: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.2070, 28.5700],
        heading: 270,
        speed: 0,
        accuracy: 5
      },
      capabilities: ['STRETCHER', 'OXYGEN_SUPPORT', 'FIRST_AID']
    },

    // Fire & Rescue Units
    {
      unitIdentifier: 'FIRE-TENDER-09',
      departmentType: 'FIRE_RESCUE',
      vehicleType: 'WATER_BOWSER_FOAM',
      organizationName: 'Delhi Fire Service - Station 4',
      assignedStaffName: 'Commander Priya Nair',
      status: UnitStatus.AVAILABLE,
      isLiveGps: false,
      isSimulatedGps: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.2300, 28.5450], // Moolchand / Defence Colony
        heading: 315,
        speed: 0,
        accuracy: 6
      },
      capabilities: ['HYDRAULIC_CUTTERS', 'FOAM_SUPPRESSION', 'RESCUE_LADDER']
    },
    {
      unitIdentifier: 'FIRE-RESCUE-14',
      departmentType: 'FIRE_RESCUE',
      vehicleType: 'HYDRAULIC_PLATFORM',
      organizationName: 'Delhi Fire Service - Okhla Station',
      assignedStaffName: 'Leading Fireman Harish Chandra',
      status: UnitStatus.AVAILABLE,
      isLiveGps: false,
      isSimulatedGps: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.2690, 28.5280],
        heading: 0,
        speed: 0,
        accuracy: 7
      },
      capabilities: ['HIGH_RISE_LADDER', 'THERMAL_IMAGING', 'CHEMICAL_FOAM']
    },

    // Disaster Management Units
    {
      unitIdentifier: 'NDRF-TEAM-03',
      departmentType: 'DISASTER_MANAGEMENT',
      vehicleType: 'MULTI_DISASTER_RESCUE_TRUCK',
      organizationName: 'NDRF 8th Battalion',
      assignedStaffName: 'Team Leader Anil Kulkarni',
      status: UnitStatus.AVAILABLE,
      isLiveGps: false,
      isSimulatedGps: true,
      currentLocation: {
        type: 'Point',
        coordinates: [77.2500, 28.5500],
        heading: 120,
        speed: 0,
        accuracy: 5
      },
      capabilities: ['FLOOD_RESCUE_BOAT', 'CANINE_SEARCH', 'EARTHQUAKE_SHORING']
    }
  ];

  await ResponseUnit.insertMany(units);
  console.log(`[ResQOne] Successfully seeded ${units.length} response units.`);
  process.exit(0);
};

seedUnits().catch(err => {
  console.error('[ResQOne] Error seeding response units:', err);
  process.exit(1);
});

