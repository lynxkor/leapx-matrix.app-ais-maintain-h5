# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue 3 H5 mobile application for LeapMotor's sales service system (销服移动端H5). Runs inside native app webviews (Android/iOS).

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
```

**Node version**: Requires `^20.19.0 || >=22.12.0`

**Lint a single file**: `npx eslint src/views/feature/File.vue --fix`

**Tests**: No test scripts or test files are currently configured.

## Architecture

### Directory Structure

- `src/views/` - Page components organized by feature
- `src/stores/` - Pinia state stores (`global.js`, `user.js`)
- `src/router/` - Vue Router configuration with keepAlive support
- `src/api/` - API modules and the primary axios wrapper (`request.js`)
- `src/libs/` - **Git submodule** (`app-ais-com-h5`) containing shared business components and native bridge utilities
- `src/assets/` - Global styles and static assets

### Application Shell & Routing

- `src/App.vue` is only a `RouterView`. The real shell is `src/libs/layout/baseLayout.vue`, which renders the `van-nav-bar` header and wraps pages in `<KeepAlive>`.
- Every route is a child of `baseLayout`. Route `meta` drives behavior:
  - `meta.title` - Sets the page header title (via `globalStore.setTitle`)
  - `meta.hideHeader` - Hides the nav bar for pages that render their own
  - `meta.keepAlive` - Automatically added to the KeepAlive include list
- `baseLayout.vue` intercepts back-button clicks. If the current page component exposes `onBeforeBack()` via `defineExpose`, it is called first. Returning `false` blocks the default back navigation.

### Native App Integration

The app runs inside native webviews. Navigation bridging lives in `src/libs/utils/app.js`:
- `goBack()` - History back or exit webview if no history
- `outWebview()` - Calls native Android (`window.Android.goback`) or iOS (`window.webkit.messageHandlers.revert`) methods

### HTTP Requests

Use `get()`, `post()`, `postJson()`, and `postText()` from `src/api/request.js`.
- Reads base URL from `window.APP_AIS_H5_CONFIG?.VITE_API_BASE_URL` with fallback to `import.meta.env.VITE_API_BASE_URL`
- Automatically injects `Authorization: Bearer <token>` and `platform: leapx` from the Pinia user store
- 401/403 responses trigger a Vant confirm dialog and call `outWebview()`

### Shared Library (`src/libs/`)

Git submodule. Key reusable pieces:
- `RefreshList.vue` - Pull-to-refresh + infinite scroll list
- `FilterHeader.vue` - Filter/search header
- `AisDialog.vue` - Custom dialog
- `baseLayout.vue` - App shell with nav bar

`RefreshList.vue` expects a `requestData` prop shaped like `{ data, api }`, where `data` is the mutable query payload (usually including `pageNum` and `pageSize`) and `api` is the request function. It emits `setData`, `resetFilters`, and `onError`, and handles both paginated `{ records, current, total }` responses and simple array responses.

### State Management

- `src/stores/global.js` - Tracks the current header title and maintains enum caches (repair types, statement types, warranty types)
- `src/stores/user.js` - Persists auth token in `localStorage` (`lxpToken`), fetches login info lazily, and provides `userName`/`userId` getters

### Environment Variables

- `VITE_API_BASE_URL` - API base URL
- `VITE_SENTRY_ENV` - Sentry environment (enables error tracking when set)

Environment files: `.env.development`, `.env.sit`, `.env.production`

### Mobile Adaptation

Uses rem-based responsive design. The base font size is calculated as `clientWidth / 37.5` (375px design width = 1rem). The app is mobile-first and uses the `@` alias for imports from `src/`.

### Build Configuration

`vite.config.js` sets `base: '/maintenance/'`. Sentry and vConsole are initialized in `src/main.js`; note that `vConsole` is currently loaded unconditionally (the DEV guard is commented out).

### Pre-commit Hooks

`lint-staged` runs ESLint on staged `src/**/*.{js,vue}` files. Stylelint is configured but not currently part of the pre-commit hook.
