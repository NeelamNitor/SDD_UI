# Angular Enterprise Application Template

This document provides a comprehensive guide to recreate an Angular enterprise application based on the AMIR Cloud UI project structure.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Project Configuration](#project-configuration)
5. [Project Structure](#project-structure)
6. [Core Dependencies](#core-dependencies)
7. [Authentication Setup (Azure MSAL)](#authentication-setup-azure-msal)
8. [Application Architecture](#application-architecture)
9. [Build & Deployment](#build--deployment)
10. [Docker Configuration](#docker-configuration)
11. [Kubernetes Manifests](#kubernetes-manifests)
12. [Development Workflow](#development-workflow)
13. [Implementation Issues & Solutions](#-implementation-issues--solutions) ⭐ **READ THIS IF YOU GET ERRORS**
14. [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🎯 Project Overview

**Project Type:** Enterprise Angular Application  
**Angular Version:** 20.x (Latest)  
**Architecture Pattern:** Feature-based modules with lazy loading  
**State Management:** NgRx Store  
**Authentication:** Azure MSAL (Microsoft Authentication Library)  
**UI Framework:** Syncfusion EJ2 Components  
**Styling:** SCSS with Bootstrap 5  
**Build System:** Angular Build (application builder)  
**Deployment:** Docker + Kubernetes (AKS)

---

## ⚙️ Prerequisites

Before starting, ensure you have the following installed:

- **Node.js:** v18+ or v20+ (LTS recommended)
- **npm:** v9+ or v10+
- **Angular CLI:** v20+ (`npm install -g @angular/cli@latest`)
- **Git:** Latest version
- **Docker:** Latest version (for containerization)
- **VS Code:** (Recommended IDE)

---

## 🚀 Initial Setup

### Step 1: Create New Angular Application

```bash
# Create new Angular workspace
ng new your-project-name --routing --style=scss --strict

# Navigate to project
cd your-project-name
```

### Step 2: Update Angular to Latest Version

```bash
# Update Angular CLI and Core packages
ng update @angular/cli @angular/core
```

---

## 📝 Project Configuration

### `package.json` Configuration

Create/update your `package.json` with the following structure:

```json
{
  "name": "your-project-name",
  "version": "0.0.0",
  "scripts": {
    "ng": "ng",
    "start": "node ./src/assets/scripts/SSLCert.Install.js && set NODE_OPTIONS=--no-warnings && ng serve",
    "build": "ng build",
    "build-dev": "ng build --configuration=development",
    "build-qa": "ng build --configuration=qa",
    "build-uat": "ng build --configuration=uat",
    "build-prod": "ng build --configuration=production",
    "watch": "ng build --watch --configuration development",
    "test": "ng test --watch=true --browsers=Chrome",
    "test:headless": "node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng test --watch=false --progress=false --browsers=ChromeHeadless --code-coverage",
    "postinstall": "node ./src/assets/scripts/SSLCert.Install.js",
    "lint": "ng lint"
  },
  "private": true
}
```

### `angular.json` Key Configuration

Update your `angular.json`:

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "cli": {
    "analytics": false,
    "schematicCollections": ["angular-eslint"]
  },
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "your-project-name": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss"
        },
        "@schematics/angular:application": {
          "strict": true
        }
      },
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "outputPath": {
              "base": "dist/your-project-name"
            },
            "index": "src/index.html",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              "src/favicon.ico",
              "src/assets",
              "src/assets/config/env.js",
              "src/manifest.webmanifest"
            ],
            "styles": [
              "src/app/styles/main.scss",
              "node_modules/bootstrap/dist/css/bootstrap.min.css"
            ],
            "serviceWorker": "ngsw-config.json",
            "browser": "src/main.ts",
            "stylePreprocessorOptions": {
              "includePaths": ["src/app/styles"]
            }
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "2mb",
                  "maximumError": "5mb"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          }
        }
      }
    }
  }
}
```

### `tsconfig.json` Configuration

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "esModuleInterop": true,
    "skipLibCheck": true,
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "target": "ES2022",
    "module": "esnext",
    "lib": ["es2018", "dom"],
    "useDefineForClassFields": false
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

---

## 📦 Core Dependencies

### Install Core Angular Packages

```bash
npm install @angular/animations @angular/common @angular/compiler @angular/core @angular/forms @angular/platform-browser @angular/platform-browser-dynamic @angular/router @angular/service-worker
```

### Install State Management (NgRx)

```bash
npm install @ngrx/store @ngrx/store-devtools
```

### Install Azure MSAL for Authentication

```bash
npm install @azure/msal-angular @azure/msal-browser
```

### Install UI Component Libraries

```bash
# Bootstrap
npm install bootstrap

# Syncfusion (Optional - Enterprise UI Components)
npm install @syncfusion/ej2-angular-base @syncfusion/ej2-angular-buttons @syncfusion/ej2-angular-calendars @syncfusion/ej2-angular-dropdowns @syncfusion/ej2-angular-grids @syncfusion/ej2-angular-inputs @syncfusion/ej2-angular-navigations @syncfusion/ej2-angular-notifications @syncfusion/ej2-angular-popups
```

### Install Additional Dependencies

```bash
# Azure Storage (if needed)
npm install @azure/storage-blob @azure/core-http

# SignalR (Real-time communication)
npm install @microsoft/signalr

# Utilities
npm install rxjs crypto-js file-saver jszip luxon

# Development Dependencies
npm install -D @angular/build @angular/compiler-cli @types/jasmine jasmine-core karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter typescript
```

### Install ESLint

```bash
ng add @angular-eslint/schematics
```

---

## 🗂️ Project Structure

Create the following directory structure:

```
your-project-name/
├── src/
│   ├── app/
│   │   ├── core/                    # Core module (singleton services, guards, interceptors)
│   │   │   ├── core.module.ts
│   │   │   ├── error/
│   │   │   │   └── error.component.ts
│   │   │   └── error.interceptor.ts
│   │   ├── features/                # Feature modules (lazy-loaded)
│   │   │   ├── feature1/
│   │   │   │   ├── feature1.module.ts
│   │   │   │   ├── feature1-routing.module.ts
│   │   │   │   └── components/
│   │   │   └── feature2/
│   │   ├── shared/                  # Shared module (reusable components, directives, pipes)
│   │   │   ├── components/
│   │   │   ├── directives/
│   │   │   ├── pipes/
│   │   │   ├── services/
│   │   │   └── shared.module.ts
│   │   ├── store/                   # NgRx store (global state)
│   │   │   ├── actions/
│   │   │   ├── reducers/
│   │   │   ├── selectors/
│   │   │   └── effects/
│   │   ├── interceptors/            # HTTP Interceptors
│   │   │   └── http.interceptor.ts
│   │   ├── guards/                  # Route Guards
│   │   │   └── auth.guard.ts
│   │   ├── types/                   # TypeScript interfaces and types
│   │   │   └── interfaces.ts
│   │   ├── styles/                  # Global styles
│   │   │   └── main.scss
│   │   ├── app-routing.module.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   └── app.module.ts
│   ├── assets/                      # Static assets
│   │   ├── config/
│   │   │   └── env.js              # Environment configuration
│   │   ├── images/
│   │   └── scripts/
│   │       └── SSLCert.Install.js
│   ├── environments/                # Environment files
│   │   └── environment.ts
│   ├── index.html
│   ├── main.ts
│   ├── polyfills.ts
│   ├── styles.scss
│   └── manifest.webmanifest         # PWA manifest
├── manifests/                       # Kubernetes manifests
│   ├── configmap_dev.yml
│   ├── deployment_dev.yml
│   ├── ingress_dev.yml
│   ├── service_dev.yml
│   └── keda_dev.yml
├── ssl/                             # SSL certificates for local development
│   ├── server.crt
│   └── server.key
├── Dockerfile                       # Docker configuration
├── nginx-custom.conf                # Nginx configuration
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── karma.conf.js
└── README.md
```

### Create Core Module

```bash
ng generate module core --module app
```

**`src/app/core/core.module.ts`:**

```typescript
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: []
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
```

### Create Shared Module

```bash
ng generate module shared
```

**`src/app/shared/shared.module.ts`:**

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }
```

### Create Feature Modules (Lazy-Loaded)

```bash
ng generate module features/feature1 --route feature1 --module app-routing
```

---

## 🔐 Authentication Setup (Azure MSAL)

### Step 1: Environment Configuration

**`src/assets/config/env.js`:**

```javascript
(function (window) {
  window['__env'] = window['__env'] || {};
  
  // API URLs
  window['__env'].apiURL = 'https://api.yourdomain.com';
  window['__env'].production = false;
  
  // Azure AD Configuration
  window['__env'].clientId = 'your-azure-ad-client-id';
  window['__env'].tenantId = 'your-azure-ad-tenant-id';
  window['__env'].tokenClientId = 'your-token-client-id';
  window['__env'].accessScope = 'access_as_user';
  window['__env'].redirectURI = 'https://yourdomain.com';
  
  // Feature flags
  window['__env'].enableServiceWorker = false;
})(this);
```

### Step 2: Update `index.html`

Add the environment configuration script:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Your Project Name</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <script src="assets/config/env.js"></script>
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

### Step 3: Create Environment Service

**`src/app/shared/services/env-service/env.service.ts`:**

```typescript
export class EnvService {
  private static _env: any;

  static get env(): any {
    if (!this._env) {
      const browserWindow: any = window || {};
      this._env = browserWindow['__env'] || {};
    }
    return this._env;
  }

  static get production(): boolean {
    return this.env.production || false;
  }

  static get apiURL(): string {
    return this.env.apiURL || '';
  }

  static get clientId(): string {
    return this.env.clientId || '';
  }

  static get tenantId(): string {
    return this.env.tenantId || '';
  }
}
```

### Step 4: Configure MSAL in App Module

**`src/app/app.module.ts`:**

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { 
  MsalInterceptor, 
  MsalModule, 
  MsalRedirectComponent 
} from '@azure/msal-angular';
import { 
  PublicClientApplication, 
  InteractionType 
} from '@azure/msal-browser';
import { EnvService } from './shared/services/env-service/env.service';

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || 
             window.navigator.userAgent.indexOf('Trident/') > -1;
const isLocal = window.location.hostname.includes("localhost");
const env = EnvService.env;
const redirectUri = isLocal ? "https://localhost:4200" : env.redirectURI;

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule,
    StoreModule.forRoot({}),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: env.production
    }),
    MsalModule.forRoot(
      new PublicClientApplication({
        auth: {
          clientId: env.clientId,
          authority: 'https://login.microsoftonline.com/' + env.tenantId,
          redirectUri: redirectUri
        },
        cache: {
          cacheLocation: 'localStorage',
          storeAuthStateInCookie: isIE
        }
      }),
      {
        interactionType: InteractionType.Redirect,
        authRequest: {
          scopes: ['user.read']
        }
      },
      {
        interactionType: InteractionType.Redirect,
        protectedResourceMap: new Map([
          ['https://graph.microsoft.com/v1.0/me', ['user.read']],
          [env.apiURL, [`api://${env.tokenClientId}/${env.accessScope}`]]
        ])
      }
    )
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule { }
```

### Step 5: Configure Routing with MSAL Guard

**`src/app/app-routing.module.ts`:**

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { BrowserUtils } from '@azure/msal-browser';

const routes: Routes = [
  {
    path: 'feature1',
    loadChildren: () => import('./features/feature1/feature1.module')
      .then(m => m.Feature1Module),
    canActivate: [MsalGuard]
  },
  {
    path: '',
    redirectTo: 'feature1',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    initialNavigation: !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup() 
      ? 'enabledNonBlocking' 
      : 'disabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

---

## 🏗️ Application Architecture

### HTTP Interceptor for Error Handling

**`src/app/core/error.interceptor.ts`:**

```typescript
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        
        console.error(errorMessage);
        return throwError(() => error);
      })
    );
  }
}
```

### Route Guards

**`src/app/guards/auth.guard.ts`:**

```typescript
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private msalService: MsalService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const accounts = this.msalService.instance.getAllAccounts();
    
    if (accounts.length === 0) {
      this.router.navigate(['/login']);
      return false;
    }
    
    return true;
  }
}
```

### NgRx Store Setup

**`src/app/store/reducers/index.ts`:**

```typescript
import { ActionReducerMap } from '@ngrx/store';

