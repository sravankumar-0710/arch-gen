-- filepath: database/migrations/002_create_projects.sql
-- Purpose: Projects table schema for storing floor plan designs

CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    name        VARCHAR(255) NOT NULL DEFAULT 'Untitled Project',
    version     INTEGER NOT NULL DEFAULT 1,
    land_data   JSON,
    requirements JSON,
    layout      JSON,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);