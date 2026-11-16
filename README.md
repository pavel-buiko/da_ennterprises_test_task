# File Service API

A test assignment for a TypeScript REST API with user sign-up, sign-in, token refresh, and authenticated file management. It uses Express, Prisma, MySQL, Multer, and JWT.

## Run locally

Create a local `.env` with `DATABASE_URL`, `DB_ROOT_PASSWORD`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET`. Use separate local JWT secrets and point `DATABASE_URL` at the MySQL database configured by [docker-compose.yaml](docker-compose.yaml). Create an `uploads` directory before testing file uploads.

```sh
npm ci
docker compose up -d db
npx prisma migrate deploy
npx prisma generate
npm run dev
```

The API defaults to `http://localhost:5000/api`. The [router](src/router/index.ts) lists authentication and file endpoints. Import [testCollection.postman_collection.json](testCollection.postman_collection.json) to explore example requests.
