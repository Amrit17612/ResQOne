import { Shelter } from '../models/shelter.model.js';
import { DepartmentEmergencyRequest } from '../models/departmentEmergencyRequest.model.js';
import { AuditLog } from '../models/audit.model.js';

/**
 * 1. Create or Register Shelter Facility
 */
export const createShelter = async (req, res) => {
  try {
    const { name, latitude, longitude, address, totalCapacity, contactPerson, phone, supplies } = req.body;

    const lat = Number(latitude) || 28.5420;
    const lng = Number(longitude) || 77.2210;

    const shelter = await Shelter.create({
      name,
      location: {
        type: 'Point',
        coordinates: [lng, lat],
        address: address || 'Designated Relief Shelter'
      },
      totalCapacity: Number(totalCapacity) || 250,
      occupiedCapacity: 0,
      contactPerson: contactPerson || req.user.name,
      phone: phone || req.user.phone || '9999999999',
      supplies: supplies || {
        drinkingWaterLiters: 1500,
        foodPackets: 800,
        blankets: 400,
        medicalKits: 100
      },
      status: 'OPERATIONAL'
    });

    return res.status(201).json({ success: true, shelter });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 2. Get Shelters
 */
export const getShelters = async (req, res) => {
  try {
    const shelters = await Shelter.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: shelters.length, shelters });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Update Shelter Occupancy & Supplies
 */
export const updateShelterCapacity = async (req, res) => {
  try {
    const { occupiedCapacity, status, supplies } = req.body;
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) return res.status(404).json({ success: false, message: 'Shelter not found' });

    if (occupiedCapacity !== undefined) shelter.occupiedCapacity = Number(occupiedCapacity);
    if (status) shelter.status = status;
    if (supplies) shelter.supplies = { ...shelter.supplies, ...supplies };

    // Auto-mark as FULL if capacity is exceeded
    if (shelter.occupiedCapacity >= shelter.totalCapacity) {
      shelter.status = 'FULL';
    }

    await shelter.save();
    return res.status(200).json({ success: true, message: 'Shelter updated successfully', shelter });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

