# OKJTech - React + Laravel Application

A modern web application built with React (frontend) and Laravel (backend API), migrated from the legacy PHP site.

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
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── api/       # API client and endpoints
│   │   ├── components/# React components
│   │   │   ├── layout/    # Header, Footer, Layout
│   │   │   ├── hero/      # Hero slider components
│   │   │   ├── portfolio/ # Portfolio components
│   │   │   └── contact/   # Contact form components
│   │   ├── config/    # App configuration
│   │   ├── pages/     # Page components
│   │   └── types/     # TypeScript types
│   └── public/        # Static assets
│
└── backend/           # Laravel 12 API
    ├── app/
    │   ├── Http/Controllers/Api/  # API controllers
    │   └── Models/                # Eloquent models
    ├── database/migrations/       # Database migrations
    └── routes/api.php             # API routes
```

## Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **GSAP** - Advanced animations
- **React Router** - Routing
- **Axios** - API client
- **Lucide React** - Icons

### Backend

- **Laravel 12** - PHP framework
- **Laravel Sanctum** - API authentication
- **MySQL** - Database

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

# Run migrations
php artisan migrate

# Seed sample data (optional)
php artisan db:seed

# Start development server
php artisan serve
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start development server
npm run dev
```

## API Endpoints

### Public Endpoints

| Method | Endpoint                                         | Description                      |
| ------ | ------------------------------------------------ | -------------------------------- |
| GET    | `/api/portfolio`                               | Get all portfolio projects       |
| GET    | `/api/portfolio/categories`                    | Get project categories           |
| GET    | `/api/portfolio/featured`                      | Get featured projects            |
| GET    | `/api/portfolio/{id}`                          | Get single project               |
| POST   | `/api/contact`                                 | Submit contact form              |
| GET    | `/api/contact/available-times?date=YYYY-MM-DD` | Get available consultation times |

### Protected Endpoints (require authentication)

| Method | Endpoint                         | Description              |
| ------ | -------------------------------- | ------------------------ |
| POST   | `/api/portfolio`               | Create new project       |
| PUT    | `/api/portfolio/{id}`          | Update project           |
| DELETE | `/api/portfolio/{id}`          | Delete project           |
| GET    | `/api/submissions`             | Get contact submissions  |
| PUT    | `/api/submissions/{id}/status` | Update submission status |
| GET    | `/api/analytics/dashboard`     | Get analytics stats      |

## Features

### Hero Section

- Scroll-driven navigation
- Typewriter text animation
- Progress indicator
- Slide chips for direct navigation

### Portfolio

- Category filtering
- Search functionality
- Responsive grid layout
- Project detail cards

### Contact Form

- Form validation
- Consultation booking
- Country code selection
- Success/error feedback

## Development

### Frontend Development

```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
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
2. Deploy `dist/` folder

### Backend (Traditional Hosting)

1. Upload files to server
2. Configure `.env` with production settings
3. Run `php artisan migrate`
4. Configure web server to point to `public/`

## Environment Variables

### Frontend (.env)

```
VITE_API_URL=https://api.okjtech.co.ke/api
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
```

## License

Copyright © 2025 OKJTech. All rights reserved.
