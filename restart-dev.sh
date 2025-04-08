#!/bin/bash

# Kill any existing Next.js processes running on port 3333
echo "Checking for existing Next.js processes..."
NEXT_PIDS=$(ps aux | grep "next dev" | grep -v grep | awk '{print $2}')
TRANSFORM_PIDS=$(ps aux | grep "transform.js" | grep -v grep | awk '{print $2}')

if [ -n "$NEXT_PIDS" ]; then
  echo "Killing Next.js processes: $NEXT_PIDS"
  kill $NEXT_PIDS
fi

if [ -n "$TRANSFORM_PIDS" ]; then
  echo "Killing transform processes: $TRANSFORM_PIDS"
  kill $TRANSFORM_PIDS
fi

# Wait a moment for processes to terminate
sleep 2

# Check if port 3333 is still in use
if netstat -tuln | grep ":3333 " > /dev/null; then
  echo "Port 3333 is still in use. Forcing kill..."
  fuser -k 3333/tcp
  sleep 1
fi

# Start the development server
echo "Starting development server..."
npm run dev
