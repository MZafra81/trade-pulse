import re
import uuid
from supabase import create_client, Client

# Lee automáticamente la URL y la clave buena que ya están en lib/supabase.js
with open("lib/supabase.js", "r", encoding="utf-8") as f:
    js_content = f.read()

url_match = re.search(r"supabaseUrl\s*=\s*['\"](https://[^'\"]+)['\"]", js_content)
key_match = re.search(r"supabaseAnonKey\s*=\s*['\"](eyJ[^'\"]+)['\"]", js_content)

SUPABASE_URL = url_match.group(1)
SUPABASE_KEY = key_match.group(1)

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
    }
]

def make_slug(title, city):
    clean = re.sub(r'[^a-zA-Z0-9]+', '-', f"{title}-{city}").strip('-').lower()
    return f"{clean}-{uuid.uuid4().hex[:6]}"

def run_ingestion():
    print("Connecting to Supabase using credentials from lib/supabase.js...")
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
