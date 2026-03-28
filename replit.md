# Workspace

## Overview

pnpm workspace monorepo using TypeScript. DocFlow - a full-stack document processing SaaS application with a premium UI.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite (artifacts/docflow)
- **Routing**: Wouter
- **Animations**: Framer Motion
- **UI**: Shadcn/ui + Tailwind CSS v4

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── docflow/            # React + Vite frontend (DocFlow UI)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## DocFlow Features

- **Dashboard**: Stat cards (Total, Processing, Completed, Failed) + Recent documents table
- **Upload**: Drag & drop upload with progress + toast notifications
- **Jobs**: Live polling (2s) with status filter tabs + retry failed jobs
- **Document Detail**: Metadata + editable extracted JSON + export to CSV/JSON

## Database Schema

### `documents` table
- `id` (serial, PK)
- `filename` (text)
- `file_size` (real)
- `mime_type` (text)
- `status` (queued | processing | completed | failed)
- `progress` (real, 0-100)
- `uploaded_at` (timestamp)
- `processed_at` (timestamp, nullable)
- `extracted_data` (jsonb, nullable)
- `error_message` (text, nullable)

## API Routes

- `GET /api/healthz` — Health check
- `GET /api/documents` — List all documents
- `POST /api/documents` — Upload document (multipart/form-data)
- `GET /api/documents/:id` — Get document by ID
- `PATCH /api/documents/:id` — Update extracted data
- `POST /api/documents/:id/retry` — Retry failed document
- `GET /api/documents/:id/export?format=json|csv` — Export document data
- `GET /api/stats` — Get processing statistics

## Packages

### `artifacts/docflow` (`@workspace/docflow`)

React + Vite frontend. Routes:
- `/` → Dashboard
- `/upload` → Upload page
- `/jobs` → Processing jobs
- `/documents/:id` → Document detail

Dependencies: framer-motion, react-dropzone, date-fns, clsx, tailwind-merge

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Uses multer for file uploads, Drizzle ORM for DB, Zod for validation.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/documents.ts` — documents table definition

Production migrations are handled by Replit when publishing. In development, use `pnpm --filter @workspace/db run push`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec and Orval config. Run codegen: `pnpm --filter @workspace/api-spec run codegen`
