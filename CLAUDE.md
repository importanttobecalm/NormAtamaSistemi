# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Norm Fazlası Öğretmen Atama Sistemi** - A web-based surplus teacher assignment system built with Node.js/Express backend and React frontend.

## Development Commands

### Setup and Installation
```bash
# Install all dependencies (root, server, client)
npm run install-all

# Install only root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd client && npm install
```

### Development
```bash
# Start both server and client in development mode
npm run dev

# Start only server (port 5000)
npm run server

# Start only client (port 3000)
npm run client
```

### Production
```bash
# Build client for production
npm run build

# Start production server
npm start
```

## Architecture Overview

### Backend (server/)
- **Framework**: Express.js with Node.js
- **Database**: MySQL with mysql2 driver
- **Authentication**: JWT tokens with bcryptjs hashing
- **Security**: Helmet, CORS, rate limiting
- **Structure**:
  - `config/` - Database configuration
  - `middleware/` - Auth and validation middleware
  - `models/` - Database models (Teacher, Position, etc.)
  - `routes/` - API endpoints organized by feature
  - `database/` - SQL schema and migration files

### Frontend (client/)
- **Framework**: React 18 with functional components
- **Routing**: React Router DOM v6
- **State**: Context API for authentication
- **HTTP**: Axios for API calls
- **Styling**: Custom CSS with responsive design
- **Structure**:
  - `components/` - Reusable UI components
  - `contexts/` - React contexts (AuthContext)
  - `pages/` - Page components organized by user type
  - `public/` - Static assets

### Database Schema
Key tables:
- `admin_users` - Admin authentication
- `teachers` - Teacher profiles and credentials
- `positions` - Available job positions
- `preference_periods` - Time windows for preferences
- `preferences` - Teacher job preferences with rankings

## Key Features

### Admin Module (/admin)
- Teacher management (CRUD operations)
- Position management
- Preference period management
- Dashboard with statistics
- Authentication: username/password

### Teacher Module (/teacher)
- View personal information
- Submit ranked job preferences (max 25)
- Real-time countdown timer during preference periods
- Authentication: TC ID + birth date

## Important Configuration

### Environment Variables (server/.env)
```
PORT=5000
JWT_SECRET=your_jwt_secret_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=norm_atama_db
NODE_ENV=development
```

### Database Setup
1. Run `server/database/schema.sql` to create tables
2. Default admin user: username `admin`, password `admin123`
3. Sample teachers included for testing

### Security Features
- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting on login endpoints
- Input validation with express-validator
- CORS protection
- SQL injection prevention

## API Routes Structure

```
/api/auth/*           - Authentication endpoints
/api/admin/*          - Admin-only endpoints
/api/teacher/*        - Teacher-only endpoints
```

## Development Notes

- Frontend proxy configured to backend (localhost:5000)
- Development mode runs both servers concurrently
- Authentication state managed via React Context
- Responsive design for mobile compatibility
- Turkish language UI

## Testing Credentials

**Admin**: username `admin`, password `admin123`

**Teachers** (TC ID / Birth Date):
- 12345678901 / 15.05.1985
- 12345678902 / 22.03.1982
- 12345678903 / 08.11.1988

## Common Issues

1. **Database connection errors**: Check MySQL is running and credentials in .env
2. **Port conflicts**: Ensure ports 3000 and 5000 are available
3. **JWT errors**: Verify JWT_SECRET is set in environment
4. **CORS issues**: Check proxy configuration in client/package.json

## Next Development Steps

The application framework is complete. Priority areas for enhancement:
1. Complete admin management pages (currently placeholders)
2. Implement drag-and-drop preference ranking
3. Add bulk import functionality for teachers/positions
4. Implement automated assignment algorithm
5. Add email notifications
6. Enhanced reporting and analytics