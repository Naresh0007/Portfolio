# Naresh Shrestha - Portfolio Website

A modern, full-stack portfolio website showcasing professional experience, projects, and technical skills with stunning UI and interactive features.

## 🚀 Tech Stack

### Backend
- **.NET 8** - Web API
- **PostgreSQL** - Database
- **Entity Framework Core** - ORM
- **Swagger** - API Documentation

### Frontend
- **React 18** - UI Library
- **Vite** - Build Tool
- **CSS3** - Styling with Glassmorphism
- **REST API** - Data Integration

## ✨ Features

- 🎨 **Stunning UI** - Modern glassmorphism design with vibrant gradients
- ✍️ **Typing Animation** - Dynamic role display in hero section
- 🎯 **Interactive Timeline** - Expandable experience cards with animations
- 📊 **Animated Stats** - Counter animations with intersection observer
- 🎭 **Project Showcase** - Filterable project cards with hover effects
- 📈 **Skills Visualization** - Animated progress bars grouped by category
- 🌊 **Smooth Animations** - Micro-interactions and scroll-triggered effects
- 📱 **Responsive Design** - Mobile-first approach
- 🔄 **API Integration** - Dynamic content loading from backend

## 📋 Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/download/) or [Docker](https://www.docker.com/)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
cd /Users/nareshshrestha/Desktop/Portfolio
```

### 2. Database Setup

#### Option A: Using Docker (Recommended)
```bash
# Install Docker Desktop for Mac if not already installed
# Then run:
docker compose up -d
```

#### Option B: Local PostgreSQL
```bash
# Install PostgreSQL and create database
createdb portfolio_db
```

### 3. Backend Setup

```bash
cd portfolio-api

# Restore dependencies
dotnet restore

# Run the API (database will be seeded automatically)
dotnet run
```

The API will start at `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger`

### 4. Frontend Setup

```bash
cd portfolio-frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The frontend will start at `http://localhost:5173`

## 📡 API Endpoints

### Experience
- `GET /api/experience` - Get all work experiences
- `GET /api/experience/{id}` - Get specific experience

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects?category={category}` - Filter by category
- `GET /api/projects/featured` - Get featured projects

### Skills
- `GET /api/skills` - Get skills grouped by category

### Stats
- `GET /api/stats` - Get portfolio statistics

## 🎨 Design System

### Color Palette
- **Primary Background**: `#0a0e27`
- **Secondary Background**: `#151a35`
- **Accent Primary**: `#6366f1` (Indigo)
- **Accent Secondary**: `#8b5cf6` (Purple)
- **Accent Tertiary**: `#ec4899` (Pink)

### Typography
- **Primary Font**: Inter
- **Display Font**: Outfit

### Effects
- Glassmorphism with backdrop blur
- Gradient overlays
- Particle animations
- Smooth transitions
- Hover micro-interactions

## 📁 Project Structure

```
Portfolio/
├── portfolio-api/              # .NET Backend
│   ├── Controllers/           # API Controllers
│   ├── Models/               # Data Models
│   ├── Data/                 # DbContext & Seed Data
│   ├── Program.cs            # App Configuration
│   └── appsettings.json      # Configuration
│
├── portfolio-frontend/        # React Frontend
│   ├── src/
│   │   ├── components/       # React Components
│   │   │   ├── Hero.jsx
│   │   │   ├── ExperienceTimeline.jsx
│   │   │   ├── ProjectShowcase.jsx
│   │   │   ├── SkillsVisualization.jsx
│   │   │   ├── StatsCounter.jsx
│   │   │   └── Footer.jsx
│   │   ├── services/         # API Service
│   │   ├── App.jsx           # Main App
│   │   └── index.css         # Global Styles
│   └── package.json
│
├── docker-compose.yml         # PostgreSQL Container
└── README.md                 # This file
```

## 🧪 Testing

### Backend API Testing
```bash
cd portfolio-api

# Run the API
dotnet run

# Visit Swagger UI
open http://localhost:5000/swagger
```

Test each endpoint in Swagger to verify data is being returned correctly.

### Frontend Testing
```bash
cd portfolio-frontend

# Ensure backend is running first
# Then start frontend
npm run dev

# Visit in browser
open http://localhost:5173
```

Verify:
- ✅ Hero section displays with typing animation
- ✅ Stats counter animates when scrolled into view
- ✅ Experience timeline loads from API
- ✅ Projects can be filtered by category
- ✅ Skills display with animated progress bars
- ✅ All animations are smooth
- ✅ Responsive on mobile devices

## 🚀 Production Build

### Backend
```bash
cd portfolio-api
dotnet publish -c Release -o ./publish
```

### Frontend
```bash
cd portfolio-frontend
npm run build
```

The production build will be in `portfolio-frontend/dist/`

## 🎯 Key Highlights

- **400+ Automated Tests** - Comprehensive test coverage
- **EDI Systems Expertise** - Export documentation workflows
- **Production Features** - Live government integrations
- **CI/CD Pipelines** - Azure DevOps integration
- **Full-Stack Development** - .NET, React, PostgreSQL

## 📝 License

This project is for portfolio demonstration purposes.

## 👤 Author

**Naresh Shrestha**
- Software Engineer at Everest Impex
- Specializing in .NET, EDI systems, and test automation

---

Built with ❤️ using React, .NET 8, and PostgreSQL
