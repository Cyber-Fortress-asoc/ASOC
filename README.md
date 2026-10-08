# ASOC — Automated Security Operations Center

ASOC is a security monitoring and incident response platform designed to collect security events, detect suspicious activity, generate alerts, and assist security analysts with investigation and response.

## Project Objective

The goal of this project is to build a centralized platform that can:

- Collect and process security events
- Normalize incoming logs
- Detect suspicious activity using security rules
- Generate and prioritize alerts
- Allow analysts to investigate security incidents
- Enrich events with threat intelligence
- Track incident response activities
- Provide real-time security monitoring
- Maintain audit logs of important actions

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express.js
- TypeScript

### Database

- PostgreSQL
- pgvector

### Real-Time Communication

- WebSockets

### Future Infrastructure

- Redis
- Docker
- Cloud deployment

## Project Structure

```text
ASOC/
│
├── frontend/              # Next.js application
│
├── backend/               # Express.js backend
│
├── docs/                  # Project documentation
│   ├── setup.md
│   ├── architecture.md
│   └── modules.md
│
├── README.md
└── .gitignore
```

## Requirements

Install the following before running the project:

- Git
- Node.js
- npm
- MongoDB or MongoDB Atlas
- A code editor such as VS Code

## Getting Started

Clone the repository:

```bash
git clone https://github.com/Cyber-Fortress-asoc/ASOC
cd ASOC
```

### Backend

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example`.

Then start the development server:

```bash
npm run dev
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend and backend will run independently during development.

## Environment Variables

Never commit `.env` files to GitHub.

Use `.env.example` as the template for required environment variables.

## Development Workflow

Do not work directly on `main`.

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

After completing the work:

```bash
git add .
git commit -m "feat: describe your change"
git push origin feature/your-feature
```

Create a Pull Request on GitHub.

Changes should be reviewed before being merged into `main`.

## Documentation

Detailed project documentation is available in:

- `docs/setup.md` — Development setup
- `docs/architecture.md` — System architecture
- `docs/modules.md` — Project modules and responsibilities

## Project Status

Currently establishing the project foundation and development architecture.

Features will be implemented incrementally throughout development.
