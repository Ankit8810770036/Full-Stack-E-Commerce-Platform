# Cartify - React Frontend Application

This directory contains the modern single-page application (SPA) for **Cartify**, built using **React 19**, **TypeScript**, and **Vite**.

---

## 🚀 Key Highlights

- **Vite + React 19 + TypeScript**: Sub-second Hot Module Replacement (HMR) and strict compile-time type safety.
- **Vanilla CSS Design System**: Responsive, zero-runtime overhead styling with CSS custom properties, glassmorphism, and fluid micro-animations.
- **Route-Level Code Splitting**: Utilizes `React.lazy()` and `Suspense` for asynchronous bundle loading of pages (`Home`, `ProductDetail`, `Cart`, `Orders`, `Profile`, `ProductAdmin`).
- **Client-Side In-Memory Caching**: Implements a transparent 60-second TTL GET request cache with automatic invalidation on mutating requests (`POST`, `PUT`, `DELETE`).
- **Resilient Media Loading**: Image fallbacks and dynamic high-resolution Unsplash asset integration.
- **Nginx Production Container**: Multi-stage Dockerized build with client-side SPA route fallbacks (`try_files $uri /index.html`) and reverse-proxy pass to `api-gateway`.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start Vite development server (Default: http://localhost:5173)
npm run dev

# Run TypeScript type check and production bundle build
npm run build

# Preview production build locally
npm run preview
```

---

## 🐳 Docker Container Execution

The frontend is containerized via a multi-stage Docker build:

```bash
# From the project root:
docker compose up -d frontend
```
The production container is accessible at **[http://localhost:3000](http://localhost:3000)**.
