# Node.js Version Requirements

This file contains information about the Node.js version requirements for this project.

## Required Version

This project requires **Node.js 20 LTS** (or later) for optimal compatibility with Next.js 15.

## Why Node.js 20 LTS?

Next.js 15 is designed to work best with Node.js 20 LTS. Using this version ensures:

1. Full compatibility with all Next.js 15 features
2. Proper ESM module resolution
3. Optimal performance
4. Security updates and patches

## Verifying Your Node.js Version

You can check your current Node.js version by running:

```bash
node -v
```

The output should be `v20.x.x` (e.g., v20.11.1).

## Installing Node.js 20 LTS

### Using NVM (Recommended)

We recommend using [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm) to manage your Node.js versions:

```bash
# Install NVM (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Install Node.js 20 LTS
nvm install 20

# Use Node.js 20 LTS
nvm use 20
```

### Direct Installation

Alternatively, you can download and install Node.js 20 LTS directly from the [official Node.js website](https://nodejs.org/).

## .nvmrc File

This project includes an `.nvmrc` file that specifies the required Node.js version. If you're using NVM, you can simply run:

```bash
nvm use
```

And NVM will automatically switch to the correct Node.js version specified in the `.nvmrc` file.

## Troubleshooting

If you encounter issues related to Node.js version compatibility:

1. Verify you're using Node.js 20 LTS
2. Clear your node_modules directory and reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```
3. Ensure your package manager (npm) is up to date:
   ```bash
   npm install -g npm@latest
   ```
