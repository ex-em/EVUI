# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EVUI is a Vue 3 component library developed by EXEM. It provides UI components including form elements, data visualization (charts), data tables (grid/tree grid), and utility components.

## Common Commands

```bash
# Run documentation dev server (port 9999)
npm run docs

# Build the library for production
npm run build:lib

# Lint and fix code
npm run lint

# Build documentation for deployment
npm run build:docs

# Preview built documentation
npm run preview
```

## Architecture

### Library Structure

- **Entry Point**: `src/main.js` - Exports all components and the EVUI plugin installer
- **Components**: `src/components/` - Each component has its own directory with:
  - `index.js` - Component registration with Vue plugin pattern
  - `*.vue` - Vue single-file component(s)
  - `uses.js` - Composable functions (Vue Composition API)
  - `style/*.scss` - Component-specific styles

### Component Registration Pattern

Each component follows the Vue plugin pattern:

```js
Component.install = (app) => {
  app.component(Component.name, Component);
  // Additional plugins if needed (e.g., VueResizeObserver)
};
```

### Key Components

- **EvChart** (`src/components/chart/`): Canvas-based charting with multiple chart types (line, bar, pie, scatter, heatmap). Core rendering in `chart.core.js`, with separate element renderers in `element/` and scale implementations in `scale/`.

- **EvGrid** (`src/components/grid/`): Virtual-scrolling data grid with sorting, filtering, pagination, column resizing, and row selection. Uses extensive composables in `uses.js` for event handling.

- **EvChartGroup/EvChartBrush**: Chart grouping with synchronized zooming/brushing using Vue's provide/inject pattern.

### Documentation Site

- Located in `docs/` directory
- Uses Vue Router with Vuex for state management
- Component examples in `docs/views/[componentName]/example/`
- API documentation in `docs/views/[componentName]/api/*.md`

### Build Configuration

- **Vite** for both library build (`vite.config.lib.js`) and docs (`vite.config.js`)
- Library outputs ESM and UMD formats
- Path aliases: `@` -> `src/`, `docs` -> `docs/`
- SCSS with modern API configuration

### Code Style

- ESLint with `eslint-config-exem` and Vue 3 rules
- Single quotes, trailing commas, semicolons required
- Max line length: 100 characters
- Use Composition API with `setup()` function
- Prefer `lodash-es` for utilities
