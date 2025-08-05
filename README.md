# SynProd - Authentication System

A full-stack authentication system built with React, Spring Boot, and PostgreSQL.

## Tech Stack

### Backend
- **Spring Boot 3.5.4** with Java 21
- **Spring Security** with JWT authentication
- **Spring Data JPA** with Hibernate
- **PostgreSQL** database
- **BCrypt** password hashing
- **JWT** for stateless authentication

### Frontend
- **React 19** with TypeScript
- **React Router** for navigation
- **Axios** for API communication
- **Context API** for state management
- **Custom form validation** with real-time feedback

## Features

### Authentication
- ✅ User registration with email verification
- ✅ User login with JWT tokens
- ✅ Password reset via email
- ✅ Email verification system
- ✅ JWT token refresh mechanism
- ✅ Protected routes
- ✅ Role-based access control (RBAC)

### Security
- ✅ Password strength validation
- ✅ BCrypt password hashing
- ✅ JWT token-based authentication
- ✅ CORS configuration
- ✅ Input validation and sanitization
- ✅ Secure password reset flow

### User Experience
- ✅ Real-time form validation
- ✅ Password strength indicator
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Success feedback

## Getting Started

### Prerequisites
- Java 21
- Node.js 18+
- PostgreSQL
- Docker (optional, for database)

### Backend Setup

1. **Database Setup**
   ```bash
   # Using Docker
   docker run --name synprod-db -e POSTGRES_DB=synprod -e POSTGRES_USER=synprod -e POSTGRES_PASSWORD=your_password -p 5432:5432 -d postgres:15
   ```

2. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=jdbc:postgresql://localhost:5432/synprod
   DATABASE_USERNAME=synprod
   DATABASE_PASSWORD=your_password
   JWT_SECRET=your-super-secret-jwt-key-for-development-only-change-in-production
   ```

3. **Run Backend**
   ```bash
   cd backend
   ./gradlew bootRun
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Frontend**
   ```bash
   npx nx serve frontend
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User Management
- `GET /api/user/profile` - Get current user profile
- `GET /api/user/{id}` - Get user by ID

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Development Notes

### Email Configuration
For development, email links are logged to the console instead of sending actual emails. To enable real email sending:

1. Configure SMTP settings in `application.properties`
2. Uncomment the email sending code in `EmailService.java`

### JWT Configuration
- Access tokens expire in 24 hours
- Refresh tokens expire in 7 days
- Change the JWT secret in production

### Security Considerations
- Use strong JWT secrets in production
- Configure proper CORS settings
- Enable HTTPS in production
- Implement rate limiting
- Add request logging and monitoring

## Project Structure

```
SynProd/
├── backend/
│   ├── src/main/java/com/synprod/SynProd/
│   │   ├── controller/     # REST controllers
│   │   ├── dto/           # Data transfer objects
│   │   ├── entity/        # JPA entities
│   │   ├── repository/    # Data access layer
│   │   ├── security/      # Security configuration
│   │   └── service/       # Business logic
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   ├── src/
│   │   ├── app/           # React components
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── public/
└── docker-compose.yml
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
