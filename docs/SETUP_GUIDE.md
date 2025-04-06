# Setup and Installation Guide

This guide provides step-by-step instructions for setting up and running the AI Fight Club application on your local development environment.

## Prerequisites

- **Node.js**: Version 20.x LTS (required)
  - The application is built and tested with Node.js 20 LTS
  - Using other versions may cause compatibility issues
  - [Download Node.js](https://nodejs.org/)

- **npm**: Version 10.x or higher
  - Included with Node.js 20.x installation

- **Git**: For cloning the repository
  - [Download Git](https://git-scm.com/downloads)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd frontend-manus
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies defined in the package.json file.

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit the `.env.local` file to configure your environment variables:

```
# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3333

# API Settings (for future backend integration)
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG_PANEL=true
```

### 4. Start the Development Server

```bash
npm run dev
```

This will start the development server on port 3333. You can access the application at:

```
http://localhost:3333
```

## Production Build

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

## Verifying Installation

After starting the development server, you should see:

1. The welcome page with "AI Fight Club" title
2. Challenge cards displaying different game aspects
3. A "Start Challenge" button

If you encounter any issues, check the troubleshooting section in the main documentation.

## Using NVM (Node Version Manager)

If you use NVM to manage Node.js versions, you can use the included `.nvmrc` file:

```bash
nvm use
```

This will automatically switch to the correct Node.js version (20.x LTS).

## Directory Structure

The application follows this structure:

```
frontend-manus/
├── docs/               # Documentation files
├── public/             # Static assets
├── src/                # Source code
│   ├── app/            # Next.js App Router pages
│   ├── components/     # Reusable UI components
│   ├── features/       # Feature-specific components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── providers/      # React context providers
│   ├── store/          # Global state management
│   └── tests/          # Test files
├── .env.example        # Example environment variables
├── .nvmrc              # Node.js version specification
├── next.config.js      # Next.js configuration
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # TailwindCSS configuration
└── tsconfig.json       # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run Vitest tests
- `npm run e2e` - Run Playwright end-to-end tests
- `npm run type-check` - Check TypeScript types
- `npm run clean` - Clean build cache

## Next Steps

After successful installation, you can:

1. Explore the application features
2. Review the code structure
3. Run tests to verify functionality
4. Refer to the API Integration Guide for connecting to your backend

For more detailed information, refer to the main documentation file.
