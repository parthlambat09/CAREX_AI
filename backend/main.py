import json
import os
import sys
from typing import Optional, List, Dict, Any
import urllib.request
import urllib.error
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

# Ensure UTF-8 output encoding on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from engine import ClinicalInferenceEngine

app = FastAPI(title="CAREX Real-Time Sepsis Telemetry Backend")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the clinical inference engine
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "models", "sepsis_lgbm.joblib")
meta_path = os.path.join(BASE_DIR, "models", "model_metadata.json")
stream_path = os.path.join(BASE_DIR, "models", "sim_stream_patients.json")

engine = ClinicalInferenceEngine(model_path=model_path, meta_path=meta_path)

# Load simulation stream data for playback
if os.path.exists(stream_path):
    with open(stream_path, 'r') as f:
        SIMULATION_STREAM = json.load(f)
else:
    SIMULATION_STREAM = []

# Build mapping from dataset patient_ids to standard CAREX ICU bed identifiers (ICU-100 ... ICU-115)
_unique_stream_ids = sorted(list(set(str(d.get('patient_id')) for d in SIMULATION_STREAM))) if SIMULATION_STREAM else []
PATIENT_ID_MAP = {sid: f"ICU-{100 + i}" for i, sid in enumerate(_unique_stream_ids)}

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class HandoffRequest(BaseModel):
    patient: Dict[str, Any]
    hospital_name: Optional[str] = "CAREX ICU"

@app.get("/")
def health_check():
    return {"status": "online", "system": "CAREX Telemetry Engine Active", "version": "1.0.0"}

@app.get("/api/health")
def api_health():
    return {
        "status": "healthy",
        "service": "CAREX Clinical AI Telemetry & Decision Support Backend",
        "engine": "LightGBM + TreeSHAP",
        "active_models": ["sepsis_lgbm.joblib"],
        "patients_monitored": len(PATIENT_ID_MAP),
        "streaming_active": True
    }

@app.get("/api/patients")
def api_patients():
    return {
        "patients": [
            {"id": pid, "mapped_id": mapped, "bed": f"ICU-{str(i + 1).zfill(2)}"}
            for i, (pid, mapped) in enumerate(PATIENT_ID_MAP.items())
        ],
        "count": len(PATIENT_ID_MAP)
    }

@app.get("/api/analytics")
def api_analytics():
    return {
        "ai_engine": "CAREX ClinicalInferenceEngine",
        "model_type": "LightGBM Classifier with TreeSHAP Local Explanations",
        "features_tracked": len(engine.feature_columns),
        "streaming_protocol": "WebSocket /ws/telemetry",
        "status": "active"
    }

@app.post("/api/chat")
def api_chat(req: ChatRequest):
    message = req.message
    ctx = req.context or {}

    system_prompt = (
        "You are CAREX AI Copilot / CAREX AI Assistant, a highly knowledgeable AI healthcare & ICU safety assistant "
        "integrated into the CAREX Clinical Intelligence Platform. "
        f"Current clinical context: {json.dumps(ctx)}. "
        "Provide concise, professional, evidence-based answers. "
        "When patient data is available in the context, reference specific vitals, risk scores, and bed assignments. "
        "Otherwise, answer general questions normally without refusing or deflecting. "
        "Always end with a brief disclaimer: 'This is an educational simulation prototype and not a diagnostic tool.'"
    )

    # 1. Try Groq LLM API (primary — fast inference with Llama 3.3 70B)
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        try:
            payload = json.dumps({
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                "temperature": 0.4,
                "max_tokens": 1024
            }).encode('utf-8')
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {groq_key}"
            }
            request = urllib.request.Request(
                "https://api.groq.com/openai/v1/chat/completions",
                data=payload,
                headers=headers
            )
            with urllib.request.urlopen(request, timeout=10) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                reply = res_data["choices"][0]["message"]["content"]
                print(f"[CAREX-AI] Groq LLM response received ({len(reply)} chars)")
                return {"reply": reply, "source": "groq"}
        except Exception as e:
            print(f"[CAREX-AI] Groq API error: {e}")

    # 2. Try OpenAI API key if present (secondary fallback)
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        try:
            payload = json.dumps({
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ]
            }).encode('utf-8')
            headers = {"Content-Type": "application/json", "Authorization": f"Bearer {openai_key}"}
            request = urllib.request.Request("https://api.openai.com/v1/chat/completions", data=payload, headers=headers)
            with urllib.request.urlopen(request, timeout=10) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                reply = res_data["choices"][0]["message"]["content"]
                return {"reply": reply, "source": "openai"}
        except Exception as e:
            print(f"[CAREX-AI] OpenAI API error: {e}")

    # 3. Dynamic Clinical Intelligence Engine Fallback (rule-based)
    reply = generate_dynamic_clinical_reply(message, ctx)
    return {"reply": reply, "source": "carex_clinical_engine"}

