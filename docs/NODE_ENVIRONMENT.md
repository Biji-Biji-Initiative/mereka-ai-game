# Node.js Environment Setup for Next.js 15

This file contains instructions for setting up the proper Node.js environment for running the AI Fight Club frontend application.

## Required Node.js Version

This application requires **Node.js 20 LTS** (or later) for optimal compatibility with Next.js 15.

```bash
# Check your current Node.js version
node -v

# Expected output should be v20.x.x
```

## Environment Variables

The following environment variables are used by the application:

```
# Server port
PORT=3333

# API URL (for backend communication)
NEXT_PUBLIC_API_URL=http://localhost:3080/api

# Disable telemetry
NEXT_TELEMETRY_DISABLED=1

# Allow HMR from any origin (for development)
NEXT_HMR_ALLOW_ORIGIN=*
```

## Node.js Compatibility Notes

1. **ESM vs CommonJS**: Next.js 15 uses a hybrid module system. The application includes polyfills to handle compatibility issues between ESM and CommonJS modules.

2. **Module Resolution**: The application uses the "bundler" moduleResolution strategy in TypeScript, which is optimized for Next.js 15.

3. **Memory Management**: For large builds, you may need to increase the Node.js memory limit:

```bash
# Increase memory limit to 4GB
export NODE_OPTIONS="--max-old-space-size=4096"
```

4. **Recommended Node.js Installation Method**:

We recommend using [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm) to manage Node.js versions:

```bash
# Install Node.js 20 LTS
nvm install 20

# Use Node.js 20 LTS
nvm use 20
```

## Troubleshooting Common Issues

1. **Module Resolution Errors**: If you encounter module resolution errors, try clearing the cache:

```bash
npm run clean
```

2. **Dependency Issues**: If you encounter dependency issues, try reinstalling dependencies:

```bash
rm -rf node_modules
npm install
```

3. **Port Conflicts**: If port 3333 is already in use, you can change the port:

```bash
# Start on a different port
npm run dev -- -p 3334
```
