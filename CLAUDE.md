# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 mobile/H5 application built with Vite for Leap Motor's AIS maintenance system. The app handles maintenance workflows for dealerships and includes a demo section for showcasing features.

## Architecture & Structure

- **Framework**: Vue 3 with Composition API
- **Build System**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router with code splitting
- **UI Components**: Vant 4.x (mobile-first components) and @leapmotor/design-v3-h5
- **Styling**: SCSS with responsive design based on 37.5px root font size
- **HTTP Client**: Axios for API requests
- **Code Quality**: ESLint, Stylelint, Prettier with Husky pre-commit hooks
- **Error Tracking**: Sentry integration for error monitoring and session replay
- **Development Tools**: vConsole in development mode, Vue DevTools

## Environment Configuration

- Development/SIT: `VITE_API_BASE_URL=https://aisapi-sit.leapmotor.com`
- Different environments are handled via .env files: development, sit, production
- Sentry environment tracking with VITE_SENTRY_ENV variable

## Key Features

- Mobile-responsive design with 37.5px rem scaling
- Base layout system with keep-alive support in `src/libs/layout/baseLayout.vue`
- Demo section for showcasing components at `/example` and `/example/detail`
- Layout system with baseLayout.vue in libs (shared across AIS apps)
- vConsole enabled in development mode for debugging
- Sentry error tracking with browser tracing and session replay
- Git hooks with lint-staged for code quality enforcement

## Shared Libraries (src/libs)

- **Components**: Reusable components like AisDialog, RefreshList
- **Utilities**: Cross-platform navigation helpers (Android/iOS webview interaction)
- **Assets**: Shared images and icons
- This is a submodule maintained separately, likely shared across multiple AIS H5 applications

## Routing

- Base layout: `/` with children routes
- Home: `/home` (demo landing page)
- Example/demo: `/example` and `/example/detail`
- Routes support keep-alive for performance optimization
- Dynamic document titles via global store

## Key Dependencies

- Vue 3.5.18
- Vue Router 4.5.1
- Pinia for state management
- Vant 4.9.21 for mobile components
- @leapmotor/design-v3-h5 for Leap Motor specific design
- Axios for HTTP requests
- Sentry for error tracking
- VConsole for development debugging

## Common Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production environment
- `npm run preview` - Preview built application locally
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run prepare` - Install husky hooks

## Development Guidelines

- Use Vant components for consistent mobile UX
- Leverage Pinia stores for state management (global store in src/stores/)
- Use `@` alias for imports from src directory
- Views are in src/views/, reusable components in src/libs/components/
- API integration in src/api/ directory
- Responsive design using rem units based on 37.5px root (see main.js)
- Component imports in main.js are explicit for tree-shaking
- Git hooks enforce code quality via lint-staged
- iOS/Android native bridge methods available in utils (window.Android._, window.webkit._)
- All external libraries should be properly typed if possible

## Maintenance-Specific Considerations

- The maintenance module is the core business feature (routes to be implemented)
- Permissions-based UI considerations for different user roles
- API integration with aisapi service (different endpoints per environment)
- Mobile-first design with consideration for touch interactions
- Performance optimization important for mobile devices (code splitting, keep-alive)

## 注意事项

1. 所有创建的页面、模块都不用考虑添加页面头部, 首先是因为在路由router/index.js中添加meta属性中包含了页面头部的名称, 然后在组件libs/layout/baseLayout.vue中添加了页面头部的代码, 所以不需要在页面中添加页面头部.
2. 所有涉及到页面需要有搜索过滤的都需要使用libs/components/FilterHeader.vue组件
3. 所有列表页面, 多条数据展示的, 都推荐使用src/components/ListItem.vue组件
4. 步骤条相关的组件使用src/components/AisStepNav.vue组件
5. 所有涉及从页面底部弹出展示popup的页面, 都需要使用src/components/AisPopup.vue组件6.每次执行命令的时候, 我需要你参考一下项目app-ais-vehretail-h5
6. 页面展示字段全部使用接口返回的字段, 确保代码可读性