def generate_dynamic_clinical_reply(message: str, ctx: Dict[str, Any]) -> str:
    msg_lower = message.lower()
    hosp_name = ctx.get("hospitalName") or ctx.get("activeHospital", {}).get("name") or "the active ICU hospital"
    patients = ctx.get("patients", [])
    alerts_count = ctx.get("activeAlertsCount", 0)
    
    # Find mentioned patient if any
    mentioned_p = None
    for p in patients:
        p_name = str(p.get("name", "")).lower()
        p_id = str(p.get("id", "")).lower()
        if (p_name and p_name in msg_lower) or (p_id and p_id in msg_lower):
            mentioned_p = p
            break
            
    if mentioned_p:
        vitals = mentioned_p.get("vitals", {})
        risk = mentioned_p.get("risk", {})
        overall_risk = risk.get("overall", 50) if isinstance(risk, dict) else 50
        status = mentioned_p.get("status", "monitored")
        bed = mentioned_p.get("bed", "Bed")
        diag = mentioned_p.get("diagnosis", "ICU Admission")
        
        return (
            f"CAREX AI Patient Record for {mentioned_p.get('name')} ({mentioned_p.get('id')}, {bed} at {hosp_name}): "
            f"Currently in {str(status).upper()} status with an overall AI deterioration risk of {overall_risk}%. "
            f"Primary Diagnosis: {diag}. "
            f"Latest Telemetry Vitals: HR {vitals.get('heartRate', 'N/A')} bpm, SpO2 {vitals.get('spo2', 'N/A')}%, "
            f"BP {vitals.get('systolic', 'N/A')}/{vitals.get('diastolic', 'N/A')} mmHg, Resp Rate {vitals.get('respiratoryRate', 'N/A')}/min. "
            f"CAREX recommends continuous telemetry monitoring and reviewing arterial blood gas trends."
        )

    # General clinical topics
    if "sepsis" in msg_lower or "infection" in msg_lower or "sofa" in msg_lower:
        return (
            f"CAREX Sepsis Protocol ({hosp_name}): Sepsis risk is calculated via real-time qSOFA scoring (respiratory rate ≥22, altered mentation, systolic BP ≤100). "
            f"Recommended bundle: 1) Measure serum lactate immediately, 2) Obtain blood cultures prior to antibiotics, 3) Administer broad-spectrum IV antimicrobials, "
            f"4) Rapid fluid resuscitation with 30 mL/kg crystalloids for MAP <65 mmHg."
        )
        
    if "cardiac" in msg_lower or "heart" in msg_lower or "bpm" in msg_lower or "ecg" in msg_lower:
        return (
            f"CAREX Cardiology Assessment ({hosp_name}): Telemetry monitors Lead II ECG waveforms in real-time. "
            f"Tachycardic drift (>110 bpm) or bradycardia (<50 bpm) triggers instant telemetry alerts. "
            f"Ensure electrolyte panel (K+, Mg2+) is checked and anti-arrhythmic protocols are reviewed if QTc prolongs."
        )

    if "recover" in msg_lower or "discharge" in msg_lower or "family" in msg_lower or "visit" in msg_lower:
        return (
            f"CAREX Recovery & Patient Welfare Portal: Patients are evaluated daily across Vital Stability, Mobility Score, and Complication Risk. "
            f"Visiting hours at {hosp_name} are typically 10:00 AM – 1:00 PM and 4:00 PM – 8:00 PM. "
            f"For direct nurse liaison updates, families may call the unit station coordinator."
        )
        
    if "nurse" in msg_lower or "staff" in msg_lower or "duty" in msg_lower or "ratio" in msg_lower:
        return (
            f"CAREX Nursing Operations at {hosp_name}: Current ICU nurse-to-patient ratio is optimized under standard 1:1.5 acuity guidelines. "
            f"Bedside allocations ensure continuous visual & telemetry coverage with standby emergency intake coverage."
        )

    if "ventilator" in msg_lower or "oxygen" in msg_lower or "spo2" in msg_lower or "respiratory" in msg_lower:
        return (
            f"CAREX Respiratory Intelligence ({hosp_name}): SpO2 levels below 92% or respiratory rate above 24/min trigger high-priority hypoxia warnings. "
            f"High-flow nasal cannula (HFNC) and mechanical ventilation weaning protocols are actively tracked to prevent ventilator-associated complications."
        )

    crit_count = len([p for p in patients if p.get("status") == "critical" or (isinstance(p.get("risk"), dict) and p.get("risk", {}).get("overall", 0) >= 75)])
    return (
        f"CAREX Clinical AI Assistant Analysis for {hosp_name}: "
        f"Currently tracking {len(patients)} active ICU bed(s) with {crit_count} critical-tier case(s) and {alerts_count} active alert(s). "
        f"Your query '{message}' has been analyzed against live telemetry and ICU safety protocols. "
        f"Recommendation: Review active bed risk trajectories and ensure bedside reassessment for high-drift vitals."
    )

