# Documentation Hub

Welcome to the technical documentation repository for the SaaS Form Platform Monorepo. This documentation is organized into clear architectural, domain, engineering, and operational domains.

---

## Navigation & Structure

```text
docs/
├── source-of-truth.md           # Authoritative mapping of domains to code files
├── documentation-audit.md       # Implementation vs Documentation audit matrix
├── architecture-risks.md        # Technical debt and architectural risk registry
│
├── architecture/                # System topology and runtime specifications
│   ├── system.md                # System component boundaries and topology
│   ├── runtime.md               # Process execution and inter-component communication
│   ├── data-flow.md             # Request and submission data flows
│   ├── dependencies.md          # Internal and external dependency tree
│   ├── scalability.md           # Concurrency model and scaling bottlenecks
│   └── security.md              # Security architecture and defense layers
│
├── decisions/                   # Architecture Decision Records (ADRs)
│   ├── README.md                # ADR Index and decision log
│   ├── ADR-001-monorepo.md      # pnpm workspace monorepo selection
│   ├── ADR-002-database.md      # MongoDB and Mongoose primary document store
│   ├── ADR-003-authentication.md # JWT with ActiveUserGuard validation
│   ├── ADR-004-realtime-invalidation.md # Socket.IO targeted room revocation
│   ├── ADR-005-form-lifecycle.md # Single draft + immutable version release
│   └── ADR-006-form-runtimes.md # Decoupled editor and public form renderers
│
├── domains/                     # Business domain specifications and state machines
│   ├── README.md                # Domain boundaries overview
│   ├── identity-authentication.md # User identity, roles, and credential management
│   ├── administration-moderation.md # Admin moderation, metrics, and user suspension
│   ├── form-builder-drafting.md # Hierarchical canvas, element AST, and draft saving
│   ├── form-deployment-versioning.md # Release snapshotting and version history
│   └── form-submissions.md      # Public submissions intake, queries, and CSV exports
│
├── contracts/                   # Canonical boundary contracts
│   ├── api.md                   # REST API endpoints, DTOs, and error codes
│   ├── database.md              # MongoDB collections, Mongoose schemas, and indexes
│   ├── events.md                # WebSocket socket.io event contracts
│   └── integrations.md          # External service boundaries and adapters
│
├── engineering/                 # Developer conventions and patterns
│   ├── coding-standards.md      # TypeScript, SCSS, and NestJS coding rules
│   ├── frontend.md              # React 19 architecture, layouts, and tokens
│   ├── backend.md               # NestJS modular architecture and dependency injection
│   ├── testing.md               # E2E test suites and verification workflow
│   ├── error-handling.md        # Exception filters and HTTP error mapping
│   └── observability.md         # Logging and diagnostic outputs
│
├── security/                    # Security architecture and threat analysis
│   ├── threat-model.md          # Attack vectors and mitigation matrix
│   ├── authentication.md        # Password hashing and JWT token handling
│   ├── authorization.md         # RBAC, user guards, and resource ownership
│   └── data-protection.md       # Sensitive data sanitization and leak prevention
│
├── operations/                  # Deployment, environment, and operations
│   ├── deployment.md            # Production build and run execution
│   ├── environments.md          # Environment variables and configuration
│   ├── infrastructure.md        # Node.js, MongoDB, and process requirements
│   ├── monitoring.md            # Health verification and log tracking
│   └── incident-response.md     # Failure scenarios and troubleshooting recovery
│
└── development/                 # Local developer guides
    ├── setup.md                 # Initial machine setup and prerequisites
    ├── local-development.md     # Running dev servers and hot-reloading
    ├── testing.md               # Executing Jest E2E tests
    └── troubleshooting.md       # Common setup errors and remedies
```
