# Node.js Version Compatibility Guide

This document provides important information about Node.js version compatibility for the AI Fight Club frontend application.

## Recommended Node.js Versions

For optimal compatibility with Next.js 15.2.4, we recommend using:

- **Node.js 18.x** (LTS)
- **Node.js 20.x** (LTS)

These versions are officially supported by Next.js 15 and have been thoroughly tested for compatibility.

## Known Issues with Node.js 22+

Using Node.js versions 22 and above (including v22.13.0) may cause compatibility issues with Next.js 15.2.4, including:

- Missing module errors (e.g., `Cannot find module '../shared/lib/router/utils/path-has-prefix'`)
- Permission issues with Next.js binaries
- Unexpected behavior with CommonJS modules

These issues occur because Node.js 22+ includes breaking changes that may affect how Next.js's internal modules operate.

## Resolving Node.js Compatibility Issues

If you're experiencing issues related to Node.js compatibility:

1. **Check your Node.js version**:
   ```bash
   node -v
   ```

2. **Install a compatible Node.js version** using a version manager like nvm:
   ```bash
   # Install nvm (if not already installed)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
   
   # Install and use Node.js 20
   nvm install 20
   nvm use 20
   ```

3. **Reinstall dependencies** after switching Node.js versions:
   ```bash
   rm -rf node_modules
   npm install
   ```

## Understanding the Technical Stack

### Module Systems

The application uses a mix of module systems:

- **ESM (ECMAScript Modules)**: Used in most of the application code
- **CommonJS**: Used in some Next.js internal modules and configuration files

This mixed approach is standard for Next.js applications and is handled automatically by Next.js's build system.

### Testing Framework

The application uses Vitest for unit and component testing, while Next.js has its own internal testing utilities (which is why you might see references to `next-test.js` in error stacks).

### Polyfills and Patches

The `fix-and-run.sh` script includes several polyfills and patches:

1. **Exports/Module Polyfill**: Provides global `exports` and `module` objects in the browser environment
2. **HMR Configuration**: Configures Hot Module Replacement for better development experience
3. **Cache Cleaning**: Removes Next.js cache to prevent stale build artifacts

These are standard practices for ensuring compatibility across different environments and are not indicative of issues with the codebase itself.
