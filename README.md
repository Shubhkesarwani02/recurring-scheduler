# Recurring Scheduler

A full-stack application for managing weekly recurring schedules with exception handling.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0%2B-blue.svg)

## 🚀 Features

- ✅ Weekly calendar view with infinite scroll
- ✅ Max 2 slots per day enforcement
- ✅ Recurring slot patterns (weekly)
- ✅ Per-date exceptions (update/delete)
- ✅ Optimistic UI updates with rollback
- ✅ Time conflict validation
- ✅ Mobile-first responsive design
- ✅ Real-time error handling
- ✅ TypeScript throughout

## 🏗️ Architecture

- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: Node.js with Express, TypeScript, and Knex query builder
- **Database**: PostgreSQL (Neon platform)

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL database (Neon recommended)

## 🛠️ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Shubhkesarwani02/recurring-scheduler.git
cd recurring-scheduler
```

### 2. Install dependencies
```bash
# Install root dependencies and all sub-projects
npm run install:all
```

### 3. Environment Setup

**Backend Environment:**
```bash
# Copy the example environment file
cp backend/.env.example backend/.env

# Update backend/.env with your database credentials:
DATABASE_URL=your_neon_connection_string
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend Environment:**
```bash
# Copy the example environment file
cp frontend/.env.example frontend/.env.local

# Update if needed (default should work):
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Database Setup

Ensure your PostgreSQL database has the required tables. The schema is automatically handled by the application, but you can manually create them:

```sql
-- Create slots table
CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exceptions table
CREATE TABLE exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID REFERENCES slots(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  override_start TIME,
  override_end TIME,
  status TEXT NOT NULL CHECK (status IN ('updated', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (slot_id, date)
);

-- Create indexes
CREATE INDEX idx_slots_day_of_week ON slots(day_of_week);
CREATE INDEX idx_exceptions_date ON exceptions(date);
```

### 5. Start Development Servers

**Option 1: Start both servers simultaneously**
```bash
npm run dev
```

**Option 2: Start servers individually**
```bash
# Terminal 1 - Backend (Port 5000)
npm run dev:backend

# Terminal 2 - Frontend (Port 3000)
npm run dev:frontend
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## 📚 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/slots?weekStart=YYYY-MM-DD` | Get slots for a specific week |
| POST | `/api/slots` | Create a new recurring slot |
| PUT | `/api/slots/:id` | Update slot (creates exception) |
| DELETE | `/api/slots/:id` | Delete slot (creates exception) |

### Example Requests

**Create a recurring slot:**
```bash
curl -X POST http://localhost:5000/api/slots \
  -H "Content-Type: application/json" \
  -d '{
    "day_of_week": 1,
    "start_time": "09:00",
    "end_time": "10:00"
  }'
```

**Get slots for a week:**
```bash
curl "http://localhost:5000/api/slots?weekStart=2025-09-15"
```

**Update a slot for specific date:**
```bash
curl -X PUT http://localhost:5000/api/slots/slot-id \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-09-16",
    "start_time": "10:00",
    "end_time": "11:00"
  }'
```

## 🏗️ Project Structure

```
recurring-scheduler/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   └── db/              # Database configuration
│   ├── .env.example         # Environment template
│   └── package.json
├── frontend/                # Next.js application
│   ├── app/                 # Next.js 14 app directory
│   ├── components/          # React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and API client
│   ├── types/               # TypeScript types
│   ├── .env.example         # Environment template
│   └── package.json
├── .gitignore              # Git ignore rules
├── LICENSE                 # MIT license
├── README.md              # This file
└── package.json           # Root package.json
```

## 🧪 Usage Examples

### Creating Slots
1. Click the **+** button on any day to create a new recurring slot
2. Select start and end times using the time picker
3. The slot will be created for that day of the week across all weeks

### Editing Slots
1. Click on an existing slot to modify it
2. Changes apply only to the selected date (creates an exception)
3. The original recurring pattern remains intact

### Deleting Slots
1. Click the trash icon next to any slot
2. The slot is deleted only for that specific date
3. Other occurrences of the recurring slot remain

## 🔧 Business Rules

- **Maximum 2 slots per day** - Enforced at both frontend and backend
- **No time conflicts** - Slots cannot overlap in time
- **Exception-based updates** - Modifications create exceptions, preserving the original pattern
- **Optimistic UI** - Immediate feedback with rollback on errors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or need support:

1. Check the [existing issues](https://github.com/yourusername/recurring-scheduler/issues)
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🚀 Deployment

### Backend Deployment
- Set environment variables in your hosting platform
- Ensure PostgreSQL database is accessible
- Build with `npm run build:backend`

### Frontend Deployment
- Configure `NEXT_PUBLIC_API_URL` for your backend
- Build with `npm run build:frontend`
- Deploy to platforms like Vercel, Netlify, or similar

## 🔗 Links

- [Live Demo](https://your-demo-url.com) (if available)
- [API Documentation](https://your-api-docs.com) (if available)
- [Report Issues](https://github.com/yourusername/recurring-scheduler/issues)
