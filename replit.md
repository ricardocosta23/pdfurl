# PDF Upload & Share Application

## Overview

This is a full-stack web application for uploading, managing, and sharing PDF files. Built with a modern TypeScript stack, it provides a clean interface for users to upload PDF documents and generate shareable links. The application features drag-and-drop file uploads, file management with a table view, and real-time feedback through toast notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **File Uploads**: Multer middleware for handling multipart/form-data
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod schemas shared between client and server
- **Storage Strategy**: Local file storage with fallback to in-memory storage for development

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for production)
- **File Storage**: Local filesystem with organized directory structure
- **Development Fallback**: In-memory storage implementation for rapid development
- **Schema Management**: Drizzle migrations with version control

### Authentication and Authorization
- **Current State**: Basic structure in place with user schema
- **Implementation**: Session-based authentication ready to be implemented
- **Security**: File access controls and validation for PDF-only uploads

### API Architecture
- **Pattern**: RESTful API design
- **File Operations**: CRUD operations for PDF management
- **Upload Endpoint**: Dedicated multipart upload handling with size limits
- **Static Serving**: Direct file serving with CORS headers
- **Error Handling**: Centralized error middleware with proper HTTP status codes

### Key Design Decisions

**Monorepo Structure**: Chosen to share TypeScript types and validation schemas between client and server, reducing duplication and ensuring type safety across the full stack.

**Drizzle ORM**: Selected for its TypeScript-first approach and excellent developer experience, with built-in migration support and type inference.

**Shadcn/ui Components**: Provides a comprehensive, accessible component library that's customizable and maintains design consistency.

**TanStack Query**: Handles server state management, caching, and synchronization, reducing boilerplate code for API interactions.

**Local File Storage**: Simple and reliable for MVP, with clear path to migrate to cloud storage services later.

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity optimized for serverless environments
- **@tanstack/react-query**: Server state management and data fetching
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **express**: Web application framework for Node.js
- **multer**: Middleware for handling file uploads
- **zod**: TypeScript schema validation library

### UI and Styling
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant management for components
- **lucide-react**: Modern icon library

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **drizzle-kit**: Database migration and management tool
- **wouter**: Lightweight React router

### Database Integration
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation