# Proyecto TIPE III

Guia rapida para levantar el backend, frontend y la base de datos.

## Requisitos

- Node.js 18+ (recomendado) y npm
- Docker Desktop (opcional, para levantar con contenedores)

## Variables de entorno

Antes de iniciar, crear los archivos de entorno desde los ejemplos:

```bash
cd backend
copy .env.example .env
cd ../frontend
copy .env.example .env
```

Si estas en macOS o Linux, usa `cp` en lugar de `copy`.

## Opcion A: levantar todo con Docker

Desde la raiz del proyecto:

```bash
docker compose up --build
```

Servicios y puertos:

- Backend: http://localhost:4000 (mapea al puerto 3000 del contenedor)
- Frontend: http://localhost:5173
- Postgres: localhost:5433

Para detener:

```bash
docker compose down
```

## Opcion B: desarrollo local con npm (terminales separadas)

1. Base de datos

Puedes levantar solo Postgres con Docker:

```bash
docker compose up postgres
```

2. Backend (terminal 1)

```bash
cd backend
npm install
npm run dev
```

3. Frontend (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Frontend en http://localhost:5173
Backend en http://localhost:3000

## Notas utiles

- Si cambias los puertos, actualiza `VITE_API_URL` y `VITE_WS_URL` en el frontend.
- Si la base de datos no responde, revisa que el puerto 5433 no este ocupado.
- Los comandos de test del backend: `npm test`.

## Estructura general del proyecto

```text
Proyecto_TIPElll/
+--- backend
|   +--- prisma
|   |   +--- migrations
|   |   |   +--- 20260317195312_init
|   |   |   |   \\--- migration.sql
|   |   |   +--- 20260418184911_add_ingredients
|   |   |   |   \\--- migration.sql
|   |   |   +--- 20260418225533_simplify_product
|   |   |   |   \\--- migration.sql
|   |   |   +--- 20260419010610_add_discounts
|   |   |   |   \\--- migration.sql
|   |   |   \\--- migration_lock.toml
|   |   \\--- schema.prisma
|   +--- src
|   |   +--- core
|   |   |   +--- middlewares
|   |   |   |   +--- auth.middleware.ts
|   |   |   |   +--- error.middleware.ts
|   |   |   |   \\--- role.middleware.ts
|   |   |   +--- config.ts
|   |   |   +--- database.ts
|   |   |   +--- security.ts
|   |   |   \\--- socket.ts
|   |   +--- modules
|   |   |   +--- auth
|   |   |   |   +--- auth.repository.ts
|   |   |   |   +--- auth.router.ts
|   |   |   |   +--- auth.service.ts
|   |   |   |   \\--- auth.types.ts
|   |   |   +--- dashboard
|   |   |   |   +--- dashboard.repository.ts
|   |   |   |   +--- dashboard.router.ts
|   |   |   |   +--- dashboard.service.ts
|   |   |   |   \\--- dashboard.types.ts
|   |   |   +--- discounts
|   |   |   |   +--- discounts.repository.ts
|   |   |   |   +--- discounts.router.ts
|   |   |   |   +--- discounts.service.ts
|   |   |   |   \\--- discounts.types.ts
|   |   |   +--- orders
|   |   |   |   +--- orders.repository.ts
|   |   |   |   +--- orders.router.ts
|   |   |   |   +--- orders.service.ts
|   |   |   |   \\--- orders.types.ts
|   |   |   +--- products
|   |   |   |   +--- products.repository.ts
|   |   |   |   +--- products.router.ts
|   |   |   |   +--- products.service.ts
|   |   |   |   \\--- products.types.ts
|   |   |   +--- reports
|   |   |   |   +--- exporters
|   |   |   |   |   +--- excel.exporter.ts
|   |   |   |   |   +--- exporter.interface.ts
|   |   |   |   |   \\--- pdf.exporter.ts
|   |   |   |   +--- reports.repository.ts
|   |   |   |   +--- reports.router.ts
|   |   |   |   +--- reports.service.ts
|   |   |   |   \\--- reports.types.ts
|   |   |   \\--- users
|   |   |       +--- users.repository.ts
|   |   |       +--- users.router.ts
|   |   |       +--- users.service.ts
|   |   |       \\--- users.types.ts
|   |   +--- types
|   |   |   \\--- pdfkit.d.ts
|   |   +--- app.ts
|   |   \\--- server.ts
|   +--- tests
|   |   +--- auth.test.ts
|   |   +--- inventory.test.ts
|   |   +--- orders.test.ts
|   |   \\--- products.test.ts
|   +--- .env
|   +--- .env.example
|   +--- .gitignore
|   +--- Dockerfile
|   +--- package.json
|   +--- package-lock.json
|   \\--- tsconfig.json
+--- frontend
|   +--- public
|   |   +--- favicon.svg
|   |   \\--- icons.svg
|   +--- src
|   |   +--- api
|   |   |   +--- auth.api.ts
|   |   |   +--- dashboard.api.ts
|   |   |   +--- discounts.api.ts
|   |   |   +--- orders.api.ts
|   |   |   +--- products.api.ts
|   |   |   +--- reports.api.ts
|   |   |   \\--- users.api.ts
|   |   +--- assets
|   |   |   +--- hero.png
|   |   |   +--- react.svg
|   |   |   \\--- vite.svg
|   |   +--- components
|   |   |   +--- AdminLayout.tsx
|   |   |   +--- ImageCarousel.tsx
|   |   |   \\--- ProtectedRoute.tsx
|   |   +--- hooks
|   |   |   +--- useDiscounts.ts
|   |   |   \\--- useWebSocket.ts
|   |   +--- pages
|   |   |   +--- AdminDiscounts.tsx
|   |   |   +--- AdminUsers.tsx
|   |   |   +--- Dashboard.tsx
|   |   |   +--- Inventory.tsx
|   |   |   +--- Login.tsx
|   |   |   +--- POS.tsx
|   |   |   \\--- Reports.tsx
|   |   +--- store
|   |   |   +--- useAuthStore.ts
|   |   |   +--- useCartStore.ts
|   |   |   +--- useDiscountStore.ts
|   |   |   \\--- useInventoryStore.ts
|   |   +--- types
|   |   |   +--- dashboard.types.ts
|   |   |   +--- discount.types.ts
|   |   |   +--- order.types.ts
|   |   |   +--- product.types.ts
|   |   |   \\--- user.types.ts
|   |   +--- App.css
|   |   +--- App.tsx
|   |   +--- index.css
|   |   \\--- main.tsx
|   +--- .env
|   +--- .env.example
|   +--- .gitignore
|   +--- Dockerfile
|   +--- eslint.config.js
|   +--- index.html
|   +--- package.json
|   +--- package-lock.json
|   +--- postcss.config.js
|   +--- README.md
|   +--- tsconfig.app.json
|   +--- tsconfig.json
|   +--- tsconfig.node.json
|   \\--- vite.config.ts
+--- docker-compose.yml
\\--- README.md
```
