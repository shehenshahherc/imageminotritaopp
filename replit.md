# Image Display API

## Overview

A real-time image display application built with a modern full-stack architecture. The system allows users to upload images through multiple methods (base64, URL, or multipart file upload) and view them in real-time across all connected clients via WebSocket connections. The application features a clean, responsive UI built with React and shadcn/ui components, backed by an Express server with PostgreSQL database storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**React SPA with Vite Build System**
- Single-page application using React 18 with TypeScript
- Vite as the build tool and development server, providing fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing
- Component-based architecture with shadcn/ui design system (New York style variant)

**State Management**
- TanStack Query (React Query) for server state management and API data fetching
- Custom WebSocket hook (`use-websocket`) for real-time connection management
- Local React state for UI interactions

**UI Component System**
- shadcn/ui components built on Radix UI primitives
- Tailwind CSS for styling with CSS variables for theming
- Comprehensive component library including dialogs, toasts, forms, cards, and data display components
- Custom fonts: Inter (sans-serif), JetBrains Mono (monospace), Georgia (serif)

**Real-Time Communication**
- WebSocket client implementation with automatic reconnection logic
- Connection status monitoring with visual indicators
- Bi-directional communication for image updates and ping/pong latency measurement

### Backend Architecture

**Express.js REST API Server**
- Node.js runtime with ES modules (type: "module")
- Express framework for HTTP routing and middleware
- TypeScript for type safety across client, server, and shared code

**API Endpoints**
- `/api/v1/image/upload` - JSON endpoint for base64 and URL image uploads
- `/api/v1/image/upload/multipart` - Multipart form-data endpoint for file uploads
- Image processing with Sharp library for format conversion and metadata extraction

**File Upload Handling**
- Multer middleware for multipart file uploads
- 10MB file size limit
- Supported formats: JPEG, PNG, GIF, WebP
- In-memory storage buffer processing

**WebSocket Server**
- WebSocket Server (ws library) for real-time updates
- Dedicated `/ws` endpoint for WebSocket connections
- Broadcast mechanism to notify all connected clients of image updates
- Connection state tracking with client Set

### Data Storage Solutions

**Database Layer**
- PostgreSQL database using Neon serverless driver (@neondatabase/serverless)
- Drizzle ORM for type-safe database operations
- Schema-first approach with migrations stored in `/migrations` directory

**Image Storage Schema**
```typescript
images table:
- id (varchar, primary key)
- type (text) - upload method: 'base64', 'url', 'upload'
- data (text) - image data (base64 string, URL, or file path)
- filename (text, nullable)
- format (text, nullable) - 'jpeg', 'png', 'gif', 'webp'
- width (integer, nullable)
- height (integer, nullable)
- size (integer, nullable) - file size in bytes
- uploadedAt (timestamp, default now)
```

**Storage Abstraction**
- IStorage interface for pluggable storage implementations
- MemStorage class for in-memory development storage
- Supports migration to database-backed storage without API changes

### External Dependencies

**Database**
- Neon Serverless PostgreSQL for production data persistence
- Drizzle ORM (v0.39.1) with drizzle-zod for schema validation
- Connection via DATABASE_URL environment variable

**Image Processing**
- Sharp library for server-side image manipulation
- node-fetch for URL-based image downloads
- Base64 encoding/decoding for data URI handling

**UI Component Libraries**
- Radix UI primitives (@radix-ui/react-*) for accessible, unstyled components
- Lucide React for icon system
- class-variance-authority (CVA) for variant-based styling
- tailwind-merge and clsx for className management

**Development Tools**
- Replit-specific plugins for development environment integration
- TSX for TypeScript execution in development
- esbuild for production server bundling
- PostCSS with Tailwind CSS and Autoprefixer

**Session Management**
- connect-pg-simple for PostgreSQL session storage
- Express session middleware (implied by pg-simple dependency)

**Type Safety**
- Zod for runtime schema validation
- Drizzle-zod for database schema to Zod conversion
- @hookform/resolvers for form validation integration