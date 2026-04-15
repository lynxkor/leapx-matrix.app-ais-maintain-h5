# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue 3 H5 mobile application template for LeapMotor's sales service system (销服移动端H5). This is a mobile-first web application designed to run inside native app webviews (Android/iOS).

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (with HTTPS)
npm run build        # Production build
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
```

**Node version**: Requires Node ^20.19.0 || >=22.12.0

## Architecture

### Directory Structure

- `src/views/` - Page components organized by feature
- `src/stores/` - Pinia state stores (`global.js`, `user.js`)
- `src/router/` - Vue Router configuration with keepAlive support
- `src/api/` - API modules using axios wrapper
- `src/libs/` - **Git submodule** containing shared business components
- `src/assets/` - Global styles and static assets

### Key Patterns

**Route-based KeepAlive**: Routes with `meta.keepAlive: true` are cached. The baseLayout handles scroll position preservation for cached routes.

**Native App Integration**: The app runs inside native webviews. Use `goBack()` and `outWebview()` from `@/libs/utils/app.js` for navigation - these bridge to native Android/iOS methods.

**HTTP Requests**: Use `get()` and `post()` from `@/libs/utils/request.js`. Token is automatically injected from Pinia user store. 401/403 errors trigger a dialog and exit webview.

**List Components**: `RefreshList.vue` in libs provides pull-to-refresh and infinite scroll. Pass `requestData` prop with `api` function and `data` params.

### Shared Library (src/libs/)

This is a git submodule (`app-ais-com-h5`). When cloning:

```bash
git clone --recurse-submodules <repo-url>
```

Contains reusable components:

- `RefreshList.vue` - Pull-refresh + infinite scroll list
- `FilterHeader.vue` - Filter/search header
- `AisDialog.vue` - Custom dialog
- `baseLayout.vue` - App shell with nav bar

### Environment Variables

- `VITE_API_BASE_URL` - API base URL
- `VITE_SENTRY_ENV` - Sentry environment (enables error tracking when set)

### Mobile Adaptation

Uses rem-based responsive design. The base font size is calculated as `clientWidth / 37.5` (375px design width = 1rem).