export interface AppState {
  // Define your state interfaces here
}

export const rootReducer: ActionReducerMap<AppState> = {
  // Add your reducers here
};
```

---

##   Engagement Details Component Example

### Overview
The Engagement Details component demonstrates a complete feature with NgRx state management, shared component architecture, and real-time updates.

### Directory Structure
```
src/app/shared/components/engagement-details/
├── engagement-details.component.ts
├── engagement-details.component.html
├── engagement-details.component.scss
├── engagement-details.component.spec.ts
├── engagement-details.module.ts
└── engagement-state/
    ├── actions/
    │   ├── eng-actions.ts
    │   └── index.ts
    ├── reducers/
    │   ├── eng-reducer.ts
    │   └── index.ts
    └── models/
        └── engDetails.ts
```

### Implementation Steps

**1. Create Model Interface:**
```typescript
// engagement-state/models/engDetails.ts
export interface EngdetailsModel {
  engagementId: number;
  engagementName: string;
  periodEndDate: string;
  regionDisplayName?: string;
  engagementTypeId: number;
}
```

**2. Define Actions:**
```typescript
// engagement-state/actions/eng-actions.ts
export const ENGDETAILS_UPDATE = 'EngDetails update';

export class EngDetailsUpdateAction {
  readonly type = ENGDETAILS_UPDATE;
  constructor(public payload?: { data: EngdetailsModel }) {}
}
```

**3. Create Reducer:**
```typescript
// engagement-state/reducers/eng-reducer.ts
export function EngDetailReducer(state = initialState, action: Action) {
  switch (action.type) {
    case ENGDETAILS_UPDATE: {
      const updatedEntities = {...state.entities, ...action.payload.data};
      sessionStorage.setItem("engDetails", JSON.stringify(action.payload.data));
      return {...state, entities: updatedEntities};
    }
    default: return state;
  }
}
```

**4. Component Implementation:**
```typescript
// engagement-details.component.ts
@Component({
  selector: 'app-engagement-details',
  templateUrl: './engagement-details.component.html',
  standalone: false
})
export class EngagementDetailsComponent implements OnInit {
  engagementDetailsObj: any = {};
  private destroyRef = inject(DestroyRef);

