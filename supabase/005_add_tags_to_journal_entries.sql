-- Add missing tags column to journal_entries to support journaling payloads
-- Run this manually via Supabase SQL editor or CLI as per your workflow.

alter table if exists public.journal_entries
  add column if not exists tags text[];

-- Optional: backfill to empty array for nulls if desired
-- update public.journal_entries set tags = coalesce(tags, '{}');

