# 🚀 Development Server Guide

## Quick Start

### Start the Development Server

```bash
npm start
```

Or manually:

```bash
ng serve --configuration=development
```

**Access the application at:** `http://localhost:4200`

---

## Available URLs

| URL | Purpose |
|-----|---------|
| `http://localhost:4200/` | Home page |
| `http://localhost:4200/home` | Home module (with welcome message) |
| `http://localhost:4200/scoping` | Scoping module (Add Engagement & Engagement Details) |

---

## Features

### 🏠 Home Module
- Welcome page
- User authentication info
- Navigation to Scoping module

### 📋 Scoping Module - Two Tabs

#### 1. Add Engagement Tab
**Location:** `http://localhost:4200/scoping`

Features:
- ✅ Reactive form with validation
- ✅ Dropdown selectors:
  - Engagement Types
  - Regions
  - Business Units
  - AD Groups
- ✅ Success/Error alerts
- ✅ Form reset functionality
- ✅ Loading states
- ✅ NgRx store integration

#### 2. Engagement Details Tab
**Location:** `http://localhost:4200/scoping`

Features:
- ✅ Display engagement information
- ✅ Real-time updates from store
- ✅ Responsive card layout

---

## Development Workflow

### 1. Start Dev Server
```bash
npm start
```

### 2. Open Browser
```
http://localhost:4200
```

### 3. Make Code Changes
The browser will auto-reload on file changes

### 4. View Component Files

**Add Engagement Component:**
- Component: `src/app/shared/components/add-engagement/add-engagement.component.ts`
- Template: `src/app/shared/components/add-engagement/add-engagement.component.html`
- Styles: `src/app/shared/components/add-engagement/add-engagement.component.scss`
- Service: `src/app/shared/components/add-engagement/services/add-engagement.service.ts`

**Engagement Details Component:**
- Component: `src/app/shared/components/engagement-details/engagement-details.component.ts`
- Template: `src/app/shared/components/engagement-details/engagement-details.component.html`
- Styles: `src/app/shared/components/engagement-details/engagement-details.component.scss`

**NgRx Store:**
- Actions: `src/app/shared/components/engagement-details/engagement-state/actions/`
- Reducers: `src/app/shared/components/engagement-details/engagement-state/reducers/`
- Models: `src/app/shared/components/engagement-details/engagement-state/models/`

---

## Console Output

When the dev server is running, you should see:

```
✔ Building...
Application bundle generation complete. [X.XXs] - 2026-03-08T11:15:47.907Z
Watch mode enabled. Watching for file changes...
➜ Local: http://localhost:4200/
```

---

## Hot Module Replacement (HMR)

Angular dev server automatically reloads when you:
- Modify `.ts` files (TypeScript)
- Modify `.html` files (Templates)
- Modify `.scss` files (Styles)
- Modify `.json` files (Configuration)

---

## Debugging

### Browser DevTools
Open Chrome DevTools: **F12** or **Right-click → Inspect**

#### Tabs to check:
1. **Console** - Check for errors
2. **Sources** - Set breakpoints and debug
3. **Network** - Monitor API calls
4. **Application** - Check localStorage (NgRx store data)

### Angular DevTools
Install: [Angular DevTools Chrome Extension](https://chrome.google.com/webstore/detail/angular-devtools/)

Features:
- View component tree
- Inspect component properties
- Monitor NgRx store state
- Debug change detection

---

## Environment Configuration

**File:** `src/assets/config/env.js`

Update with your Azure AD credentials:

```javascript
(function (window) {
  window['__env'] = window['__env'] || {};
  window['__env'].apiURL = 'https://api.yourdomain.com';
  window['__env'].production = false;
  window['__env'].clientId = 'your-azure-ad-client-id';
  window['__env'].tenantId = 'your-azure-ad-tenant-id';
  window['__env'].tokenClientId = 'your-token-client-id';
  window['__env'].accessScope = 'access_as_user';
  window['__env'].redirectURI = 'https://yourdomain.com';
  window['__env'].enableServiceWorker = false;
})(this);
```

---

## Testing

### Unit Tests
```bash
# Watch mode
npm test

# Headless with coverage
npm run test:headless
```

### Build Verification
```bash
# Development build
npm run build-dev

# Production build
npm run build-prod
```

---

## Troubleshooting

### Port 4200 Already in Use
```bash
ng serve --port 4201
```

### Clear Cache
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install --legacy-peer-deps
```

### Build Errors
```bash
# Clear Angular cache
rm -rf .angular/cache
ng serve
```

### Module Not Found Errors
```bash
# Reinstall dependencies
npm install --legacy-peer-deps
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `q` | Quit dev server |
| `r` | Force rebuild |
| `o` | Open in browser |
| `/` | Show help |

---

## Performance Tips

1. **Use OnPush Change Detection** - Already configured in components
2. **Lazy Load Modules** - Home and Scoping modules are lazy-loaded
3. **Unsubscribe from Observables** - Using `takeUntilDestroyed()`
4. **Avoid Memory Leaks** - Destroy component subscriptions on destroy

---

## API Integration

To connect to a real backend:

1. Update `env.js` with your backend API URL
2. Configure API endpoints in NgRx effects
3. Implement error handling for API calls
4. Test API integration with actual backend

---

## Next Steps

1. ✅ **Server is running** on `http://localhost:4200`
2. 🔧 **Update env.js** with your Azure AD credentials
3. 🧪 **Test the Add Engagement form** in the Scoping module
4. 📝 **Implement backend API** endpoints
5. 🚀 **Build for production** when ready

---

**Happy Coding!** 🎉