  constructor(
    private store: Store<RootReducerState>,
    private updateService: UpdateEngagementService
  ) {
    this.store.select(getEngDetailEntities)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => this.engagementDetailsObj = result);
  }
}
```

**5. Template:**
```html
<!-- engagement-details.component.html -->
<div class="engagement-details">
  <h3>Engagement Details</h3>
  <span class="title">Engagement Name:</span>
  <span class="value">{{ engagementDetailsObj?.engagementName }}</span>
  <span class="title">Period End Date:</span>
  <span class="value">{{ engagementDetailsObj.periodEndDate | dateFormat }}</span>
</div>
```

**6. Module Configuration:**
```typescript
// engagement-details.module.ts
@NgModule({
  declarations: [EngagementDetailsComponent],
  imports: [CommonModule, TooltipModule, SharedPipesModule],
  exports: [EngagementDetailsComponent]
})
export class EngagementDetailsModule { }
```

**7. Register in App Module:**
```typescript
import { rootReducer } from './shared/components/engagement-details/engagement-state/reducers';

StoreModule.forRoot({...rootReducer}, { metaReducers: [] })
```

### Usage
```html
<!-- Use in any component template -->
<app-engagement-details></app-engagement-details>
```

---

##  🔧 Build & Deployment

### Local Development with HTTPS

**`src/assets/scripts/SSLCert.Install.js`:**

```javascript
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const sslPath = path.join(__dirname, '../../../ssl');
const certPath = path.join(sslPath, 'server.crt');
const keyPath = path.join(sslPath, 'server.key');

