# Running the Enhanced AI Fight Club Application

This document provides instructions for running the enhanced AI Fight Club frontend application.

## Prerequisites

- Node.js version 18.x or 20.x (recommended for compatibility with Next.js 15.2.4)
- npm version 9.x or 10.x

## Installation

1. Clone the repository or extract the provided zip file
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Environment Setup

1. Create a `.env.local` file in the project root with the following content:

```
NEXT_PUBLIC_FEATURE_LOGGING=true
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Running the Application

### Development Mode

To run the application in development mode:

```bash
npm run start
```

This will:
1. Clean up any existing Node processes
2. Remove the Next.js cache
3. Apply necessary polyfills and patches
4. Start the development server on port 3333

You can then access the application at: http://localhost:3333

### Production Build

To create a production build:

```bash
npm run build
```

To serve the production build:

```bash
npm run serve
```

## Troubleshooting

### Module Dependency Issues

If you encounter module dependency issues with Next.js, try the following:

1. Ensure you're using a compatible Node.js version (18.x or 20.x)
2. Clear the Next.js cache:

```bash
rm -rf .next
rm -rf node_modules/.cache
```

3. Reinstall dependencies:

```bash
rm -rf node_modules
npm install
```

### Permission Issues

If you encounter permission issues when running Next.js commands:

1. Make sure the fix-and-run.sh script is executable:

```bash
chmod +x ./fix-and-run.sh
```

2. Try running Next.js directly with node:

```bash
NODE_OPTIONS='--require ./fix-exports.js' node node_modules/next/dist/bin/next dev -p 3333
```

## Development Features

### Logging System

The enhanced application includes a comprehensive logging system with the following features:

- Performance measurement tracking
- User interaction logging
- Game event tracking
- Global error handling
- Session tracking
- Log filtering and export

To access the log debugger during development:
1. Run the application in development mode
2. Look for the "Show Logs" button in the bottom-right corner of the screen
3. Click to expand the log debugger panel
4. Use the filters to view specific log types or search for specific content
5. Export logs in JSON or CSV format for further analysis

### Game Flow Testing

To test the complete game flow:
1. Start from the welcome page
2. Complete the assessment
3. Select a focus area
4. Complete all three rounds
5. View your results

Each stage includes proper state management and will prevent unauthorized access to later stages without completing the previous ones.
