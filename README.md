# README.md
# GHF Full Office System - Frontend

A comprehensive React-based frontend application for the GH Foundation Office Management System, built with Material-UI and modern React patterns.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication with auto-refresh
- Role-based access control (Admin, HR Manager, Department Head, Employee)
- Permission-based route and component protection
- Secure password management

### 👥 Employee Management
- Multi-step employee registration (Basic Info → Personal Info → Bio Data)
- Complete employee profiles with tabbed interface
- Advanced search and filtering
- Document upload and management
- Role-based permissions for all actions

### 📋 Leave Management
- Comprehensive leave application system
- Leave balance tracking and validation
- Multi-level approval workflow
- Leave calendar and reporting
- Different leave types with specific rules

### ⏰ Attendance Management
- Real-time clock in/out system
- Attendance tracking and reporting
- Working hours calculation
- Weekly and monthly summaries
- Biometric integration ready

### 🏢 Department Management
- Department structure visualization
- Employee assignment and hierarchy
- Department-specific reporting

### 💰 Finance Modules
- Budget management and tracking
- Asset register and management
- Requisition forms and approval workflow
- Expense tracking and reporting

### 📄 Document Management
- File upload and categorization
- Document versioning
- Secure file storage and retrieval

### 📊 Reports & Analytics
- Comprehensive reporting dashboard
- Attendance and leave analytics
- Employee performance metrics
- Exportable reports

## Tech Stack

- **Frontend Framework**: React 18 with Hooks
- **Build Tool**: Vite
- **UI Library**: Material-UI v5
- **State Management**: Redux Toolkit
- **Server State**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Form Handling**: Formik + Yup
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Notifications**: Notistack

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Layout, Forms, etc.)
│   ├── features/       # Feature-specific components
│   └── ui/            # Theme and styling components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── routes/             # Routing configuration
├── services/           # API services and utilities
├── store/              # Redux store and slices
├── utils/              # Utility functions
└── constants/          # Application constants
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ghf-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   VITE_API_BASE_URL=http://185.172.57.203:3000/api/v1
   VITE_APP_NAME=GHF Office System
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Key Features

### Role-Based Access Control
The system implements comprehensive role-based access control with the following roles:
- **Admin**: Full system access
- **HR Manager**: Employee and leave management
- **Department Head**: Department-specific management and approvals
- **Employee**: Personal profile and leave requests

### Dynamic Navigation
The navigation menu is dynamically generated based on user permissions, ensuring users only see features they have access to.

### Responsive Design
The application is fully responsive and works seamlessly across desktop, tablet, and mobile devices.

### Theme Support
Built-in light and dark theme support with user preference persistence.

## API Integration

The frontend is designed to work with the GHF Backend API. Key integration points:

- **Base URL**: `http://185.172.57.203:3000/api/v1`
- **Authentication**: JWT with automatic token refresh
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **File Upload**: Support for document and image uploads

## Security

- Route-level authentication guards
- Component-level permission checking
- Secure API communication with automatic token management
- XSS and CSRF protection measures

## Contributing

1. Follow the established folder structure
2. Use TypeScript for new components
3. Follow Material-UI design guidelines
4. Write comprehensive tests for new features
5. Follow the existing code style and conventions

## License

This project is proprietary software developed for GH Foundation.

## Support

For support and questions, contact the development team at it@ghf.org.# ghf-frontend2
