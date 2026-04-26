# projekt_webowki_mobilki

## Database Docker setup

Start MariaDB from the repository root:

```powershell
docker compose up -d db
```

The backend `.env` and `.env.example` already point at the container defaults:

```env
DATABASE_URL="mysql://app:app_password@localhost:3306/projektpalacz"
```

Apply the Prisma migration and optionally seed the database:

```powershell
cd backend
npx prisma migrate deploy
npm run seed
```

Stop the database when you no longer need it:

```powershell
docker compose down
```