if (!fs.existsSync(sslPath)) {
  fs.mkdirSync(sslPath, { recursive: true });
}

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  try {
    console.log('Installing SSL certificates for local development...');
    execSync('npx office-addin-dev-certs install --machine', { stdio: 'inherit' });
    console.log('SSL certificates installed successfully.');
  } catch (error) {
    console.error('Failed to install SSL certificates:', error);
  }
}
```

### Angular CLI Configuration for HTTPS

Update `angular.json` serve options:

```json
"serve": {
  "builder": "@angular/build:dev-server",
  "options": {
    "ssl": true,
    "sslCert": "ssl/server.crt",
    "sslKey": "ssl/server.key"
  }
}
```

### Build Scripts

```bash
# Development build
npm run build-dev

# Production build
npm run build-prod

# Run tests with coverage
npm run test:headless
```

---

## 🐳 Docker Configuration

### Dockerfile

**`Dockerfile`:**

```dockerfile
# Stage 1: Build the Angular application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Build the application
ARG CONFIGURATION=production
RUN npm run build-${CONFIGURATION}

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx-custom.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/dist/your-project-name /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

**`nginx-custom.conf`:**

```nginx
events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Angular routing
    location / {
      try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }
  }
}
```

### Build Docker Image

```bash
docker build -t your-project-name:latest .
docker run -p 8080:80 your-project-name:latest
```

---

## ☸️ Kubernetes Manifests

### ConfigMap

**`manifests/configmap_dev.yml`:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: your-project-config
  namespace: development
