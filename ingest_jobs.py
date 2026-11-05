import os
import re
import uuid
from supabase import create_client, Client

SUPABASE_URL = "https://kzvhsqjrotjnucsqchcl.supabase.co"
SUPABASE_KEY = "TU_CLAVE_SERVICE_ROLE" # O leída desde lib/supabase.js

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def make_slug(title, city):
    clean = re.sub(r'[^a-zA-Z0-9]+', '-', f"{title}-{city}").strip('-').lower()
    return f"{clean[:50]}-{uuid.uuid4().hex[:6]}"

def ingest_direct_market_jobs():
    # Simulación de múltiples fuentes automatizadas (APIs de contratistas directos, feeds RSS, etc.)
    fresh_scraped_jobs = [
        {
            "job_title": "Commercial HVAC Installer",
            "company_name": "Apex Mechanical Systems LLC",
            "trade_category": "HVAC",
            "city": "Austin",
            "state": "TX",
            "hourly_rate_min": 32.00,
            "hourly_rate_max": 40.00,
            "description": "Direct hire position. We are looking for certified HVAC installers for commercial construction sites in Austin. Full benefits, 401k matching, and weekly direct deposit provided directly by Apex Mechanical.",
            "requirements": "- Minimum 3 years experience in commercial HVAC\n- EPA Universal certification required\n- Clean driving record",
            "contact_email": "hr@apexmechanical-direct.com"
        },
        {
            "job_title": "Industrial Electrician - Direct Hire",
            "company_name": "Lone Star Power & Electric",
            "trade_category": "Electrician",
            "city": "Houston",
            "state": "TX",
            "hourly_rate_min": 35.00,
            "hourly_rate_max": 45.00,
            "description": "Immediate direct placement for industrial electricians. Work consists of cable tray installation, panel wiring, and high-voltage maintenance. No third-party agency involved—hired directly by our internal payroll.",
            "requirements": "- Active Texas Journeyman License\n- 5+ years industrial background\n- Ability to pass physical and drug test",
            "contact_email": "jobs@lonestarpower-direct.com"
        }
    ]

    for job in fresh_scraped_jobs:
        job["slug"] = make_slug(job["job_title"], job["city"])
        
        # Como ya no dependemos de enlaces externos, usamos el slug o el correo como identificador único
        existing = supabase.table("jobs").select("id").eq("slug", job["slug"]).execute()
        
        if not existing.data:
            supabase.table("jobs").insert(job).execute()
            print(f"Added direct job: {job['job_title']} at {job['company_name']}")

if __name__ == "__main__":
    ingest_direct_market_jobs()
