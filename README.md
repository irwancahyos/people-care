# People Desk

People Desk is a responsive employee-management backoffice demo. It provides a sign-in screen, an employee directory, a form for adding employees, and a read-only employee detail page. It runs entirely in the browser: there is no backend, and employees added during a session disappear after a full page refresh.

**Live demo:** [people-care-ten.vercel.app](https://people-care-ten.vercel.app/)

## Tech stack

- Angular 22 with standalone components, routing, signals, and reactive forms
- Tailwind CSS v4 for styling and responsive layouts
- `@lucide/angular` for icons and Angular CDK for the page-size overlay
- Vitest for unit and component tests

## Features

- Demo sign-in and protected employee routes
- 120 sample employees stored in memory
- Employee directory with pagination, adjustable page size, column sorting, and name **AND** group search
- Add-employee form with required-field validation, email and salary checks, a birth date/time that cannot be in the future, and ten searchable group options
- Employee details with formatted dates and Indonesian rupiah salary
- Demo-only Edit and Delete actions that show notifications without changing employee data
- Responsive mobile navigation and accessible reduced-motion behavior
- List filters and pagination retained when navigating to an employee's details and back

## Project structure

```text
src/app/
├── auth/                 # Demo login, authentication state, and route guard
├── employees/
│   ├── add/              # Add-employee form and validators
│   ├── data/             # Employee model, sample data, store, table logic, and formatters
│   ├── detail/           # Read-only employee profile
│   ├── list/             # Directory, filters, sorting, and pagination
│   └── employee-sidebar.ts
├── shared/               # Reusable form controls, buttons, and notifications
├── app.routes.ts         # Application routes
└── app.ts                # Root component
```

The app is a single Angular build. Feature-specific code stays in its feature folder; shared UI and notifications live under `shared/`. Employee records and list state are kept in memory, not sent to an API.

## Run locally

### Prerequisites

- Git
- Node.js and npm (use a Node.js version supported by Angular 22)

You do **not** need to install Angular CLI globally. The project includes it as a development dependency, and `npm start`, `npm test`, and `npm run build` use the local version. If you want to use the `ng` command directly outside npm scripts, a global Angular CLI installation is optional: `npm install -g @angular/cli`.

### Clone and start

```bash
git clone git@github.com:irwancahyos/people-care.git
cd people-care
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200) after the development server starts. Use the HTTPS clone URL from GitHub if you have not configured SSH access.

### Test and build

```bash
npm test
npm run build
```

## Dummy account

| Field    | Value      |
| -------- | ---------- |
| Username | `admin`    |
| Password | `admin123` |

These credentials are for the demo only. Authentication is client-side and resets on a full page refresh; it must not be treated as production security.

### Customize demo credentials

Copy the tracked example file, then edit the local copy before running `npm start` or `npm run build`:

```bash
cp .env.example .env.local
```

For example, set these values in `.env.local`:

```dotenv
DEMO_USERNAME=reviewer
DEMO_PASSWORD="review pass"
```

When `.env.local` exists, its values take precedence. Otherwise, the build reads `DEMO_USERNAME` and `DEMO_PASSWORD` from the process environment (including Vercel project environment variables). A missing or empty value falls back independently to `admin` or `admin123`. The username and password shown in the desktop hints and mobile dialog match the pair accepted by the login form. Restart the local server after editing `.env.local`; redeploy Vercel after changing its environment variables. `.env.local` is Git-ignored. These values are included in the public browser bundle and displayed on the login screen, so never use a real password or treat them as security credentials.
