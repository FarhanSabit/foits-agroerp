# OITS Dhaka — Agro ERP Monorepo Architecture & AI Developer Instructions

This document outlines the design patterns, code organization, package structure, and step-by-step guidelines for **Gemini AI models** to manage, maintain, and scale this project.

---

## 1. Monorepo Overview & Structure

The repository uses **npm workspaces** for lightweight, native monorepo orchestration. It is split into three main packages inside the `packages/` directory:

```
├── package.json (Monorepo Root)
├── tsconfig.json (Monorepo Type mappings)
├── vite.config.ts (Monorepo Vite configuration with packages/app root)
├── GEMINI.md (This file)
├── scripts/
│   └── ci.sh (Automated CI/CD selective pipeline script)
└── packages/
    ├── shared-utils/
    │   ├── package.json
    │   └── src/
    │       └── index.ts (Core helper methods: formatBDT, calculatePercentage, cn)
    ├── shared-ui/
    │   ├── package.json
    │   └── src/
    │       ├── index.ts (Main exports)
    │       └── components/
    │           ├── Button.tsx (Swiss-Modern high-contrast Button)
    │           ├── Input.tsx (Accessible modern text Input)
    │           ├── Badge.tsx (Priority & state indicators)
    │           └── Card.tsx (Modular dashboard section boxes)
    └── app/
        ├── package.json
        ├── index.html
        └── src/ (Main Agro ERP frontend built in React + TypeScript)
```

---

## 2. Package Configurations & Type Resolution

### Root Configurations
- **`package.json`**: Configures the workspaces array under `"workspaces": ["packages/*"]` and exposes global runner scripts.
- **`vite.config.ts`**: Set with `root: path.resolve(__dirname, 'packages/app')` to execute the application, pointing output to `/dist` in the monorepo root to integrate with production hosting. It uses path aliases to bypass pre-building during local development.
- **`tsconfig.json`**: Explicitly maps `@agro-erp/*` namespaces to local package sources for instant IDE intelligence and type checking.

---

## 3. Library & API Guidelines

### `@agro-erp/shared-utils` (Core Utilities)
- **`formatBDT(amount: number): string`**: Formats currencies to Bangladeshi Taka (৳ 20,000,000).
- **`calculatePercentage(value: number, total: number): number`**: Computes percentages safely without dividing-by-zero risks.
- **`cn(...classes)`**: Safe Tailwind class merge utility.

### `@agro-erp/shared-ui` (UI Component Library)
- **`Button`**: Polished button supporting `primary`, `secondary`, `indigo`, `amber`, `green`, and `danger` variants, automatic spinners during `isLoading` states, and an explicit 2:1 horizontal-to-vertical padding scale.
- **`Input`**: A glass-morphic text field supporting icons, error tags, and explicit `focus-visible:ring-2 focus-visible:ring-indigo-500` outline rings.
- **`Badge`**: Uniform status/priority indicators mapping states cleanly.
- **`Card`**: Standardized Swiss-Modern panel container supporting header actions and responsive alignment.

---

## 4. Workspaces Dependency Rules

When any Gemini AI agent edits or scales this repository:
1. **Never create redundant dependencies**: Do not install packages in `@agro-erp/app` that are already installed at the monorepo root, unless they are specifically bundled or required by that workspace context.
2. **Link local packages via version wildcard**: Declare `"@agro-erp/shared-ui": "*"` or `"@agro-erp/shared-utils": "*"` in the app's `dependencies`.
3. **TypeScript Type Imports constraint**: Always use named type imports at the top level. Do not use `import type` to import `enum` values.
4. **No nested cards**: Never place a `<Card>` inside another `<Card>` to prevent layout clashing.

---

## 5. Development, Verification, and Building

### Local Dev Command
```bash
npm run dev
```
Starts the Vite dev server inside the container, listening on port `3000`.

### Workspace-wide Build
```bash
npm run build
```
Builds the static application, routing assets directly into `/dist` at the monorepo root.

### Selective CI/CD Checks
Any agent can test modified workspaces using the pipeline script:
```bash
bash scripts/ci.sh
```

---

## 6. How to Add a New Shared Component (Step-by-Step for AI)

If a user asks you to add a new component, e.g., a shared `Modal` or `Table`:
1. **Create the file** under `packages/shared-ui/src/components/Modal.tsx`.
2. **Implement full, real props and keyboard bindings** (including `Esc` to close).
3. **Export the component** in `packages/shared-ui/src/index.ts`.
4. **Consume it** in `packages/app/src/...` with a named import:
   ```ts
   import { Modal } from "@agro-erp/shared-ui";
   ```
5. **Add TS paths check** to ensure root `tsconfig.json` mappings handle it.
6. **Compile and lint** the app using `npm run build` to verify no breakages occur.