data:
  env.js: |
    (function (window) {
      window['__env'] = window['__env'] || {};
      window['__env'].apiURL = 'https://api-dev.yourdomain.com';
      window['__env'].production = false;
      window['__env'].clientId = 'your-dev-client-id';
      window['__env'].tenantId = 'your-tenant-id';
      window['__env'].tokenClientId = 'your-token-client-id';
      window['__env'].accessScope = 'access_as_user';
      window['__env'].redirectURI = 'https://dev.yourdomain.com';
      window['__env'].enableServiceWorker = false;
    })(this);
```

### Deployment

**`manifests/deployment_dev.yml`:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-project-deployment
  namespace: development
spec:
  replicas: 2
  selector:
    matchLabels:
      app: your-project
  template:
    metadata:
      labels:
        app: your-project
    spec:
      containers:
      - name: your-project
        image: your-registry.azurecr.io/your-project:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        volumeMounts:
        - name: config-volume
          mountPath: /usr/share/nginx/html/assets/config
      volumes:
      - name: config-volume
        configMap:
          name: your-project-config
```

### Service

**`manifests/service_dev.yml`:**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: your-project-service
  namespace: development
spec:
  selector:
    app: your-project
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
```

### Ingress

**`manifests/ingress_dev.yml`:**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: your-project-ingress
  namespace: development
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - dev.yourdomain.com
    secretName: your-project-tls
  rules:
  - host: dev.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: your-project-service
            port:
              number: 80
```

### KEDA Autoscaling

**`manifests/keda_dev.yml`:**

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: your-project-scaler
  namespace: development
spec:
  scaleTargetRef:
    name: your-project-deployment
  minReplicaCount: 2
  maxReplicaCount: 10
  triggers:
  - type: cpu
    metadata:
      type: Utilization
      value: "70"
```

---

## 🔄 Development Workflow

### 1. Start Development Server

```bash
npm start
# Or
ng serve --ssl
```

Navigate to `https://localhost:4200/`

### 2. Run Tests

```bash
# Unit tests with watch
npm test

# Unit tests headless with coverage
npm run test:headless
```

### 3. Lint Code

```bash
npm run lint
```

### 4. Build for Production

```bash
npm run build-prod
```

### 5. Generate Components

```bash
# Generate component
ng generate component features/feature1/components/my-component

# Generate service
ng generate service shared/services/my-service

# Generate guard
ng generate guard guards/my-guard

# Generate module
ng generate module features/feature2 --route feature2 --module app-routing
```

---

## 📚 Additional Configurations

### Service Worker (PWA)

**`ngsw-config.json`:**

```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)"
        ]
      }
    }
  ]
}
```

### Karma Test Configuration

**`karma.conf.js`:**

```javascript
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {},
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};
```

---

## 🎨 Styling Setup

### Main SCSS File

**`src/app/styles/main.scss`:**

```scss
// Import Bootstrap
@import 'bootstrap/scss/bootstrap';

// Variables
$primary-color: #007bff;
$secondary-color: #6c757d;
$font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

// Global styles
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: $font-family;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// Utility classes
.text-primary {
  color: $primary-color !important;
}

.mt-2 {
  margin-top: 0.5rem;
}

// Add more global styles as needed
```

---

## 🔒 Security Considerations

1. **Content Security Policy:** Add CSP headers in nginx configuration
2. **HTTPS Only:** Enforce HTTPS in production
3. **Secure Cookies:** Use secure flag for cookies
4. **Input Validation:** Validate all user inputs
5. **XSS Protection:** Use Angular's built-in sanitization
6. **CSRF Protection:** Implement CSRF tokens for state-changing operations
7. **Regular Updates:** Keep dependencies up to date

---

## 📖 Best Practices

1. **Lazy Loading:** Use lazy loading for feature modules
2. **OnPush Change Detection:** Use for performance optimization
3. **Unsubscribe:** Always unsubscribe from observables using `takeUntilDestroyed()`
4. **Type Safety:** Use strong typing throughout the application
5. **Code Organization:** Follow feature-based folder structure
6. **Testing:** Write unit tests for components, services, and guards
7. **Documentation:** Document complex logic and APIs
8. **Error Handling:** Implement global error handling
9. **Performance:** Monitor and optimize bundle sizes
10. **Accessibility:** Follow WCAG guidelines

---

## 🚀 Deployment Checklist

- [ ] Update environment configurations for target environment
- [ ] Run linting: `npm run lint`
- [ ] Run tests: `npm run test:headless`
- [ ] Build application: `npm run build-prod`
- [ ] Build Docker image
- [ ] Push Docker image to registry
- [ ] Update Kubernetes manifests with correct image tag
- [ ] Apply Kubernetes manifests
- [ ] Verify deployment health
- [ ] Run smoke tests
- [ ] Monitor application logs

