# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

EVUI is a Vue 3 component library developed by EXEM. It provides a comprehensive set of UI components including charts, grids, form controls, and more.

## Development Commands

### Build and Development

- `npm run serve` - Start development server
- `npm run build` - Compile for production
- `npm run build:lib` - Build library for distribution (creates UMD bundle)
- `npm run build:lib_min` - Build minified library version
- `npm run docs` - Run documentation site locally on port 9999
- `npm run docs_build` - Build documentation for production

### Testing and Quality

- `npm run test:unit` - Run Jest unit tests
- `npm run lint` - Run ESLint on src, test, and docs directories

## Architecture

### Component Structure

- Each component lives in `src/components/[componentName]/`
- Component folders contain:
  - Main component file (e.g., `Chart.vue`, `Grid.vue`)
  - `index.js` - Component registration and plugin setup
  - Optional: `uses.js` - Composition API utilities
  - Optional: `style/` directory for component-specific SCSS

### Chart Components

Charts are the most complex components with a sophisticated architecture:

- **Core**: `chart.core.js` - Main chart engine
- **Elements**: `element/` - Renderable chart elements (bar, line, pie, scatter, heatmap)
- **Scales**: `scale/` - Axis scaling logic (linear, logarithmic, step, time)
- **Plugins**: `plugins/` - Chart features (legend, tooltip, interaction, scrollbar)
- **Models**: `model/` - Data modeling and state management

### Grid Components

Grids support advanced features:

- Filtering, sorting, pagination
- Column configuration and resizing
- Tree grid support with `TreeGrid.vue`
- Custom cell renderers and toolbar integration

### Plugin Architecture

Components use Vue 3 plugin pattern:

```javascript
Component.install = (app) => {
  app.component(Component.name, Component);
  // Additional plugin registrations as needed
};
```

### Utility Libraries

- `src/common/` - Shared utilities (debounce, throttle, BigNumber, table/tree helpers)
- Uses lodash-es, dayjs, and BigNumber.js for core functionality

### Documentation Structure

- `docs/` - Complete documentation site with examples
- Each component has API documentation and live examples
- Built with Vue CLI and uses raw-loader for code examples

### Styling

- SCSS-based theming system
- Global styles in `src/style/` and `docs/style/`
- Component-specific styles co-located with components
- Uses StyleLint for style consistency

### Testing

- Jest with Vue Test Utils for unit testing
- Uses vue-jest transformer for .vue files
- Test files in `tests/unit/`

## Key Dependencies

- Vue 3 with Composition API
- vue-resize-observer for responsive components
- vue3-observe-visibility for visibility tracking
- lodash-es for utilities
- dayjs for date handling
- BigNumber.js for precision arithmetic
