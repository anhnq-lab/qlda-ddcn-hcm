const sql = [
  "ALTER TABLE public.workflow_tasks ADD COLUMN IF NOT EXISTS name VARCHAR(500);",
  "ALTER TABLE public.workflow_tasks ADD COLUMN IF NOT EXISTS task_type VARCHAR(50) DEFAULT 'workflow';",
  "ALTER TABLE public.workflow_tasks ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;",
  "ALTER TABLE public.workflow_tasks ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;",
  "ALTER TABLE public.workflow_tasks ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;",
  "ALTER TABLE public.workflow_tasks ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;",
  "ALTER TABLE public.workflow_tasks ADD COLUMN IF NOT EXISTS cde_folder_id VARCHAR(255);",
  "ALTER TABLE public.workflow_tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();",
  "ALTER TABLE public.workflow_tasks ALTER COLUMN node_id DROP NOT NULL;",
  "CREATE INDEX IF NOT EXISTS idx_workflow_tasks_instance ON public.workflow_tasks(instance_id);",
  "CREATE INDEX IF NOT EXISTS idx_workflow_tasks_status ON public.workflow_tasks(status);",
  "CREATE INDEX IF NOT EXISTS idx_workflow_tasks_assignee ON public.workflow_tasks(assignee_id);"
].join("\n");

// Decode JWT to get the correct ref
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5b2hvY2pzbnN5Zmdmc21qZnF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQxMTE4MywiZXhwIjoyMDg0OTg3MTgzfQ.7r3xY99EiPXiIFh6K7ctR8Xw05NJT0pwJVn0cQrPxyU";
const payload = JSON.parse(Buffer.from(SERVICE_KEY.split('.')[1], 'base64').toString());
const ref = payload.ref;
console.log("JWT ref:", ref);
console.log("JWT role:", payload.role);

// Try BOTH project URLs
const urls = [
  "https://" + ref + ".supabase.co",
  "https://gyuxymbmbfvvygvcyyrd.supabase.co"
];

async function tryUrl(baseUrl) {
  console.log("\n=== Trying " + baseUrl + " ===");

  // Test connectivity first
  const testRes = await fetch(baseUrl + "/rest/v1/workflow_tasks?select=id&limit=1", {
    headers: { "Authorization": "Bearer " + SERVICE_KEY, "apikey": SERVICE_KEY }
  });
  console.log("  Connectivity test:", testRes.status, testRes.statusText);
  if (!testRes.ok) {
    const t = await testRes.text();
    console.log("  ", t.substring(0, 200));
    return false;
  }
  const rows = await testRes.json();
  console.log("  Found", rows.length, "task(s)");
  return true;
}

async function applySql(baseUrl) {
  // Use @supabase/supabase-js to run SQL via the database function approach
  // Create a temporary RPC function that executes our DDL
  const createFunc = `
    CREATE OR REPLACE FUNCTION _temp_apply_migration() RETURNS void AS $$
    BEGIN
      ALTER TABLE public.workflow_tasks ADD COLUMN IF NOT EXISTS name VARCHAR(500);
      ALTER TABLE public.workflow_tasks ADD COLUMN IF NOT EXISTS task_type VARCHAR(50) DEFAULT 'workflow';
      ALTER TABLE public.workflow_tasks ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
      ALTER TABLE public.workflow_tasks ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
      ALTER TABLE public.workflow_tasks ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
      ALTER TABLE public.workflow_tasks ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
      ALTER TABLE public.workflow_tasks ADD COLUMN IF NOT EXISTS cde_folder_id VARCHAR(255);
      ALTER TABLE public.workflow_tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
      ALTER TABLE public.workflow_tasks ALTER COLUMN node_id DROP NOT NULL;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  // Try using the supabase-js library
  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(baseUrl, SERVICE_KEY);

    // Try rpc approach - first create the function via raw SQL
    const { data, error } = await supabase.rpc("_temp_apply_migration");
    if (error) {
      console.log("  RPC call error (expected if func doesn't exist yet):", error.message);
    } else {
      console.log("  ✅ RPC Success!");
      return true;
    }

    // Try direct column check - see what columns exist
    const { data: cols, error: colErr } = await supabase
      .from("workflow_tasks")
      .select("id, name, task_type, progress, metadata")
      .limit(1);

    if (colErr) {
      console.log("  Current columns missing:", colErr.message);
      console.log("\n  ⚠️  Need to run DDL via Supabase Dashboard SQL Editor.");
      console.log("  📋 URL: https://supabase.com/dashboard/project/" + ref + "/sql/new");
    } else {
      console.log("  ✅ Columns already exist! No migration needed.");
      return true;
    }
  } catch (e) {
    console.log("  Error:", e.message);
  }
  return false;
}

async function run() {
  for (const url of urls) {
    const ok = await tryUrl(url);
    if (ok) {
      await applySql(url);
      return;
    }
  }
  console.log("\n❌ Could not connect to either project.");
}

run();
