import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { User } from '../models/user.model.js';
import { Hospital } from '../models/hospital.model.js';
import { Ambulance } from '../models/ambulance.model.js';
import { Shelter } from '../models/shelter.model.js';
import { Incident } from '../models/incident.model.js';
import { UserRole, IncidentCategory, IncidentPriority, IncidentStatus, BedCategory, AmbulanceStatus } from '../constants/enums.js';

dotenv.config();

const seed = async () => {
  await connectDB();
  console.log('[ResQOne] Clearing existing data...');

  await User.deleteMany({});
  await Hospital.deleteMany({});
  await Ambulance.deleteMany({});
  await Shelter.deleteMany({});
  await Incident.deleteMany({});

  const defaultPassword = 'password123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  console.log('[ResQOne] Seeding 10 Role Accounts...');
  const users = await User.insertMany([
    {
      name: 'Rohan Sharma',
      email: 'citizen@resqone.org',
      phone: '+91 9876543210',
      passwordHash,
      role: UserRole.CITIZEN,
      isVerified: true
    },
    {
      name: 'Admin Vikram Verma',
      email: 'admin@resqone.org',
      phone: '+91 9876543211',
      passwordHash,
      role: UserRole.CENTRAL_ADMIN,
      isVerified: true
    },
    {
      name: 'Inspector Ajay Singh',
      email: 'police@resqone.org',
      phone: '+91 9876543212',
      passwordHash,
      role: UserRole.POLICE_DISPATCHER,
      departmentType: 'POLICE',
      isVerified: true
    },
    {
      name: 'Commander Priya Nair',
      email: 'fire@resqone.org',
      phone: '+91 9876543213',
      passwordHash,
      role: UserRole.FIRE_COMMANDER,
      departmentType: 'FIRE_RESCUE',
      isVerified: true
    },
    {
      name: 'Dr. Ananya Roy',
      email: 'hospital@resqone.org',
      phone: '+91 9876543214',
      passwordHash,
      role: UserRole.HOSPITAL_COORDINATOR,
      departmentType: 'HOSPITAL',
      isVerified: true
    },
    {
      name: 'Paramedic Suresh Kumar',
      email: 'ambulance@resqone.org',
      phone: '+91 9876543215',
      passwordHash,
      role: UserRole.AMBULANCE_PARAMEDIC,
      departmentType: 'AMBULANCE',
      isVerified: true
    },
    {
      name: 'Director Neha Gupta',
      email: 'disaster@resqone.org',
      phone: '+91 9876543216',
      passwordHash,
      role: UserRole.DISASTER_OFFICER,
      departmentType: 'DISASTER_MANAGEMENT',
      isVerified: true
    },
    {
      name: 'Manager Rajesh Patel',
      email: 'shelter@resqone.org',
      phone: '+91 9876543217',
      passwordHash,
      role: UserRole.SHELTER_MANAGER,
      departmentType: 'SHELTER',
      isVerified: true
    },
    {
      name: 'Volunteer Amit Trivedi',
      email: 'volunteer@resqone.org',
      phone: '+91 9876543218',
      passwordHash,
      role: UserRole.VOLUNTEER,
      isVerified: true
    },
    {
      name: 'Chief Super Admin',
      email: 'superadmin@resqone.org',
      phone: '+91 9876543219',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isVerified: true
    }
  ]);

  console.log('[ResQOne] Seeding Emergency Hospitals...');
  const hospitals = await Hospital.insertMany([
    {
      name: 'Apollo Speciality Emergency Hospital',
      registrationNumber: 'HOSP-DEL-001',
      phone: '+91 11 2692 5858',
      emergencyHotline: '1066',
      address: 'Sarita Vihar, Delhi Mathura Road, New Delhi',
      location: {
        type: 'Point',
        coordinates: [77.2882, 28.5355]
      },
      hasTraumaCenter: true,
      hasICU: true,
      hasBurnUnit: true,
      beds: {
        [BedCategory.GENERAL]: { total: 100, occupied: 65, reserved: 2 },
        [BedCategory.OXYGEN_SUPPORT]: { total: 40, occupied: 22, reserved: 1 },
        [BedCategory.ICU]: { total: 20, occupied: 14, reserved: 3 },
        [BedCategory.NICU]: { total: 10, occupied: 4, reserved: 0 },
        [BedCategory.TRAUMA_STABILIZATION]: { total: 12, occupied: 5, reserved: 2 }
      }
    },
    {
      name: 'Max Super Speciality Trauma Care',
      registrationNumber: 'HOSP-DEL-002',
      phone: '+91 11 2651 5050',
      emergencyHotline: '011-40554055',
      address: '1, 2, Press Enclave Marg, Saket, New Delhi',
      location: {
        type: 'Point',
        coordinates: [77.2144, 28.5273]
      },
      hasTraumaCenter: true,
      hasICU: true,
      hasBurnUnit: false,
      beds: {
        [BedCategory.GENERAL]: { total: 120, occupied: 80, reserved: 5 },
        [BedCategory.OXYGEN_SUPPORT]: { total: 50, occupied: 30, reserved: 2 },
        [BedCategory.ICU]: { total: 25, occupied: 20, reserved: 2 },
        [BedCategory.NICU]: { total: 8, occupied: 3, reserved: 0 },
        [BedCategory.TRAUMA_STABILIZATION]: { total: 15, occupied: 8, reserved: 1 }
      }
    },
    {
      name: 'AIIMS Central Emergency & Trauma Centre',
      registrationNumber: 'HOSP-DEL-003',
      phone: '+91 11 2658 8500',
      emergencyHotline: '011-26593491',
      address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.5672]
      },
      hasTraumaCenter: true,
      hasICU: true,
      hasBurnUnit: true,
      beds: {
        [BedCategory.GENERAL]: { total: 250, occupied: 210, reserved: 10 },
        [BedCategory.OXYGEN_SUPPORT]: { total: 90, occupied: 70, reserved: 4 },
        [BedCategory.ICU]: { total: 50, occupied: 42, reserved: 4 },
        [BedCategory.NICU]: { total: 20, occupied: 15, reserved: 1 },
        [BedCategory.TRAUMA_STABILIZATION]: { total: 30, occupied: 22, reserved: 3 }
      }
    }
  ]);

  console.log('[ResQOne] Seeding Active Ambulances...');
  await Ambulance.insertMany([
    {
      vehicleNumber: 'DL-01-EMS-4091',
      driverName: 'Ramesh Chander',
      driverPhone: '+91 9911223344',
      paramedicName: 'Suresh Kumar',
      ambulanceType: 'ALS',
      status: AmbulanceStatus.AVAILABLE,
      currentLocation: {
        type: 'Point',
        coordinates: [77.2185, 28.5300],
        updatedAt: new Date()
      }
    },
    {
      vehicleNumber: 'DL-01-EMS-8821',
      driverName: 'Mohd Irfan',
      driverPhone: '+91 9911223355',
      paramedicName: 'Deepak Sharma',
      ambulanceType: 'BLS',
      status: AmbulanceStatus.AVAILABLE,
      currentLocation: {
        type: 'Point',
        coordinates: [77.2500, 28.5500],
        updatedAt: new Date()
      }
    }
  ]);

  console.log('[ResQOne] Seeding Relief Shelters...');
  await Shelter.insertMany([
    {
      name: 'Nehru Stadium Community Relief Hub',
      location: {
        type: 'Point',
        coordinates: [77.2343, 28.5828],
        address: 'JLN Stadium Complex, Lodhi Road, New Delhi'
      },
      totalCapacity: 500,
      occupiedCapacity: 120,
      contactPerson: 'Rajesh Patel',
      phone: '+91 9876543217',
      supplies: {
        drinkingWaterLiters: 4500,
        foodPackets: 2200,
        blankets: 850,
        medicalKits: 120
      },
      status: 'OPERATIONAL'
    }
  ]);

  console.log('[ResQOne] Seeding Initial Incident Reports...');
  await Incident.insertMany([
    {
      referenceId: 'RESQ-20261104-0001',
      reporterId: users[0]._id,
      reporterName: 'Rohan Sharma',
      reporterPhone: '+91 9876543210',
      category: IncidentCategory.ROAD_ACCIDENT,
      priority: IncidentPriority.CRITICAL,
      status: IncidentStatus.VERIFIED,
      title: 'Major Multi-Vehicle Pileup on Ring Road flyover',
      description: '3 passenger cars and a heavy truck collided near the flyover descent. Multiple people trapped with apparent head trauma.',
      location: {
        type: 'Point',
        coordinates: [77.2210, 28.5420],
        address: 'Ring Road Flyover near Moolchand, New Delhi',
        landmark: 'Near Moolchand Metro Station'
      },
      assignedDepartments: ['POLICE', 'AMBULANCE', 'FIRE_RESCUE'],
      aiAdvisory: {
        suggestedCategory: IncidentCategory.ROAD_ACCIDENT,
        suggestedPriority: IncidentPriority.CRITICAL,
        suggestedDepartments: ['POLICE', 'AMBULANCE', 'FIRE_RESCUE'],
        confidenceScore: 0.94,
        summary: 'High-casualty vehicular collision with structural entrapment.'
      },
      notes: [
        {
          authorName: 'Admin Vikram Verma',
          authorRole: 'CENTRAL_ADMIN',
          text: 'Verified via CCTV feed. Dispatched Police Unit 4 and ALS Ambulance DL-01-EMS-4091.',
          createdAt: new Date()
        }
      ]
    },
    {
      referenceId: 'RESQ-20261104-0002',
      reporterName: 'Sunita Devi',
      reporterPhone: '+91 9811002233',
      category: IncidentCategory.FIRE,
      priority: IncidentPriority.HIGH,
      status: IncidentStatus.PENDING_VERIFICATION,
      title: 'Commercial godown electrical short-circuit fire',
      description: 'Dense black smoke coming from textile warehouse 2nd floor. Workers evacuated but fire spreading towards adjacent shops.',
      location: {
        type: 'Point',
        coordinates: [77.2750, 28.5200],
        address: 'Okhla Industrial Area Phase 1, New Delhi',
        landmark: 'Behind Container Depot'
      },
      assignedDepartments: [],
      aiAdvisory: {
        suggestedCategory: IncidentCategory.FIRE,
        suggestedPriority: IncidentPriority.HIGH,
        suggestedDepartments: ['FIRE_RESCUE', 'POLICE'],
        confidenceScore: 0.95,
        summary: 'Commercial fire hazard requiring water tenders and perimeter security.'
      },
      notes: []
    }
  ]);

  console.log('[ResQOne] Database Seed Completed Successfully!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('[ResQOne Seed Error]', err);
  process.exit(1);
});

