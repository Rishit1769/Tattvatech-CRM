# TattvaTech CRM

Phase 0 of the TattvaTech Company Workspace is implemented as a single Next.js application.

## Local setup

1. Install Node.js 20+ and MySQL 8+.
2. Create a database and application user matching `.env.example`.
3. Copy `.env.example` to `.env.local` and replace the values.
4. Install dependencies with `npm install`.
5. Apply the schema and foundation permissions:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. Create the first Owner user:

   ```bash
   BOOTSTRAP_NAME="Owner" \
   BOOTSTRAP_EMAIL="owner@example.com" \
   BOOTSTRAP_PASSWORD="use-a-local-password" \
   BOOTSTRAP_ROLE="Owner" \
   npm run db:create-user
   ```

7. Start the app with `npm run dev` and open <http://localhost:3000>.

## Verification

```bash
npm run typecheck
npm run build
curl http://localhost:3000/api/health
```

MinIO is intentionally deferred from the current implementation scope. The application reports storage as `deferred` from the health endpoint until the storage phase is implemented.
