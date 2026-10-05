# ASOC Development Setup

This document explains how to set up the ASOC project on a local development machine.

## 1. Prerequisites

Install:

- Git
- Node.js
- npm
- MongoDB / MongoDB Atlas
- VS Code or another code editor

Check installations:

```bash
node --version
npm --version
git --version
```

## 2. Clone the Repository

```bash
git clone <REPOSITORY_URL>
cd ASOC
```

## 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The Next.js application will normally be available at:

```text
http://localhost:3000
```

## 4. Backend Setup

Open another terminal from the ASOC root directory:

```bash
cd backend
npm install
```

Create a `.env` file from `.env.example`.

Configure the required environment variables.

Start the backend:

```bash
npm run dev
```

The backend will normally run at:

```text
http://localhost:5000
```

## 5. Environment Variables

Never commit the actual `.env` file.

Use:

```text
.env.example
```

as the template.

Each developer should create their own local `.env`.

## 6. Development Workflow

Before starting new work:

```bash
git checkout main
git pull origin main
```

Create a feature branch:

```bash
git checkout -b feature/feature-name
```

After completing the work:

```bash
git add .
git commit -m "feat: describe the change"
git push origin feature/feature-name
```

Create a Pull Request on GitHub.

## 7. Important Rules

- Do not commit `.env` files.
- Do not push directly to `main`.
- Keep commits focused.
- Pull the latest `main` before starting new work.
- Test changes locally before creating a Pull Request.
- Do not modify another member's feature without coordination.
