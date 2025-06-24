# Internship Certificate Generator System

## Overview

This is a full-stack application designed to generate and verify digital internship certificates. The system provides a streamlined workflow for organizations to create branded certificates for their interns and allows public verification of certificate authenticity through unique QR codes and certificate IDs.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui with Radix UI primitives and Tailwind CSS
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Authentication**: Firebase Authentication with Google OAuth support
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Cloud Provider**: Neon Database (@neondatabase/serverless) for serverless PostgreSQL
- **File Storage**: Firebase Storage for asset management (logos, signatures)
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple

### Authentication System
- **Provider**: Firebase Authentication
- **Methods**: Email/password and Google OAuth
- **Session Storage**: Server-side sessions stored in PostgreSQL
- **Authorization**: Route-based guards with setup completion checks

## Key Components

### User Onboarding Flow
1. **Authentication**: Users sign in via email/password or Google OAuth
2. **Initial Setup**: First-time users configure company branding (logo, signatures, company details)
3. **Template Selection**: Choose from three certificate templates (classic, modern, elegant)
4. **Dashboard Access**: Complete setup unlocks full application features

### Certificate Management
- **Intern Registration**: Add intern details (name, email, domain, duration)
- **Certificate Generation**: Automated certificate creation with company branding
- **Template Rendering**: Dynamic certificate templates with QR code integration
- **Download/Print**: Export certificates as printable documents

### Verification System
- **Public Verification**: Certificate verification via `/verify/:certificateId` route
- **QR Code Integration**: Each certificate includes a QR code linking to verification page
- **Verification Tracking**: Analytics on certificate verification frequency

### Data Models
- **UserSettings**: Company configuration and branding preferences
- **Intern**: Intern information and certificate details
- **CertificateVerification**: Verification analytics and tracking

## Data Flow

1. **User Registration**: Firebase Auth → UserSettings creation → Setup completion
2. **Intern Addition**: Form submission → Database storage → Certificate ID generation
3. **Certificate Generation**: Template selection → Dynamic rendering → QR code integration
4. **Verification**: Public access → Certificate lookup → Verification display + analytics

## External Dependencies

### Firebase Services
- **Authentication**: User management and OAuth integration
- **Firestore**: Real-time database for user settings and intern data
- **Storage**: File hosting for company logos and signatures

### Database Infrastructure
- **Neon Database**: Serverless PostgreSQL for production scalability
- **Drizzle Kit**: Database migrations and schema management
- **Connection Pooling**: Optimized for serverless environments

### UI Framework
- **Shadcn/ui**: Comprehensive component library
- **Radix UI**: Accessible primitive components
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **Lucide React**: Icon library for consistent iconography

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR on port 5000
- **Database**: Local PostgreSQL or Neon development instance
- **Environment Variables**: Firebase configuration and database URLs

### Production Deployment
- **Platform**: Replit autoscale deployment
- **Build Process**: Vite frontend build + esbuild server bundling
- **Port Configuration**: External port 80 mapping to internal port 5000
- **Asset Serving**: Static file serving through Express middleware

### Environment Configuration
- **NODE_ENV**: Development/production mode switching
- **DATABASE_URL**: PostgreSQL connection string (required)
- **Firebase Config**: API keys and project configuration via environment variables

## Changelog
- June 24, 2025: Initial setup complete
- June 24, 2025: Added Firebase error handling and setup guidance
- June 24, 2025: Fixed routing issues with wouter navigation
- June 24, 2025: Removed Firebase Storage dependency (uses data URLs instead)
- June 24, 2025: Added bulk CSV import feature for intern management

## User Preferences

Preferred communication style: Simple, everyday language.