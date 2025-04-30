# Medora Medical Center

## Overview

A comprehensive medical center management system built with React and Supabase, featuring a patient-facing website and a robust admin dashboard. The project combines modern design with powerful functionality to create an efficient healthcare management solution. While this is a demo project, it demonstrates advanced web development capabilities in the healthcare sector.

## [Live Demo](https://medora-center1.web.app/)

## Key Features

### Public Website

- **Arabic public website** including full Arabic RTL support
- **Interactive Appointment Booking System**
- **Doctor Directory** with specialization filtering
- **Medical Services Catalog**
- **Health Blog** with categories and search
- **Patient Testimonials**
- **Contact Management System**
- **Responsive Design** for all devices

### Admin Dashboard

- **Role-Based Access Control**
  - Super Admin
  - Admin
  - Editor
  - Moderator
  - Viewer
- **Patient Management**
  - Patient profiles
  - Medical history
  - Appointment tracking
- **Doctor Management**
  - Doctor profiles
  - Specialization assignment
  - Schedule management
- **Appointment System**
  - Real-time booking
  - Status tracking
  - Calendar view
- **Content Management**
  - Blog posts and categories
  - Service descriptions
  - Site content and images
- **Analytics Dashboard**
  - Visit statistics
  - Appointment metrics
  - Patient demographics
  - Performance analytics

### User Features

- **Patient Portal**
  - Appointment booking
  - Message center
  - Testimonial submission

## Tech Stack

### Frontend

- React 19
- React Router DOM 7.5
- Redux Toolkit for state management
- React Markdown for blog content
- Font Awesome 6.7 for icons
- Recharts for analytics visualization
- Leaflet for location mapping
- Date-fns for date handling

### Backend & Services

- Supabase for:
  - Authentication
  - Database
  - Real-time updates
  - File storage
- Firebase for hosting

### Development Tools

- Create React App
- dotenv for environment variables
- Testing libraries (Jest, React Testing Library)

## Project Structure

```
medora_center/
├── src/
│   ├── components/
│   │   ├── admin/                      # Admin dashboard components
│   │   │   ├── adminsManagement/       # Admin user management
│   │   │   ├── analytics/              # Analytics components
│   │   │   ├── appointments/           # Appointment management
│   │   │   ├── blogManagement/         # Blog content management
│   │   │   ├── contactMessages/        # Contact form management
│   │   │   ├── doctorManagement/       # Doctor profiles management
│   │   │   ├── servicesManagement/     # Medical services management
│   │   │   ├── siteSettings/          # Website configuration
│   │   │   ├── testimonials/          # Patient reviews management
│   │   │   ├── usersManagement/       # Patient management
│   │   │   ├── AdminHome.js           # Dashboard home
│   │   │   └── AdminLayout.js         # Dashboard layout
│   │   ├── common/                    # Shared components
│   │   │   ├── ErrorBoundary.js       # Error handling
│   │   │   ├── Footer.js              # Site footer
│   │   │   ├── Header.js              # Site header
│   │   │   ├── Loader.js              # Loading states
│   │   │   ├── Toast.js               # Notifications
│   │   │   └── ...
│   │   ├── site/                      # Public website components
│   │   │   ├── aboutUs/               # About page components
│   │   │   ├── blog/                  # Blog components
│   │   │   ├── booking/               # Appointment booking
│   │   │   ├── contact/               # Contact components
│   │   │   ├── doctors/               # Doctor listings
│   │   │   ├── home/                  # Homepage components
│   │   │   └── services/              # Services components
│   │   └── user/                      # Patient portal components
│   ├── config/                        # Configuration files
│   │   └── roles.js                   # RBAC configuration
│   ├── hooks/                         # Custom React hooks
│   │   ├── useAdminState.js          # Admin state management
│   │   ├── useAuthorization.js       # Authorization logic
│   │   └── useToast.js               # Toast notifications
│   ├── redux/                         # Redux state management
│   │   ├── slices/                    # Redux slices
│   │   └── store.js                   # Redux store
│   ├── style/                         # CSS stylesheets
│   ├── supabase/                      # Supabase configuration
│   │   ├── authUtils.js              # Authentication utilities
│   │   └── supabaseClient.js         # Supabase client setup
│   ├── utils/                         # Utility functions
│   ├── App.js                         # Main application component
│   └── index.js                       # Entry point
├── public/                            # Static assets
│   ├── favicon.ico                    # Site favicon
│   ├── index.html                     # HTML template
│   ├── logo.png                       # Site logo
│   ├── manifest.json                  # PWA manifest
│   └── robots.txt                     # SEO configuration
├── Database/                          # SQL schema files
├── build/                             # Production build
├── package.json                       # Project dependencies
├── firebase.json                      # Firebase configuration
├── LICENSE                            # MIT License
└── README.md                          # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm/yarn
- Supabase account
- Firebase account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Mohamed176b/Medora-Center
   cd medora_center
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a .env file with:

   ```
   REACT_APP_SUPABASE_URL=your-supabase-url
   REACT_APP_SUPABASE_ANON_KEY=your-supabase-key
   ```

4. **Database Setup**

   - Run SQL scripts from the Database folder
   - Configure Supabase RLS policies

5. **Start Development Server**
   ```bash
   npm start
   ```

## Features In Detail

### Appointment System

- Real-time appointment booking
- Doctor availability checking
- Appointment rescheduling
- Cancellation management

### Doctor Management

- Profile creation and management
- Specialization assignment
- Service association

### Patient Portal

- Appointment scheduling
- Message center
- Review submission

### Blog System

- Multi-category support
- Rich text editing
- Image management
- View tracking
- Search functionality

### Analytics

- Patient demographics
- Appointment statistics
- Service popularity
- Website traffic
- User engagement metrics
- Performance tracking

## Deployment

### Firebase Deployment

1. **Install Firebase CLI**

   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**

   ```bash
   firebase login
   firebase init
   ```

3. **Build Project**

   ```bash
   npm run build
   ```

4. **Deploy**
   ```bash
   firebase deploy
   ```

## Security

- Role-Based Access Control (RBAC)
- Secure authentication via Supabase
- Data encryption
- Input validation

## Maintenance

### Regular Tasks

- Security updates
- Dependency updates
- Database optimization
- Performance monitoring
- Backup management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- **Developer**: Mohamed Elshafey
- **Email**: moshafey18@gmail.com
- **Portfolio**: [elshafey-portfolio.web.app](https://elshafey-portfolio.web.app/)

---

**Note**: This is a demo project showcasing web development capabilities in the healthcare sector. The medical center and its services, doctors are fictional.

Made with ❤️ by Mohamed ElShafey - © 2025
