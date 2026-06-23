# OKJTech - Next.js + Laravel Application

A modern web application built with Next.js (frontend) and Laravel (backend API), migrated from the legacy PHP site.

**Legacy files are backed up in:** `../legacy_bkp/`

## Quick Start

```bash
# Backend (Terminal 1)
cd backend
php artisan serve

# Frontend (Terminal 2)
cd frontend
npm run dev
```

**Frontend:** http://localhost:3000
**Backend API:** http://localhost:8000/api
**Admin Login:** admin@okjtech.co.ke / okjtech2025

## Project Structure

```
okjt-app/
├── frontend/          # Next.js + React + TypeScript
│   ├── app/           # App Router pages
│   │   ├── (public)/  # Public routes (services, insights, projects, about, contact)
│   │   ├── admin/     # Admin dashboard
│   │   └── api/       # ISR revalidation endpoint
│   ├── components/    # React components
│   │   ├── admin/     # Admin CRUD components (AdminResourceTemplate)
│   │   ├── sections/  # Public page sections
│   │   └── ui/        # Shared UI primitives
│   ├── hooks/         # SWR data hooks
│   ├── lib/           # Server/client API fetchers
│   └── types/         # TypeScript types
│
└── backend/           # Laravel 12 API
    ├── app/
    │   ├── Http/Controllers/Api/  # API controllers
    │   ├── Models/                # Eloquent models
    │   ├── Services/              # RevalidationService
    │   └── Observers/             # CMS model observers (ISR triggers)
    ├── database/migrations/       # Database migrations
    └── routes/api.php             # API routes
```

## Tech Stack

### Frontend

- **Next.js 16** - React framework (App Router, ISR)
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **SWR** - Data fetching with caching/revalidation
- **Framer Motion** - Animations
- **Radix UI** - Accessible primitives
- **Lucide React** - Icons

### Backend

- **Laravel 12** - PHP framework
- **Laravel Sanctum** - API authentication
- **MySQL** - Database
- **Intervention Image** - Auto WebP optimization

## Getting Started

### Prerequisites

- Node.js 18+
- PHP 8.2+
- Composer
- MySQL

### Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Configure database in .env
# DB_DATABASE=okjt_app
# DB_USERNAME=root
# DB_PASSWORD=

# Configure ISR in .env
# NEXT_URL=http://localhost:3000
# NEXT_REVALIDATION_SECRET=your-secret-here

# Run migrations
php artisan migrate:fresh --seed

# Start development server
php artisan serve
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_REVALIDATION_SECRET=your-secret-here
EOF

# Start development server
npm run dev
```

## API Endpoints

### Public Endpoints

| Method | Endpoint                          | Description               |
| ------ | --------------------------------- | ------------------------- |
| GET    | `/api/services`                   | Get all services          |
| GET    | `/api/services/{slug}`            | Get service by slug       |
| GET    | `/api/insights`                   | Get all insights          |
| GET    | `/api/insights/{slug}`            | Get insight by slug       |
| GET    | `/api/projects`                   | Get all projects          |
| GET    | `/api/projects?type=client`       | Get client projects       |
| GET    | `/api/projects?type=flagship`     | Get flagship projects     |
| GET    | `/api/projects/{slug}`            | Get project by slug       |
| GET    | `/api/pillars`                    | Get brand pillars         |
| GET    | `/api/pillars/{slug}`             | Get pillar by slug        |
| GET    | `/api/team-members`               | Get team members          |
| GET    | `/api/stats`                      | Get stats                 |
| GET    | `/api/testimonials`               | Get testimonials          |
| GET    | `/api/clients`                    | Get clients               |
| GET    | `/api/settings`                   | Get site settings         |
| GET    | `/api/search?q=...`               | Search across content     |
| POST   | `/api/subscribers`                | Subscribe to newsletter   |
| POST   | `/api/rsvps`                      | Submit RSVP/early access  |
| POST   | `/api/contact`                    | Submit contact form       |

### Protected Endpoints (require authentication)

| Method | Endpoint                         | Description              |
| ------ | -------------------------------- | ------------------------ |
| POST   | `/api/projects`                  | Create project           |
| PUT    | `/api/projects/{id}`             | Update project           |
| DELETE | `/api/projects/{id}`             | Delete project           |
| POST   | `/api/services`                  | Create service           |
| PUT    | `/api/services/{id}`             | Update service           |
| DELETE | `/api/services/{id}`             | Delete service           |
| POST   | `/api/insights`                  | Create insight           |
| PUT    | `/api/insights/{id}`             | Update insight           |
| DELETE | `/api/insights/{id}`             | Delete insight           |
| POST   | `/api/upload/image`              | Upload & optimize image  |
| POST   | `/api/revalidate`                | Trigger ISR revalidation |

## Features

### ISR (Incremental Static Regeneration)

- All public pages use server-side data fetching with 60s revalidation
- Backend CMS model changes trigger webhook-based cache invalidation
- SWR fallback pattern for instant page loads

### Admin Dashboard

- Unified `AdminResourceTemplate` for all CRUD pages
- Image auto-optimization (WebP conversion at 80% quality)
- Client-side compression before upload (10 MB max)

### Public Pages

- ISR-enabled with skeleton loading states
- Hero video/image with WebP optimization
- Responsive grid/table layouts
- Search across all content types

## Development

### Frontend Development

```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Backend Development

```bash
cd backend
php artisan serve           # Start dev server
php artisan migrate:fresh   # Reset database
php artisan test            # Run tests
```

## Deployment

### Frontend (Vercel/Netlify)

1. Build: `npm run build`
2. Deploy `.next/` folder

### Backend (Traditional Hosting)

1. Upload files to server
2. Configure `.env` with production settings
3. Run `php artisan migrate:fresh --seed`
4. Configure web server to point to `public/`

## Environment Variables

### Frontend (.env)

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_REVALIDATION_SECRET=your-secret-here
```

### Backend (.env)

```
APP_URL=https://api.okjtech.co.ke
FRONTEND_URL=https://okjtech.co.ke

SANCTUM_STATEFUL_DOMAINS=okjtech.co.ke

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=okjtech_db
DB_USERNAME=your_username
DB_PASSWORD=your_password

NEXT_URL=https://okjtech.co.ke
NEXT_REVALIDATION_SECRET=your-secret-here
```

## License

Copyright © 2025 OKJTech. All rights reserved.