---

## 🔧 Implementation Issues & Solutions

This section documents known issues encountered during setup and their solutions. **IMPORTANT: Follow these solutions if you encounter the same issues during npm install or npm start.**

### 1. Dependency Resolution Issues (npm install)

**Problem:**
```
npm error ERESOLVE unable to resolve dependency tree
npm error Found: @angular/core@20.3.17
npm error Could not resolve dependency: peer @angular/core@"^18.0.0" from @ngrx/store@18.1.1
```

**Cause:** NgRx 18.x was released before Angular 20.x and expects Angular 18.x or 19.x

**Solution:**
Update `package.json` to use compatible versions:
```json
{
  "dependencies": {
    "@angular/core": "^20.0.0",
    "@ngrx/store": "^19.0.0",
    "@ngrx/store-devtools": "^19.0.0",
    "@azure/msal-angular": "^4.0.0",
    "@azure/msal-browser": "^4.0.0"
  },
  "devDependencies": {
    "@angular-eslint/schematics": "^19.0.0",
    "typescript": "~5.8.0"
  }
}
```

**Install Command:**
```bash
npm install --legacy-peer-deps
```

**Why `--legacy-peer-deps`?** Some packages may have stricter peer dependency constraints. This flag allows npm to proceed despite peer dependency conflicts (safe in this case).

---

### 2. TypeScript Version Incompatibility

**Problem:**
```
Error: The Angular Compiler requires TypeScript >=5.8.0 and <6.0.0 but 5.5.4 was found instead.
```

**Cause:** Angular 20 requires TypeScript 5.8.x minimum

**Solution:**
Update `package.json`:
```json
{
  "devDependencies": {
    "typescript": "~5.8.0"
  }
}
```

Then reinstall:
```bash
npm install --legacy-peer-deps
```

---

### 3. Angular CLI Configuration Issues (buildTarget)

**Problem:**
```
Schema validation failed with the following errors:
  Data path "" must have required property 'buildTarget'.
```

**Cause:** Angular 20 uses `buildTarget` instead of `browserTarget` in serve configuration

**Solution:**
Update `angular.json` serve and extract-i18n sections:

**BEFORE (incorrect):**
```json
{
  "serve": {
    "builder": "@angular/build:dev-server",
    "options": {
      "browserTarget": "demo-ui-angular:build",
      "ssl": true,
      "sslCert": "ssl/server.crt",
      "sslKey": "ssl/server.key"
    }
  }
}
```

**AFTER (correct):**
```json
{
  "serve": {
    "builder": "@angular/build:dev-server",
    "options": {
      "buildTarget": "demo-ui-angular:build"
    },
    "configurations": {
      "production": {
        "buildTarget": "demo-ui-angular:build:production"
      },
      "development": {
        "buildTarget": "demo-ui-angular:build:development"
      }
    }
  },
  "extract-i18n": {
    "builder": "@angular/build:extract-i18n",
    "options": {
      "buildTarget": "demo-ui-angular:build"
    }
  }
}
```

---

### 4. SSL Certificate Path Configuration Issues

**Problem:**
```
An unhandled exception occurred: ENOENT: no such file or directory, open 'C:\Anthropic Demo\demo-ui-angular\ssl\server.crt'
```

**Cause:** SSL certificates are installed to user home directory, not project directory

**Solution - Option A (Disabled SSL - Recommended for Development):**
```json
{
  "serve": {
    "builder": "@angular/build:dev-server",
    "options": {
      "buildTarget": "demo-ui-angular:build"
    }
  }
}
```

Run on HTTP (development):
```bash
npm start
# Opens http://localhost:4200
```

**Solution - Option B (Use System SSL Certificates):**
If you need HTTPS, use the certificates installed by office-addin-dev-certs:
```bash
npx office-addin-dev-certs install --machine
```

Then in `angular.json`:
```json
{
  "serve": {
    "options": {
      "buildTarget": "demo-ui-angular:build",
      "ssl": true,
      "sslCert": "C:\\Users\\YOUR_USERNAME\\.office-addin-dev-certs\\localhost.crt",
      "sslKey": "C:\\Users\\YOUR_USERNAME\\.office-addin-dev-certs\\localhost.key"
    }
  }
}
```

---

### 5. Simplify npm start Script

**Problem:** Script complexity with SSL certificate installation can cause issues on Windows

**Solution:**
Update `package.json` start script:

