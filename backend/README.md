AutoMinutes — Backend

Spring Boot + PostgreSQL.

Setup Postgre

1. Install PostgreSQL (default options, skip Stack Builder at the end).
2. Open pgAdmin 4, connect to your server, open Query Tool.
3. Run the commands in db/db-setup.sql file (run part 1 while connected to postgres, then switch connection to autominutes and run part 2).
4. Copy src/main/resources/application.properties.example to application.properties and fill in your password.
5. Run BackendApplication.java.

Done if there's no error in the console.