import { Shelter } from '../models/shelter.model.js';
import { VolunteerTask } from '../models/volunteer.model.js';
import { AuditLog } from '../models/audit.model.js';
import { User } from '../models/user.model.js';

// Shelter handlers
export const getShelters = async (req, res) => {
  try {
    const shelters = await Shelter.find();
    return res.status(200).json({ success: true, count: shelters.length, shelters });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateShelterOccupancy = async (req, res) => {
  try {
    const { occupiedCapacity, supplies } = req.body;
    const shelter = await Shelter.findById(req.params.id);

    if (!shelter) {
      return res.status(404).json({ success: false, message: 'Shelter not found' });
    }

    if (occupiedCapacity !== undefined) {
      shelter.occupiedCapacity = occupiedCapacity;
      if (shelter.occupiedCapacity >= shelter.totalCapacity) {
        shelter.status = 'FULL';
      } else {
        shelter.status = 'OPERATIONAL';
      }
    }

    if (supplies) {
      shelter.supplies = { ...shelter.supplies, ...supplies };
    }

    await shelter.save();
    return res.status(200).json({ success: true, message: 'Shelter updated.', shelter });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Volunteer handlers
export const getVolunteerTasks = async (req, res) => {
  try {
    const { status, volunteerId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (volunteerId) filter.assignedVolunteerId = volunteerId;

    const tasks = await VolunteerTask.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createVolunteerTask = async (req, res) => {
  try {
    const task = await VolunteerTask.create(req.body);
    return res.status(201).json({ success: true, message: 'Task created.', task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const assignVolunteerTask = async (req, res) => {
  try {
    const { volunteerId, volunteerName } = req.body;
    const task = await VolunteerTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.assignedVolunteerId = volunteerId;
    task.assignedVolunteerName = volunteerName;
    task.status = 'ASSIGNED';
    await task.save();

    return res.status(200).json({ success: true, message: 'Volunteer assigned.', task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVolunteerTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await VolunteerTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = status;
    await task.save();
    return res.status(200).json({ success: true, message: 'Task status updated.', task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Super Admin handlers
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

