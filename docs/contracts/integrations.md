# Contracts: External Integrations

> **Scope**: External dependencies, third-party APIs, and integration boundaries.  
> **Source of Truth**: Package dependencies and service implementations.  
> **Last Verified**: 2026-09-24

---

## 1. External System Interfaces

| Integration | Technology | Direction | Purpose |
|---|---|---|---|
| **MongoDB Instance** | MongoDB Wire Protocol (`mongodb://...`) | Outbound | Primary document store for application state |
| **Browser Client** | HTTP / WebSocket | Inbound | REST API consumption and real-time event delivery |

---

## 2. Potential / Future Integrations

The system does not currently integrate with third-party email providers (SendGrid, SES), external authentication (OAuth2 / SAML), or payment gateways (Stripe). All authentication and email notifications are self-contained or queued within the application boundaries.
