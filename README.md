# projekt_webowki_mobilki

## Run the full stack with Docker

From the repository root:

```powershell
docker compose up --build
```

That starts:

- MariaDB
- the backend on `http://localhost:3001`
- the frontend on `http://localhost:8080`

```text
http://localhost:8080
```

## Stop the stack

```powershell
docker compose down
```

To also remove the MariaDB volume:

```powershell
docker compose down -v
```

## Local non-Docker database setup

If you still want to run only the database in Docker:

```powershell
docker compose up -d db
```

The backend local environment file uses:

```env
DATABASE_URL="mysql://app:app_password@localhost:3306/projektpalacz"
```
