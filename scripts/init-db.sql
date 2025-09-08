-- Database initialization script for SynProd production
-- This script sets up the database with proper configuration for production

-- Set timezone
SET timezone = 'UTC';

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Set up database configuration for production
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- Create a read-only user for monitoring (optional)
-- Uncomment if you want to create a monitoring user
-- CREATE USER synprod_monitor WITH PASSWORD 'monitor_password_here';
-- GRANT CONNECT ON DATABASE synprod TO synprod_monitor;
-- GRANT USAGE ON SCHEMA public TO synprod_monitor;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO synprod_monitor;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO synprod_monitor;

-- Set up proper permissions
GRANT ALL PRIVILEGES ON DATABASE synprod TO synprod;

-- Create a backup directory (if needed)
-- This is handled by the backup service

-- Log initialization completion
DO $$
BEGIN
    RAISE NOTICE 'SynProd database initialization completed successfully';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'User: %', current_user;
    RAISE NOTICE 'Timezone: %', current_setting('timezone');
END $$;
