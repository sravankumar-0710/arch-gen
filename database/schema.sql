-- filepath: database/schema.sql
-- Purpose: Master schema definition for ArchGen AI — SQLite (dev) / PostgreSQL (prod)
-- Note: Migrations under database/migrations/ are the source of truth for versioned changes.
--       This file is a reference snapshot of the full schema.

-- ─────────────────────────────────────────────
-- Table: users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,   -- Use SERIAL in PostgreSQL
    email       TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────
-- Table: projects
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL DEFAULT 'Untitled Project',
    version         INTEGER NOT NULL DEFAULT 1,     -- Schema version for future migrations
    land_data       TEXT,                           -- JSON blob: polygon points, unit, road side, north angle
    requirements    TEXT,                           -- JSON blob: rooms, vastu flags, floors
    layout          TEXT,                           -- JSON blob: generated layout result
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index: fast project lookup by user
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);