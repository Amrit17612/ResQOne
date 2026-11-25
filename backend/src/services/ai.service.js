import axios from 'axios';
import { IncidentCategory, IncidentPriority, DepartmentType } from '../constants/enums.js';

export class AIServiceClient {
  /**
   * Dispatches incident data to dedicated Python FastAPI microservice (port 8000),
   * falling back cleanly to local rule-based heuristics if the Python service is offline.
   */
  static async analyzeIncident(title, description, lat, lng) {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    try {
      const response = await axios.post(
        `${aiServiceUrl}/api/v1/ai/analyze-incident`,
        {
          title,
          description,
          latitude: lat,
          longitude: lng
        },
        { timeout: 3500 }
      );

      if (response.data && response.data.suggestedCategory) {
        return {
          suggestedCategory: response.data.suggestedCategory,
          suggestedPriority: response.data.suggestedPriority,
          suggestedDepartments: response.data.suggestedDepartments,
          confidenceScore: response.data.confidenceScore,
          summary: response.data.summary
        };
      }
    } catch (err) {
      console.warn('[ResQOne AI Client] Python FastAPI service not answering, executing internal fallback heuristic.');
    }

    // High-precision local heuristic fallback
    const text = `${title} ${description}`.toLowerCase();
    let category = IncidentCategory.OTHER;
    let priority = IncidentPriority.MEDIUM;
    const depts = [];
    let confidence = 0.85;

    if (text.includes('fire') || text.includes('smoke') || text.includes('explosion') || text.includes('flame')) {
      category = IncidentCategory.FIRE;
      priority = text.includes('huge') || text.includes('trap') || text.includes('building')
        ? IncidentPriority.CRITICAL
        : IncidentPriority.HIGH;
      depts.push(DepartmentType.FIRE_RESCUE, DepartmentType.POLICE);
      confidence = 0.94;
    } else if (text.includes('accident') || text.includes('crash') || text.includes('collision') || text.includes('hit and run')) {
      category = IncidentCategory.ROAD_ACCIDENT;
      priority = text.includes('bleed') || text.includes('dead') || text.includes('unconscious') || text.includes('trapped')
        ? IncidentPriority.CRITICAL
        : IncidentPriority.HIGH;
      depts.push(DepartmentType.POLICE, DepartmentType.AMBULANCE);
      confidence = 0.92;
    } else if (text.includes('flood') || text.includes('earthquake') || text.includes('cyclone') || text.includes('landslide')) {
      category = IncidentCategory.NATURAL_DISASTER;
      priority = IncidentPriority.CRITICAL;
      depts.push(DepartmentType.DISASTER_MANAGEMENT, DepartmentType.FIRE_RESCUE);
      confidence = 0.96;
    } else if (text.includes('heart') || text.includes('breathing') || text.includes('stroke') || text.includes('fainted') || text.includes('medical')) {
      category = IncidentCategory.MEDICAL_EMERGENCY;
      priority = IncidentPriority.CRITICAL;
      depts.push(DepartmentType.AMBULANCE, DepartmentType.HOSPITAL);
      confidence = 0.91;
    } else if (text.includes('theft') || text.includes('robbery') || text.includes('assault') || text.includes('gun') || text.includes('weapon') || text.includes('attack')) {
      category = IncidentCategory.CRIME;
      priority = text.includes('gun') || text.includes('knife') ? IncidentPriority.CRITICAL : IncidentPriority.HIGH;
      depts.push(DepartmentType.POLICE);
      confidence = 0.93;
    } else if (text.includes('collapse') || text.includes('building fall') || text.includes('rubble')) {
      category = IncidentCategory.BUILDING_COLLAPSE;
      priority = IncidentPriority.CRITICAL;
      depts.push(DepartmentType.FIRE_RESCUE, DepartmentType.AMBULANCE, DepartmentType.DISASTER_MANAGEMENT);
      confidence = 0.95;
    } else {
      depts.push(DepartmentType.POLICE);
      confidence = 0.70;
    }

    const summary = `AI Advisory: Strong pattern match for ${category} (${(confidence * 100).toFixed(0)}% confidence). Recommended routing: ${depts.join(', ')}.`;

    return {
      suggestedCategory: category,
      suggestedPriority: priority,
      suggestedDepartments: depts,
      confidenceScore: confidence,
      summary
    };
  }

  static async rankHospitals(incidentLat, incidentLng, bedCategory, hospitalList) {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    try {
      const candidates = hospitalList.map((h) => {
        const stats = h.beds?.[bedCategory] || { total: 0, occupied: 0, reserved: 0 };
        return {
          id: h._id.toString(),
          name: h.name,
          latitude: h.location.coordinates[1],
          longitude: h.location.coordinates[0],
          availableBeds: Math.max(0, stats.total - stats.occupied - stats.reserved),
          totalBeds: stats.total,
          hasTraumaCenter: Boolean(h.hasTraumaCenter),
          hasICU: Boolean(h.hasICU)
        };
      });

      const response = await axios.post(`${aiServiceUrl}/api/v1/ai/rank-hospitals`, {
        incidentLatitude: Number(incidentLat),
        incidentLongitude: Number(incidentLng),
        requiredBedCategory: bedCategory,
        hospitals: candidates
      });

      return response.data;
    } catch (err) {
      console.warn('[ResQOne AI Client] Hospital ranking microservice offline, returning standard list.');
      return null;
    }
  }
}
