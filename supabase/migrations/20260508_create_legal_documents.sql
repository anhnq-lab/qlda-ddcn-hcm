-- ============================================================
-- Migration: Create legal_documents schema
-- Date: 2026-05-08
-- Description: Replaces static legalData.ts (2.1MB) with DB
-- ============================================================

-- ---- Enums ----
DO $$ BEGIN
  CREATE TYPE doc_type AS ENUM ('luat','nghi-dinh','thong-tu','qcvn','quyet-dinh');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE doc_status AS ENUM ('hieu-luc','het-hieu-luc','sap-hieu-luc');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---- Table: legal_documents ----
CREATE TABLE IF NOT EXISTS legal_documents (
  id            TEXT PRIMARY KEY,
  code          TEXT NOT NULL,
  title         TEXT NOT NULL,
  short_title   TEXT,
  type          doc_type NOT NULL,
  issued_date   TEXT,
  effective_date TEXT,
  issued_by     TEXT,
  status        doc_status NOT NULL DEFAULT 'hieu-luc',
  summary       TEXT,
  file_name     TEXT,
  file_path     TEXT,
  file_size     TEXT,
  tags          TEXT[]    DEFAULT '{}',
  related_doc_ids TEXT[]  DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- Table: legal_chapters ----
CREATE TABLE IF NOT EXISTS legal_chapters (
  id          TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES legal_documents(id) ON DELETE CASCADE,
  code        TEXT NOT NULL,
  title       TEXT NOT NULL,
  sort_order  INT  NOT NULL DEFAULT 0
);

-- ---- Table: legal_articles ----
CREATE TABLE IF NOT EXISTS legal_articles (
  id          TEXT PRIMARY KEY,
  chapter_id  TEXT NOT NULL REFERENCES legal_chapters(id) ON DELETE CASCADE,
  document_id TEXT NOT NULL REFERENCES legal_documents(id) ON DELETE CASCADE,
  code        TEXT NOT NULL,
  title       TEXT NOT NULL,
  summary     TEXT,
  content     TEXT,
  full_content TEXT,
  sort_order  INT  NOT NULL DEFAULT 0
);

-- ---- Indexes ----
CREATE INDEX IF NOT EXISTS idx_legal_docs_type ON legal_documents(type);
CREATE INDEX IF NOT EXISTS idx_legal_docs_status ON legal_documents(status);
CREATE INDEX IF NOT EXISTS idx_legal_docs_tags ON legal_documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_legal_chapters_doc ON legal_chapters(document_id);
CREATE INDEX IF NOT EXISTS idx_legal_articles_chapter ON legal_articles(chapter_id);
CREATE INDEX IF NOT EXISTS idx_legal_articles_doc ON legal_articles(document_id);

-- Full-text search index (Vietnamese-compatible)
CREATE INDEX IF NOT EXISTS idx_legal_docs_fts ON legal_documents
  USING GIN(to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(code,'')));

CREATE INDEX IF NOT EXISTS idx_legal_articles_fts ON legal_articles
  USING GIN(to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(content,'')));

-- ---- RLS ----
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_chapters  ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_articles  ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read
CREATE POLICY "legal_docs_select" ON legal_documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "legal_chapters_select" ON legal_chapters
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "legal_articles_select" ON legal_articles
  FOR SELECT TO authenticated USING (true);

-- Only admin can insert/update/delete
CREATE POLICY "legal_docs_admin_all" ON legal_documents
  FOR ALL TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM user_permissions WHERE resource = 'admin_accounts' AND can_manage = true))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM user_permissions WHERE resource = 'admin_accounts' AND can_manage = true));

-- ---- Trigger: updated_at ----
CREATE OR REPLACE FUNCTION update_legal_doc_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_legal_docs_updated ON legal_documents;
CREATE TRIGGER trg_legal_docs_updated
  BEFORE UPDATE ON legal_documents
  FOR EACH ROW EXECUTE FUNCTION update_legal_doc_timestamp();
