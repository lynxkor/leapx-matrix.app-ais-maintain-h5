# Copilot Instructions for app-ais-maintenance-h5

## Commands

- Install dependencies: `npm install`
- Start local dev server: `npm run dev`
- Build production bundle: `npm run build`
- Preview the built app: `npm run preview`
- Run repo lint script: `npm run lint`  
  This runs `eslint . --fix`, so it modifies files.
- Lint a single file: `npx eslint src\views\preAuthorization\PreAuthorizationList.vue --fix`
- Format source files: `npm run format`

This repository does not currently define a `test` script in `package.json`, and no `*.test.*` or `*.spec.*` files are present. There is no single-test workflow configured yet.

## High-level architecture

- This is a Vue 3 + Vite mobile H5 app. `src\main.js` bootstraps the app, registers Pinia, Vue Router, explicit Vant components, Sentry, and `vConsole` in development.
- `src\App.vue` is only a `RouterView`; the real application shell lives in `src\libs\layout\baseLayout.vue`.
- Routing is centered in `src\router\index.js`. Every feature route is nested under the base layout, and route `meta` drives page title, header visibility, and keep-alive behavior.
- The shared header is rendered by `src\libs\layout\baseLayout.vue`, not by individual pages. It reads the title from the global Pinia store, wraps keep-alive pages in `<KeepAlive>`, and calls an exposed `onBeforeBack()` method on the current page component when a page needs to intercept back navigation.
- `src\stores\global.js` only tracks the current header title. `src\stores\user.js` persists the auth token from `localStorage` (`lxpToken`), which is then injected into API requests.
- The primary API client for app code is `src\api\request.js`. It uses `VITE_API_BASE_URL`, adds `Authorization: Bearer <token>` plus `platform: leapx`, and sends 401/403 users back through the native/webview exit flow. `src\libs\api\request.js` is a related shared-library client that also supports `window.APP_AIS_H5_CONFIG?.VITE_API_BASE_URL`.
- `src\libs` is shared AIS H5 infrastructure, including layout, shared API helpers, native bridge utilities, and reusable components like `FilterHeader` and `RefreshList`. Treat it as shared code, not feature-local glue.
- Current business modules live under `src\views\preAuthorization` and `src\views\settlementStatement`. These pages typically pair feature APIs in `src\api\*.js` with shared list/filter components instead of hand-rolling list state each time.

## Key conventions

- Do not add page headers inside feature views. Set the page title in route `meta.title`; `baseLayout.vue` renders the nav bar automatically. Use `meta.hideHeader` only for pages that intentionally hide it.
- For pages that should be cached, set `meta.keepAlive: true` on the route. `baseLayout.vue` derives the keep-alive include list from route names.
- If a page must block or customize the default back behavior, expose `onBeforeBack()` with `defineExpose`. `baseLayout.vue` checks that method before navigating away.
- Search/filter pages are expected to use `src\libs\components\FilterHeader.vue`.
- List-style pages usually use `src\components\ListItem.vue` for cards and `src\libs\components\RefreshList.vue` for pull-to-refresh + infinite loading.
- `RefreshList` expects a `requestData` object shaped like `{ data, api }`, where `data` contains the mutable query payload (usually including `pageNum` and `pageSize`) and `api` is the request function. It emits `setData`, `resetFilters`, and `onError`, and it handles both paginated `{ records, current, total }` responses and simple array/history-list responses.
- Bottom-sheet style interactions are wrapped with `AisPopup` rather than raw Vant popups. This repo currently has both `src\components\AisPopup.vue` and `src\libs\components\AisPopup.vue`; follow the existing import choice in the feature area you are editing instead of mixing patterns within one module.
- Use API field names directly in the UI where possible. Existing pages avoid heavy front-end renaming/mapping for display fields.
- Use the `@` alias for imports from `src`.
- The app is mobile-first and uses rem sizing based on a 37.5px layout scale set in `src\main.js`.
- Native/webview exit and device actions are handled through shared helpers in `src\libs\utils`, not inline platform detection in feature pages.
- The pre-commit hook runs `npx lint-staged`. Staged `src/**/*.{js,vue}` files go through ESLint, and staged `src/**/*.{css,scss,vue}` files go through Stylelint.
- Environment-specific API hosts come from `.env.development`, `.env.sit`, and `.env.production`. Vite is served over HTTPS in development, and the built app uses `base: '/maintain/'`.
