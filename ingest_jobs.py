import os
import uuid
import re
from supabase import create_client, Client

SUPABASE_URL = "https://kzvhsqjrotjnucsqchcl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6dmhzcWpyb3RqbnVjc3FjaGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTYwOTIxOTQsImV4cCI6MTk3MTY2ODE5NH0.Lt6WkhCXPR1RLFYpydbWCW2GT-_exqW7E4Dp-Dmeu6o"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

sample_jobs = [
    {
        "job_title": "Commercial Plumber - New Construction",
        "company_name": "Lone Star Mechanical Systems",
        "trade_category": "Plumbing",
        "city": "Houston",
        "state": "TX",
        "hourly_rate_min": 32.00,
        "hourly_rate_max": 42.00,
        "description": "Seeking experienced Commercial Plumbers for ground-up commercial projects in North Houston. Must have active TDLR license and hand tools.",
        "requirements": "- Active TDLR Commercial Journeyman Plumber license\n- 4+ years commercial experience\n- Valid Driver License and clean record\n- OSHA 10 preferred",
        "original_url": "https://houston.craigslist.org/trd/d/commercial-plumber/7728192011.html",
        "apply_url": "https://houston.craigslist.org/trd/d/commercial-plumber/7728192011.html",
        "source_apply_url": "https://houston.craigslist.org/trd/d/commercial-plumber/7728192011.html",
        "contact_email": "jobs@lonestarplumbingtx.com"
    },
    {
        "job_title": "Certified Structural Pipe Welder",
        "company_name": "Gulf Coast Industrial Services",
        "trade_category": "Welding",
        "city": "Tampa",
        "state": "FL",
        "hourly_rate_min": 30.00,
        "hourly_rate_max": 38.50,
        "description": "Immediate opening for 6G Pipe and Structural Welders for industrial facility maintenance in the Port of Tampa area.",
        "requirements": "- Must pass 6G SMAW/GTAW weld test on carbon pipe\n- TWIC card required\n- 3+ years heavy industrial site experience",
        "original_url": "https://tampa.craigslist.org/psc/trd/d/pipe-welder/7728293812.html",
        "apply_url": "https://tampa.craigslist.org/psc/trd/d/pipe-welder/7728293812.html",
        "source_apply_url": "https://tampa.craigslist.org/psc/trd/d/pipe-welder/7728293812.html",
        "contact_email": "careers@gulfcoastindustrial.com"
    },
    {
        "job_title": "Residential HVAC Service Technician",
        "company_name": "All-State Air & Heat",
        "trade_category": "HVAC",
        "city": "Orlando",
        "state": "FL",
        "hourly_rate_min": 26.00,
        "hourly_rate_max": 35.00,
        "description": "Full-time HVAC technician needed for diagnostics, seasonal tune-ups, and warranty repairs across Orange County. Fully equipped work van provided.",
        "requirements": "- EPA Universal Certification required\n- Minimum 2 years troubleshooting residential split systems\n- Clean motor vehicle record",
        "original_url": "https://orlando.craigslist.org/trd/d/hvac-tech/7728345129.html",
        "apply_url": "https://orlando.craigslist.org/trd/d/hvac-tech/7728345129.html",
        "source_apply_url": "https://orlando.craigslist.org/trd/d/hvac-tech/7728345129.html",
        "contact_email": "recruiting@allstateairfl.com"
    }
]

def make_slug(title, city):
    clean = re.sub(r'[^a-zA-Z0-9]+', '-', f"{title}-{city}").strip('-').lower()
    return f"{clean}-{uuid.uuid4().hex[:6]}"

def run_ingestion():
    print("Connecting to Supabase and uploading job listings...")
    for job in sample_jobs:
        check = supabase.table("jobs").select("id").eq("original_url", job["original_url"]).execute()
        if check.data and len(check.data) > 0:
            print(f"Skipping already existing job: {job['job_title']}")
        else:
            job["slug"] = make_slug(job["job_title"], job["city"])
            supabase.table("jobs").insert(job).execute()
            print(f"Added: {job['job_title']}")

if __name__ == "__main__":
    run_ingestion()
