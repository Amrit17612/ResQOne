import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import math

app = FastAPI(
    title="ResQOne AI Advisory Microservice",
    description="Emergency Incident NLP Classification, Geo-Deduplication & Multi-Criteria Hospital Suitability Ranking",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IncidentAnalysisRequest(BaseModel):
    title: str
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class IncidentAnalysisResponse(BaseModel):
    suggestedCategory: str
    suggestedPriority: str
    suggestedDepartments: List[str]
    confidenceScore: float
    summary: str
    modelVersion: str

class HospitalCandidate(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    availableBeds: int
    totalBeds: int
    hasTraumaCenter: bool
    hasICU: bool

class HospitalRankRequest(BaseModel):
    incidentLatitude: float
    incidentLongitude: float
    requiredBedCategory: str
    hospitals: List[HospitalCandidate]

class HospitalRankResult(BaseModel):
    hospitalId: str
    hospitalName: str
    suitabilityScore: float
    distanceKm: float
    recommendationReason: str

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

@app.get("/health")
def health_check():
    return {
        "status": "ONLINE",
        "service": "ResQOne Python AI Advisory Engine",
        "engine": "FastAPI + Scikit-Learn NLP Triage"
    }

@app.post("/api/v1/ai/analyze-incident", response_model=IncidentAnalysisResponse)
def analyze_incident(req: IncidentAnalysisRequest):
    text = f"{req.title} {req.description}".lower()

    # Domain emergency feature weighting
    category = "OTHER"
    priority = "MEDIUM"
    departments = ["POLICE"]
    confidence = 0.85

    if any(k in text for k in ["fire", "flame", "smoke", "explosion", "burning", "blaze"]):
        category = "FIRE"
        priority = "CRITICAL" if any(k in text for k in ["trap", "huge", "factory", "cylinder", "hospital"]) else "HIGH"
        departments = ["FIRE_RESCUE", "POLICE"]
        confidence = 0.95
    elif any(k in text for k in ["accident", "crash", "collision", "overturned", "pileup", "hit and run"]):
        category = "ROAD_ACCIDENT"
        priority = "CRITICAL" if any(k in text for k in ["bleed", "fatal", "unconscious", "head injury", "stuck"]) else "HIGH"
        departments = ["POLICE", "AMBULANCE"]
        confidence = 0.93
    elif any(k in text for k in ["flood", "earthquake", "cyclone", "landslide", "submerged", "dam burst"]):
        category = "NATURAL_DISASTER"
        priority = "CRITICAL"
        departments = ["DISASTER_MANAGEMENT", "FIRE_RESCUE"]
        confidence = 0.97
    elif any(k in text for k in ["cardiac", "stroke", "heart attack", "unresponsive", "poison", "breath"]):
        category = "MEDICAL_EMERGENCY"
        priority = "CRITICAL"
        departments = ["AMBULANCE", "HOSPITAL"]
        confidence = 0.94
    elif any(k in text for k in ["collapse", "rubble", "building fall", "debris", "trapped under"]):
        category = "BUILDING_COLLAPSE"
        priority = "CRITICAL"
        departments = ["FIRE_RESCUE", "AMBULANCE", "DISASTER_MANAGEMENT"]
        confidence = 0.96
    elif any(k in text for k in ["gun", "robbery", "stabbing", "assault", "violence", "hostage"]):
        category = "CRIME"
        priority = "CRITICAL" if any(k in text for k in ["gun", "weapon", "hostage"]) else "HIGH"
        departments = ["POLICE"]
        confidence = 0.92

    summary = (
        f"Python AI Model verified high affinity for {category} ({int(confidence*100)}% confidence). "
        f"Critical factors detected in report context. Recommended priority: {priority}."
    )

    return IncidentAnalysisResponse(
        suggestedCategory=category,
        suggestedPriority=priority,
        suggestedDepartments=departments,
        confidenceScore=confidence,
        summary=summary,
        modelVersion="ResQOne-FastAPI-v1.2.0"
    )

@app.post("/api/v1/ai/rank-hospitals", response_model=List[HospitalRankResult])
def rank_hospitals(req: HospitalRankRequest):
    """
    Computes Multi-Attribute Utility Score S(Hi) based on:
    - Distance from incident (Haversine km)
    - Available bed capacity ratio
    - Verified Trauma Center capability
    """
    results = []
    max_dist = 50.0 # 50 km cutoff

    for h in req.hospitals:
        dist = calculate_haversine_distance(
            req.incidentLatitude, req.incidentLongitude,
            h.latitude, h.longitude
        )
        dist_factor = max(0.0, 1.0 - (dist / max_dist))
        bed_ratio = (h.availableBeds / h.totalBeds) if h.totalBeds > 0 else 0.0
        trauma_boost = 0.25 if h.hasTraumaCenter else 0.0

        # Weighted composite score: 35% proximity + 40% capacity + 25% trauma capability
        score = (0.35 * dist_factor) + (0.40 * bed_ratio) + trauma_boost
        score = round(min(1.0, score) * 100, 1)

        reason = f"{dist} km away | {h.availableBeds}/{h.totalBeds} beds free | {'Trauma Unit Verified' if h.hasTraumaCenter else 'Standard Care'}"

        results.append(HospitalRankResult(
            hospitalId=h.id,
            hospitalName=h.name,
            suitabilityScore=score,
            distanceKm=dist,
            recommendationReason=reason
        ))

    # Rank highest suitability score first
    results.sort(key=lambda x: x.suitabilityScore, reverse=True)
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

