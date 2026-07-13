-- Step 1: run this while connected to the "postgres" database
CREATE DATABASE autominutes;
CREATE USER autominutes_user WITH PASSWORD 'pick_any_password_you_want';
GRANT ALL PRIVILEGES ON DATABASE autominutes TO autominutes_user;

-- Step 2: switch connection to the "autominutes" database, then run this
-- (required on PostgreSQL 15+, otherwise Hibernate can't create tables)
ALTER SCHEMA public OWNER TO autominutes_user;
GRANT ALL ON SCHEMA public TO autominutes_user;