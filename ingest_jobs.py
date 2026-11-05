import json
import re
import uuid
import urllib.request
import urllib.parse
from supabase import create_client, Client

# Leer credenciales automáticamente desde lib/supabase.js
with open("lib/supabase.js", "r", encoding="utf-8") as f:
    js_content = f.read()

url_match = re.search(r"supabaseUrl\s*=\s*['\"](https://[^'\"]+)['\"]", js_content)
key_match = re.search(r"supabaseAnonKey\s*=\s*['\"](eyJ[^'\"]+)['\"]", js_content)

SUPABASE_URL = url_match.group(1)
SUPABASE_KEY = key_match.group(1)
RAPIDAPI_KEY = "5c9e19e1f6msh2fd38a75723f7b1p1d0495jsnc298092f2ccc"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Múltiples combinaciones para capturar cientos de ofertas de oficios en EE. UU.
SEARCH_QUERIES = [
    {"query": "HVAC Technician Texas", "category": "HVAC", "state": "TX", "min": 28.0, "max": 42.0},
    {"query": "HVAC Mechanic Florida", "category": "HVAC", "state": "FL", "min": 26.0, "max": 40.0},
    {"query": "Journeyman Electrician Texas", "category": "Electrician", "state": "TX", "min": 30.0, "max": 45.0},
    {"query": "Electrical Technician Florida", "category": "Electrician", "state": "FL", "min": 28.0, "max": 40.0},
    {"query": "Commercial Plumber Texas", "category": "Plumbing", "state": "TX", "min": 32.0, "max": 46.0},
    {"query": "Pipefitter Florida", "category": "Plumbing", "state": "FL", "min": 30.0, "max": 42.0},
    {"query": "Pipe Welder Texas", "category": "Welding", "state": "TX", "min": 30.0, "max": 48.0},
    {"query": "Structural Welder Florida", "category": "Welding", "state": "FL", "min": 28.0, "max": 40.0},
    {"query": "Commercial Carpenter Texas", "category": "Carpentry", "state": "TX", "min": 24.0, "max": 35.0},
    {"query": "Drywall Carpenter Florida", "category": "Carpentry", "state": "FL", "min": 24.0, "max": 34.0}
]

EXCLUDED_WORDS = ["sales", "manager", "engineer", "estimator", "supervisor", "director", "recruiter"]

def make_slug(title, city):
    clean = re.sub(r'[^a-zA-Z0-9]+', '-', f"{title}-{city}").strip('-').lower()
    return f"{clean[:50]}-{uuid.uuid4().hex[:6]}"

def fetch_jsearch_jobs(query_text):
    url = "https://jsearch.p.rapidapi.com/search?" + urllib.parse.urlencode({
        "query": query_text,
        "page": "1",
        "num_pages": "3",  # Solicita múltiples páginas para maximizar volumen
        "country": "us",
        "date_posted": "month"
    })
    req = urllib.request.Request(url, headers={
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
        "User-Agent": "Mozilla/5.0"
    })
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
            return payload.get("data", [])
    except Exception as e:
        print(f"API Notice for '{query_text}': {e}")
        return []

def run_mass_ingestion():
    print("Starting mass ingestion of dynamic trade jobs...")
    total_added = 0

    for cfg in SEARCH_QUERIES:
        items = fetch_jsearch_jobs(cfg["query"])
        print(f"Query '{cfg['query']}': found {len(items)} raw listings.")
        
        for item in items:
            title = (item.get("job_title") or "").strip()
            if not title or any(w in title.lower() for w in EXCLUDED_WORDS):
                continue

            apply_link = item.get("job_apply_link") or item.get("job_google_link")
            if not apply_link:
                continue

            city = item.get("job_city") or "Metro Area"
            state = item.get("job_state") or cfg["state"]
            
            min_sal = item.get("job_min_salary")
            max_sal = item.get("job_max_salary")
            period = (item.get("job_salary_period") or "").upper()

            if min_sal and max_sal:
                if period == "YEAR" or min_sal > 1000:
                    r_min, r_max = round(float(min_sal)/2080, 2), round(float(max_sal)/2080, 2)
                else:
                    r_min, r_max = round(float(min_sal), 2), round(float(max_sal), 2)
            else:
                r_min, r_max = cfg["min"], cfg["max"]

            highlights = item.get("job_highlights") or {}
            quals = highlights.get("Qualifications") or [
                "Relevant trade license or certification",
                "Minimum 2+ years hands-on field experience",
                "Valid US driver's license and reliable transport"
            ]
            req_text = "\n".join(f"- {q}" for q in quals[:6])

            job_data = {
                "job_title": title,
                "company_name": item.get("employer_name") or "Direct Contractor",
                "trade_category": cfg["category"],
                "city": city,
                "state": state,
                "hourly_rate_min": r_min,
                "hourly_rate_max": r_max,
                "description": (item.get("job_description") or "")[:3500],
                "requirements": req_text,
                "original_url": apply_link,
                "apply_url": apply_link,
                "source_apply_url": apply_link,
                "contact_email": "careers@tradepulse.work",
                "slug": make_slug(title, city)
            }

            try:
                check = supabase.table("jobs").select("id").eq("original_url", apply_link).execute()
                if not check.data:
                    supabase.table("jobs").insert(job_data).execute()
                    total_added += 1
            except Exception as err:
                pass

    print(f"Mass ingestion finished. Total new jobs added: {total_added}")

if __name__ == "__main__":
    run_mass_ingestion()