**BEFORE:**
```json
{
  "scripts": {
    "start": "node ./src/assets/scripts/SSLCert.Install.js && set NODE_OPTIONS=--no-warnings && ng serve"
  }
}
```

**AFTER (Recommended):**
```json
{
  "scripts": {
    "start": "ng serve --configuration=development --open"
  }
}
```

This will:
- Start dev server on `http://localhost:4200`
- Automatically open the browser
- No SSL complications

---

### 6. Component Import Path Issues

**Problem:**
```
TS2307: Cannot find module '../engagement-state/reducers' or its corresponding type declarations.
```

**Cause:** Missing explicit `/index` in import paths for barrel exports

**Solution:**
Use explicit index paths in component imports:

**BEFORE (incorrect):**
```typescript
import { RootReducerState } from '../engagement-state/reducers';
```

**AFTER (correct):**
```typescript
import { RootReducerState } from '../engagement-state/reducers/index';
```

Create `/index.ts` files in reducer directories:
```typescript
// src/app/shared/components/engagement-details/engagement-state/reducers/index.ts
export * from './eng-reducer';
```

---

### 7. Environment Configuration (.env.js)

**Problem:** Azure credentials exposed in version control

**Cause:** env.js is committed with placeholder credentials

**Solution:**
Set empty values for development:
```javascript
// src/assets/config/env.js
(function (window) {
  window['__env'] = window['__env'] || {};

  // API URLs
  window['__env'].apiURL = 'http://localhost:3000';
  window['__env'].production = false;

  // Azure AD Configuration (Optional - Configure with YOUR credentials)
  window['__env'].clientId = '';
  window['__env'].tenantId = '';
  window['__env'].tokenClientId = '';
  window['__env'].accessScope = 'access_as_user';
  window['__env'].redirectURI = 'http://localhost:4200';

  // Feature flags
  window['__env'].enableServiceWorker = false;
  window['__env'].enableMSAL = false;
})(this);
```

**To Enable MSAL Later:**
1. Update clientId, tenantId in env.js
2. Uncomment MSAL setup in `app.config.ts`
3. Add MsalGuard back to routes
4. Set `enableMSAL = true`

---

### 8. Removing Azure MSAL for Development

**Problem:** Azure authentication required for every feature test

**Cause:** MSAL module configured in app.config.ts

**Solution - Remove MSAL:**

**1. Update app.config.ts:**
```typescript
// REMOVE: MsalModule, MsalInterceptor, MSAL configuration
// KEEP: HttpClientModule, StoreModule, ErrorInterceptor only

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(
      StoreModule.forRoot(rootReducer, { metaReducers: [] }),
      StoreDevtoolsModule.instrument({...})
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ]
};
```

**2. Update app-routing.module.ts:**
```typescript
// REMOVE: MsalGuard, BrowserUtils imports
// REMOVE: canActivate: [MsalGuard] from all routes

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'scoping',
    loadChildren: () => import('./features/scoping/scoping.module').then(m => m.ScopingModule)
  }
];
```

**3. Update app.component.ts:**
```typescript
// REMOVE: MsalModule import from imports array

imports: [RouterOutlet, CommonModule]
```

**4. Update home.component.ts:**
```typescript
// REMOVE: MsalService injection
// REMOVE: logout() method

export class HomeComponent implements OnInit {
  userDisplayName: string = 'Developer';

  ngOnInit(): void {
    // No authentication required for development
  }
}
```

---

### 9. Build Size Optimization

**Issue:** Bundle size increases with unnecessary dependencies

**Metrics:**
- **With MSAL:** 2.59 MB initial bundle
- **Without MSAL:** 1.89 MB initial bundle (27% reduction)

**Recommendation:** Remove MSAL for development, add back when needed for production

---

### 10. Node Memory Issues

**Problem:**
```
JavaScript heap out of memory when building
```

**Solution:**
```bash
# Use max memory flag for builds
node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build
```

Or update `package.json`:
```json
{
  "scripts": {
    "test:headless": "node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng test --watch=false --progress=false --browsers=ChromeHeadless --code-coverage"
  }
}
```

---

## ✅ Quick Setup Checklist

Follow this checklist to avoid the above issues:

- [ ] Use `npm install --legacy-peer-deps`
- [ ] Ensure TypeScript 5.8.x is installed
- [ ] Use `buildTarget` (not `browserTarget`) in angular.json
- [ ] Disable SSL in angular.json serve options
- [ ] Remove MSAL from app.config.ts
- [ ] Remove MsalGuard from app-routing.module.ts
- [ ] Set empty Azure credentials in env.js
- [ ] Use simple start script: `ng serve --configuration=development --open`
- [ ] Run `npm start` and access http://localhost:4200

