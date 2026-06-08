# Demo UI - Enterprise Angular Application

A modern, enterprise-grade Angular application built with Angular 20.x, featuring Azure MSAL authentication, NgRx state management, and responsive Bootstrap UI.

## Features

- **Angular 20.x** - Latest Angular framework with standalone components
- **Azure MSAL** - Secure authentication with Microsoft Authentication Library
- **NgRx Store** - Centralized state management
- **Bootstrap 5** - Responsive design framework
- **Lazy Loading** - Feature-based modular architecture
- **SCSS Styling** - Advanced CSS preprocessing
- **Docker & Kubernetes** - Production-ready containerization
- **PWA Support** - Progressive Web App capabilities
- **Unit Testing** - Karma and Jasmine setup

## Project Structure

```
demo-ui-angular/
├── src/
│   ├── app/
│   │   ├── core/                    # Core module
│   │   ├── features/                # Feature modules
│   │   │   ├── home/
│   │   │   └── scoping/
│   │   ├── shared/                  # Shared components & services
│   │   │   ├── components/
│   │   │   │   ├── add-engagement/
│   │   │   │   └── engagement-details/
│   │   │   └── services/
│   │   ├── store/                   # NgRx state management
│   │   ├── guards/                  # Route guards
│   │   ├── interceptors/            # HTTP interceptors
│   │   ├── styles/                  # Global styles
│   │   ├── app.component.ts
│   │   ├── app-routing.module.ts
│   │   └── app.config.ts
│   ├── assets/                      # Static assets
│   ├── index.html
│   └── main.ts
├── manifests/                       # Kubernetes configs
├── Dockerfile
├── nginx-custom.conf
├── angular.json
├── package.json
└── README.md
```

## Prerequisites

- **Node.js** v18+ or v20+ (LTS recommended)
- **npm** v9+ or v10+
- **Angular CLI** v20+ (`npm install -g @angular/cli@latest`)
- **Git**

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd demo-ui-angular
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Development

### Start Development Server

```bash
npm start
# or
ng serve --ssl
```

Navigate to `https://localhost:4200/`

The application will automatically reload on file changes.

### Build for Development

```bash
npm run build-dev
```

### Build for Production

```bash
npm run build-prod
```

## Testing

### Run Unit Tests

```bash
# Watch mode
npm test

# Headless with coverage
npm run test:headless
```

## Code Quality

### Linting

```bash
npm run lint
```

## Authentication Setup

The application uses Azure MSAL for authentication. Configure the following in `src/assets/config/env.js`:

```javascript
window['__env'].clientId = 'your-azure-ad-client-id';
window['__env'].tenantId = 'your-azure-ad-tenant-id';
window['__env'].tokenClientId = 'your-token-client-id';
window['__env'].redirectURI = 'https://yourdomain.com';
```

## Components

### Add Engagement Component

Located at: `src/app/shared/components/add-engagement/`

Features:
- Reactive form validation
- Dropdown lists for engagement types, regions, business units, and AD groups
- Success/error alerts
- Integrates with NgRx store for state management

**Usage:**
```html
<app-add-engagement></app-add-engagement>
```

### Engagement Details Component

Located at: `src/app/shared/components/engagement-details/`

Features:
- Displays engagement information from store
- Real-time updates
- Responsive card layout

**Usage:**
```html
<app-engagement-details></app-engagement-details>
```

## Services

### AddEngagementService

Provides API methods for:
- `submitEngagement(data)` - Submit new engagement
- `getEngagementTypes()` - Fetch engagement types
- `getRegions()` - Fetch regions
- `getBusinessUnits()` - Fetch business units
- `getAdGroups()` - Fetch AD groups

### EnvService

Static utility for accessing environment configuration.

## State Management (NgRx)

The application uses NgRx for centralized state management:

- **Store**: `src/app/store/`
- **Actions**: `src/app/shared/components/engagement-details/engagement-state/actions/`
- **Reducers**: `src/app/shared/components/engagement-details/engagement-state/reducers/`
- **Models**: `src/app/shared/components/engagement-details/engagement-state/models/`

## Docker Deployment

### Build Docker Image

```bash
docker build -t demo-ui:latest .
```

### Run Docker Container

```bash
docker run -p 8080:80 demo-ui:latest
```

Access at `http://localhost:8080`

## Kubernetes Deployment

Apply the Kubernetes manifests in order:

```bash
# Create development namespace
kubectl create namespace development

# Apply configurations
kubectl apply -f manifests/configmap_dev.yml
kubectl apply -f manifests/deployment_dev.yml
kubectl apply -f manifests/service_dev.yml
kubectl apply -f manifests/ingress_dev.yml
kubectl apply -f manifests/keda_dev.yml
```

## Environment Variables

Configure environment via `src/assets/config/env.js`:

| Variable | Description |
|----------|-------------|
| `apiURL` | Backend API base URL |
| `production` | Production mode flag |
| `clientId` | Azure AD client ID |
| `tenantId` | Azure AD tenant ID |
| `tokenClientId` | Token client ID for API access |
| `accessScope` | API access scope |
| `redirectURI` | Authentication redirect URI |
| `enableServiceWorker` | Enable PWA service worker |

## Security

- Content Security Policy headers configured in nginx
- HTTPS enforced in production
- Secure cookie handling
- XSS protection with Angular's built-in sanitization
- CSRF protection for state-changing operations

## Performance Optimization

- Lazy loading of feature modules
- OnPush change detection strategy
- Tree-shaking enabled
- Production bundle optimization
- Gzip compression in nginx

## Troubleshooting

### SSL Certificate Errors
```bash
npx office-addin-dev-certs install --machine
```

### MSAL Authentication Not Working
Verify `clientId`, `tenantId`, and `redirectURI` in `env.js`

### Build Memory Errors
```bash
node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build
```

## Browser Support

- Chrome (latest)
- Edge (latest)
- Firefox (latest)
- Safari (latest)

## Best Practices

1. **Code Organization**: Follow feature-based folder structure
2. **State Management**: Use NgRx actions for all state changes
3. **Services**: Leverage dependency injection
4. **Components**: Use OnPush change detection
5. **Observables**: Unsubscribe using `takeUntilDestroyed()`
6. **Testing**: Write unit tests for services and components
7. **Documentation**: Document complex logic and APIs

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, refer to:
- [Angular Documentation](https://angular.dev)
- [NgRx Documentation](https://ngrx.io)
- [Azure MSAL Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)

---

**Last Updated**: March 2026
**Angular Version**: 20.x
**Node Version**: 20.x LTS
