# Gym Management System

This is a simple gym website.
It has a frontend, a backend, MongoDB, and Postman.

## What you need first

- Node.js and npm
- MongoDB running
- Postman
- VS Code

## Easy setup

1. Open the project folder in VS Code.
2. Open a terminal.
3. Install the app packages:

```bash
npm install
```

4. Start MongoDB as a service so it stays on after VS Code closes.

If you use MongoDB Compass on your Mac, the easiest local database is:

```bash
mongodb://localhost:27017/ironcore
```

If you use Atlas, put your Atlas link in `server/.env` and make sure the database name is `ironcore`.

5. Make sure `server/.env` has these values:

```ini
PORT=4000
JWT_SECRET=replace-with-a-secure-secret
MONGODB_URI=mongodb://localhost:27017/ironcore
CORS_ORIGIN=*
```

6. Put the demo data into MongoDB:

```bash
npm run seed
```

7. Start the backend and frontend together:

```bash
npm run dev:full
```

This starts:

- Backend at `http://localhost:4000`
- Frontend at `http://localhost:3000`

8. Open your browser and go to `http://localhost:3000`.
9. Log in with one of these:

- Admin: `admin@ironcore.com` / `admin123`
- Trainer: `trainer@ironcore.com` / `train123`
- Member: `member@ironcore.com` / `member123`

10. Check the backend is alive:

```bash
http://localhost:4000/api/health
```

## MongoDB Compass

If you use Compass, connect with:

```bash
mongodb://localhost:27017/ironcore
```

You should see the `ironcore` database.

## Postman

1. Open Postman.
2. Import these files:

- `postman/IronCore-Gym-Management.postman_collection.json`
- `postman/IronCore-Local.postman_environment.json`

3. Make sure `baseUrl` is `http://localhost:4000`.
4. Run the login request first.
5. Postman will save the token automatically.
6. Then run the other requests.

## If something does not work

- If MongoDB is off, start it again.
- If the backend does not open, check `npm run dev:full`.
- If Postman says unauthorized, run login again.
- If Compass shows nothing, run `npm run seed` again.

## Build

```bash
npm run build
```

## Main files

- `src/` = frontend
- `server/index.js` = backend API
- `server/seed.js` = sample data
- `postman/` = Postman files
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.abcd.mongodb.net/ironcore?retryWrites=true&w=majority
