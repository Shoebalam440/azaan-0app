# This file is only for editing file nodes, do not break the structure
## Project Description
Progressive Web App (PWA) for Islamic communities to manage prayer times and receive Azaan notifications. Features admin dashboard for prayer time management and user interface for viewing schedules with push notifications.

## Key Features
- Islamic-themed design system with warm, calming colors
- Admin authentication with email OTP for prayer time management  
- Complete admin dashboard with prayer times CRUD operations
- Real-time prayer time display with intelligent next prayer detection
- Live countdown timer with automatic prayer status updates
- Database persistence using Devv Tables with date-based indexing
- Mobile-first responsive design with optimized touch interactions
- Real-time data synchronization with loading states and error handling
- PWA functionality with offline support and installable app
- Push notification system for prayer times with Azaan audio
- Advanced service worker with intelligent caching strategies
- Installation prompt with browser compatibility
- Notification scheduling and permission management

## Devv SDK Integration
Built-in: auth (OTP verification system), table (prayer_times table with CRUD operations)
Database: prayer_times table (ewa3uqhxhfy8) with date indexing for efficient queries
PWA: Service worker registration, manifest.json, notification API, installation prompts
External: None required - full PWA functionality implemented with native browser APIs

/src
├── assets/          # Static resources directory, storing static files like images and fonts
│
├── components/      # Components directory
│   ├── ui/         # Pre-installed shadcn/ui components, avoid modifying or rewriting unless necessary
│   ├── ProtectedRoute.tsx # Route protection component for admin authentication
│   ├── InstallPrompt.tsx # PWA installation prompt with browser detection
│   └── NotificationSettings.tsx # Notification permission and configuration management
│
├── hooks/          # Custom Hooks directory
│   ├── use-mobile.ts # Pre-installed mobile detection Hook from shadcn (import { useIsMobile } from '@/hooks/use-mobile')
│   └── use-toast.ts  # Toast notification system hook for displaying toast messages (import { useToast } from '@/hooks/use-toast')
│
├── lib/            # Utility library directory
│   ├── utils.ts    # Utility functions, including the cn function for merging Tailwind class names
│   └── notification-service.ts # Comprehensive notification service with PWA integration
│
├── pages/          # Page components directory, based on React Router structure
│   ├── HomePage.tsx # Real-time prayer times display with intelligent countdown and status tracking
│   ├── AdminLogin.tsx # Admin authentication with email OTP verification
│   ├── AdminDashboard.tsx # Admin panel for prayer time management with date navigation
│   └── NotFoundPage.tsx # 404 error page component, displays when users access non-existent routes
│
├── store/          # Zustand state management
│   ├── auth-store.ts # Authentication state with persist middleware
│   └── prayer-store.ts # Prayer times state with real-time data integration
│
├── App.tsx         # Root component, with React Router routing system configured
│                   # Add new route configurations in this file
│                   # Includes catch-all route (*) for 404 page handling
│
├── main.tsx        # Entry file, rendering the root component and mounting to the DOM
│
├── index.css       # Global styles file, containing Tailwind configuration and custom styles
│                   # Modify theme colors and design system variables in this file
│
└── tailwind.config.js  # Tailwind CSS v3 configuration file
# Contains theme customization, plugins, and content paths
# Includes shadcn/ui theme configuration