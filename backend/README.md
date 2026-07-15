# AutoMinutes — Backend
Spring Boot + PostgreSQL.

## Getting the project

git fetch
git switch backend
git pull
cd backend
./mvnw clean install

Then open the `backend` folder in IntelliJ: `IBM_Summer_Practice/backend`

## Setup Postgres

1. Install PostgreSQL (default options, skip Stack Builder at the end).
2. Open pgAdmin 4, connect to your server, open Query Tool.
3. Run the commands in `db/db-setup.sql` file (run part 1 while connected to postgres, then switch connection to autominutes and run part 2).
4. Copy `src/main/resources/application.properties.example` to `application.properties` and fill in your password.
5. Run `BackendApplication.java` (or `./mvnw spring-boot:run`)

Done if there's no error in the console.

## Setup Ollama (local AI)

1. Download and install from https://ollama.com/download
2. Pull the model:

ollama pull llama3.2

3. Ollama runs automatically in the background after install — no need to start it manually.
4. No config needed on the Spring Boot side; the backend calls it at `http://localhost:11434`.

To confirm it's working, run:

ollama run llama3.2

and try a test prompt. Type `/bye` to exit. 