---

## 📝 Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [NgRx Documentation](https://ngrx.io)
- [Azure MSAL Angular](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-angular)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

## 🆘 Troubleshooting & FAQ

**First, check:** [Implementation Issues & Solutions](#-implementation-issues--solutions) section above for known setup issues.

### Common npm install Issues

| Issue | Solution |
|-------|----------|
| `ERESOLVE unable to resolve dependency tree` | Use `npm install --legacy-peer-deps` |
| `Cannot find module 'typescript'` | Update TypeScript: `npm install typescript@~5.8.0 --legacy-peer-deps` |
| `Package XXX not found` | Clear cache: `npm cache clean --force && npm install --legacy-peer-deps` |

### Common npm start Issues

| Issue | Solution |
|-------|----------|
| `buildTarget required` | Update `angular.json` - change `browserTarget` to `buildTarget` |
| `ENOENT: ssl/server.crt` | Remove SSL from angular.json serve options |
| `Port 4200 already in use` | Use different port: `ng serve --port 4201` |
| `Cannot find module '@angular/build'` | Reinstall: `npm install --legacy-peer-deps` |

### Build Issues

**Issue:** Build fails with TypeScript errors
**Solution:**
```bash
# Clear cache and rebuild
rm -rf .angular/cache
npm start
```

**Issue:** Build succeeds but application won't load
**Solution:**
1. Check browser console (F12) for errors
2. Verify routes are correct in `app-routing.module.ts`
3. Verify components are declared in modules

**Issue:** Module not found errors
**Solution:**
1. Check import paths use explicit `/index` for barrel exports
2. Verify file names match case-sensitivity (especially on Linux)
3. Verify all components are declared in their modules

### Runtime Issues

**Issue:** Page shows blank or "Cannot match any routes"
**Solution:**
1. Check app-routing.module.ts for route definitions
2. Verify all lazy-loaded modules exist
3. Check browser console for 404 errors

**Issue:** Reactive form not working
**Solution:**
1. Verify `ReactiveFormsModule` is imported in module
2. Check form group initialization in component
3. Verify form control names match template `formControlName`

**Issue:** NgRx store not updating
**Solution:**
1. Verify action is dispatched: `store.dispatch(myAction())`
2. Check reducer is handling the action
3. Use Redux DevTools browser extension to debug store
4. Check store selector is subscribed correctly

### Dependency Issues

**Issue:** Cannot install with npm
**Solution:**
```bash
# Clean installation
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Issue:** Mixing Node/npm versions
**Solution:**
```bash
# Use correct versions
node --version  # Should be 20.x
npm --version   # Should be 10.x+
nvm use 20      # If using nvm
```

---

## ✅ Tested Configuration

This template has been tested with the following versions:

| Package | Version | Status |
|---------|---------|--------|
| Node.js | 24.12.0 | ✅ Working |
| npm | 11.6.2 | ✅ Working |
| Angular | 20.3.17 | ✅ Working |
| TypeScript | 5.8.3 | ✅ Working |
| @angular/cli | 20.3.19 | ✅ Working |
| @ngrx/store | 19.2.1 | ✅ Working |
| @azure/msal-angular | 4.0.0 | ✅ Optional |
| Bootstrap | 5.3.0 | ✅ Working |

---

## 📞 Getting Help

### Before Asking for Help

1. **Check the Implementation Issues section** above
2. **Check the Troubleshooting table** above
3. **Check the browser console** (F12) for error messages
4. **Check npm logs**: `cat ~/.npm/_logs/*-debug.log`
5. **Try clearing cache**: `npm cache clean --force`

### Common Error Messages

```
ERESOLVE unable to resolve dependency tree
→ Use --legacy-peer-deps flag

Cannot find module 'XXX'
→ Run npm install, check import paths

TS2307: Cannot find type declarations
→ Ensure TypeScript 5.8.x, check paths use /index

buildTarget required
→ Update angular.json, use buildTarget not browserTarget

ENOENT: no such file or directory
→ Check file paths exist, verify working directory

Port 4200 in use
→ Use different port: ng serve --port 4201
```

---

## 📄 License

Specify your project license here.

---

## 👥 Contributors

List project contributors and maintainers here.

---

**Last Updated:** March 2026  
**Angular Version:** 20.x  
**Node Version:** 20.x LTS
