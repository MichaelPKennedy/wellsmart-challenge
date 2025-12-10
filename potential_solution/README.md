# Industrial HMI Interface

A real-time sensor data visualization built with SvelteKit, designed for deployment on PLCnext controllers. Features component-based architecture, Canvas rendering, and WebSocket integration with doubly-linked list data structures for optimal performance.

**This is a tracer-bullet project** - a foundational proof-of-concept that demonstrates the future of industrial control interfaces. Rather than building another static information display, this explores dynamic, reactive, and infinitely extensible operator experiences that transcend traditional SCADA limitations.

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Architecture Overview

This project demonstrates modern industrial HMI development using:

- **Component-based architecture** for modular, reusable interfaces
- **High-performance rendering** for real-time data visualization
- **Optimized data structures** for efficient real-time operations
- **WebSocket integration** for live sensor connectivity
- **Static deployment** optimized for resource-constrained, embedded controllers

## Key Files Explained

### Configuration Files

- **`package.json`** - Project dependencies and npm scripts (like Python's `pyproject.toml`)
- **`svelte.config.js`** - SvelteKit build configuration with static adapter for PLCnext deployment
- **`vite.config.ts`** - Vite bundler settings (handles TypeScript compilation and hot reloading)
- **`tsconfig.json`** - TypeScript compiler options and type checking rules

### Source Code Structure

- **`src/`** - Your development code (where you write components and logic)
  - **`src/routes/+layout.svelte`** - Global layout wrapper (applied to all pages, contains shared elements like favicon, navigation, styles)
  - **`src/routes/+page.svelte`** - Main interface page
  - **`src/lib/components/`** - Reusable Svelte components (charts, sensors, alarms)
  - **`src/lib/stores.js`** - Reactive data stores wrapping SensorDeque
  - **`src/lib/SensorDeque.ts`** - Doubly-linked list data structure for real-time data with O(1) optimized access with the only O(N) operation performed once at render.

### Static Assets

- **`static/`** - Files copied directly to build output
  - **`static/robots.txt`** - Web crawler instructions (blocked for private HMI)

### Generated Files

- **`build/`** - Production-ready static files (created by `npm run build`)
- **`.svelte-kit/`** - Auto-generated SvelteKit files (don't edit directly)

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

This creates a `build/` directory with static HTML, CSS, and JavaScript files optimized for PLCnext controller deployment.

You can preview the production build with `npm run preview`.

## Deployment to PLCnext

The static adapter configuration in `svelte.config.js` creates self-contained files perfect for industrial controllers:

```sh
# After building, copy to PLCnext web directory
scp -r build/* user@plcnext:/var/www/html/

# Eventually: run `git pull` of compiled build code from PLC on MQTT software update command push.
# Could even run a chron job that checks for changes in remote main and auto pulls, rolling back and alarming if update errors are encountered.

# Or mount in FastAPI
# app.mount("/", StaticFiles(directory="build", html=True), name="static")
```

## Static Hosting Benefits

- **No Node.js runtime** required on target controller
- **Minimal resource usage** (~15KB compressed bundle)
- **Offline capable** - all assets bundled
- **Easy deployment** - just copy static files

> The static adapter is configured for PLCnext deployment. For other environments, you may need to install a different [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
