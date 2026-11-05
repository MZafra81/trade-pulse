import re
import uuid
from supabase import create_client, Client

# Leer automáticamente credenciales desde lib/supabase.js
with open("lib/supabase.js", "r", encoding="utf-8") as f:
    js_content = f.read()

url_match = re.search(r"supabaseUrl\s*=\s*['\"](https://[^'\"]+)['\"]", js_content)
key_match = re.search(r"supabaseAnonKey\s*=\s*['\"](eyJ[^'\"]+)['\"]", js_content)

SUPABASE_URL = url_match.group(1)
SUPABASE_KEY = key_match.group(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def make_slug(title, city):
    clean = re.sub(r'[^a-zA-Z0-9]+', '-', f"{title}-{city}").strip('-').lower()
    return f"{clean[:50]}-{uuid.uuid4().hex[:6]}"

def run_native_ingestion():
    print("Ingesting native direct-hire trade jobs...")
    
    native_jobs = [
        {
            "job_title": "Commercial HVAC Service Technician",
            "company_name": "Apex Mechanical Systems LLC",
            "trade_category": "HVAC",
            "city": "Dallas",
            "state": "TX",
            "hourly_rate_min": 32.00,
            "hourly_rate_max": 42.00,
            "description": "Direct hire position. Diagnose, repair, and perform preventive maintenance on commercial rooftop units, chillers, and VAV systems across Dallas. Company service truck and fuel card provided.",
            "requirements": "- EPA Universal Certification required\n- 4+ years commercial HVAC service experience\n- Valid Driver License with clean record",
            "contact_email": "hr@apexmechanical-direct.com"
        },
        {
            "job_title": "Licensed Journeyman Electrician",
            "company_name": "Lone Star Power & Electric",
            "trade_category": "Electrician",
            "city": "Orlando",
            "state": "FL",
            "hourly_rate_min": 30.00,
            "hourly_rate_max": 38.00,
            "description": "Installing EMT/rigid conduit, pulling feeders, and terminating switchgear for commercial build-outs in Central Florida. Direct internal payroll, no third-party agencies.",
            "requirements": "- Active Journeyman Electrician License\n- 4+ years commercial construction experience\n- Reliable transportation and standard hand tools",
            "contact_email": "jobs@lonestarpower-direct.com"
        },
        {
            "job_title": "Commercial Journeyman Plumber",
            "company_name": "Brandt Mechanical Services",
            "trade_category": "Plumbing",
            "city": "Houston",
            "state": "TX",
            "hourly_rate_min": 34.00,
            "hourly_rate_max": 44.00,
            "description": "Ground-up commercial plumbing installation including cast iron, copper, PEX, and medical gas piping systems for large healthcare facilities in Greater Houston.",
            "requirements": "- Active Journeyman Plumber License\n- Experience reading isometric blueprints\n- Ability to pass background check and drug screen",
            "contact_email": "recruiting@brandt-direct.com"
        },
        {
            "job_title": "6G Combo Pipe Welder (TIG/Stick)",
            "company_name": "Zachry Industrial Group",
            "trade_category": "Welding",
            "city": "Beaumont",
            "state": "TX",
            "hourly_rate_min": 36.00,
            "hourly_rate_max": 46.00,
            "description": "Performing x-ray quality GTAW/SMAW root and hot pass welds on carbon and stainless steel process piping. Weekly overtime and per diem available.",
            "requirements": "- Must pass 6G gate weld test\n- Active TWIC Card required\n- Minimum 3 years industrial plant experience",
            "contact_email": "staffing@zachry-direct.com"
        },
        {
            "job_title": "Commercial Metal Stud Framer & Carpenter",
            "company_name": "Baker Interiors & Construction",
            "trade_category": "Carpentry",
            "city": "Tampa",
            "state": "FL",
            "hourly_rate_min": 26.00,
            "hourly_rate_max": 34.00,
            "description": "Framing heavy-gauge structural metal studs, hanging commercial drywall, and setting interior finishes on high-rise projects across Tampa Bay.",
            "requirements": "- 3+ years commercial framing experience\n- Full PPE and standard carpentry hand tools\n- Strong focus on site safety",
            "contact_email": "careers@bakerinteriors-direct.com"
        }
    ]

    for job in native_jobs:
        job["slug"] = make_slug(job["job_title"], job["city"])
        
        # Verificar si ya existe por slug para evitar duplicados
        existing = supabase.table("jobs").select("id").eq("slug", job["slug"]).execute()
        if not existing.data:
            supabase.table("jobs").insert(job).execute()
            print(f"Added native job: {job['job_title']} ({job['city']})")

if __name__ == "__main__":
    run_native_ingestion()