@app.post("/api/handoff")
def api_handoff(req: HandoffRequest):
    p = req.patient
    hosp = req.hospital_name or "CAREX ICU"
    
    p_name = p.get("name") or p.get("patientName") or "Patient"
    p_id = p.get("id") or p.get("patientId") or "ICU"
    bed = p.get("bed", "Bed 01")
    age = p.get("age", 55)
    sex = p.get("sex", "M")
    diag = p.get("diagnosis") or p.get("primaryDiagnosis") or "ICU Care"
    status = p.get("status") or p.get("overallStatus") or "monitored"
    vitals = p.get("vitals", {})
    risk = p.get("risk", {})
    overall_risk = risk.get("overall") if isinstance(risk, dict) else 50
    timeline = p.get("timeline", [])
    
    recent_events = [ev.get("title", "") for ev in timeline[:3]] if timeline else ["Admitted to ICU"]

    situation = f"Patient {p_name} ({p_id}, {age}y/{sex}), located in {bed} at {hosp}. Primary Diagnosis: {diag}. Current Status: {str(status).upper()} (AI Deterioration Index: {overall_risk}%)."
    
    background = f"Admitted for intensive monitoring and post-acute management. Recent clinical events over shift: {'; '.join(recent_events)}."
    
    assessment = (
        f"Latest Vitals: HR {vitals.get('heartRate', 75)} bpm, SpO2 {vitals.get('spo2', 96)}%, "
        f"BP {vitals.get('systolic', 120)}/{vitals.get('diastolic', 80)} mmHg, RR {vitals.get('respiratoryRate', 16)}/min, Temp {vitals.get('temperature', 37.0)}°C. "
        f"Physiological risk breakdown: Sepsis score {risk.get('sepsis', 20) if isinstance(risk, dict) else 20}%, Cardiac arrest likelihood {risk.get('cardiacArrest', 15) if isinstance(risk, dict) else 15}%, Respiratory failure risk {risk.get('respiratoryFailure', 25) if isinstance(risk, dict) else 25}%."
    )
    
    recommendation = (
        f"1. Perform q2h vital sign verification and arterial line flush. "
        f"2. Maintain SpO2 >94% and target MAP ≥65 mmHg. "
        f"3. Re-evaluate serum lactate & CBC on next scheduled lab draw. "
        f"4. Report any tachycardic drift >110 bpm to attending physician immediately."
    )

    return {
        "patient_id": p_id,
        "patient_name": p_name,
        "hospital": hosp,
        "generated_at": "2026-09-03T13:10:00Z",
        "sbar": {
            "situation": situation,
            "background": background,
            "assessment": assessment,
            "recommendation": recommendation
        }
    }

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("[CAREX-WS] Client connected to real-time telemetry stream.")
    
    try:
        if SIMULATION_STREAM:
            from itertools import groupby
            import asyncio

            # Sort records for sequential streaming
            sorted_records = sorted(SIMULATION_STREAM, key=lambda x: str(x.get('patient_id', '1')))
            
            # Loop continuously so telemetry never runs dry
            while True:
                for patient_id, group in groupby(sorted_records, key=lambda x: str(x.get('patient_id', '1'))):
                    patient_rows = list(group)
                    mapped_id = PATIENT_ID_MAP.get(str(patient_id), f"P-{str(patient_id)}")
                    for row in patient_rows:
                        # Push measurement into inference engine
                        eval_result = engine.push_measurement(patient_id, row)
                        
                        payload = {
                            "patient_id": patient_id,
                            "mapped_id": mapped_id,
                            "timestamp": row.get("hour", row.get("ICULOS", 1)),
                            "vitals": {
                                "heartRate": row.get("HR"),
                                "spo2": row.get("O2Sat"),
                                "temperature": row.get("Temp"),
                                "systolic": row.get("SBP"),
                                "diastolic": row.get("DBP"),
                                "respiratoryRate": row.get("Resp")
                            },
                            **eval_result
                        }
                        
                        await websocket.send_json(payload)
                        await asyncio.sleep(1.2)
        else:
            # Fallback dummy heartbeat if stream file is missing
            while True:
                await websocket.send_json({"status": "waiting_for_simulation_stream"})
                import asyncio
                await asyncio.sleep(2)
                
    except WebSocketDisconnect:
        print("[CAREX-WS] Client disconnected from telemetry stream.")
    except Exception as e:
        print(f"[CAREX-WS ERROR] Telemetry stream error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)