---
name: muhasib-position1-architecture
description: Muhasib was re-architected from single-seller invoicing to a multi-tenant consultant platform (Position 1)
metadata:
  type: project
---

Muhasib (FBR digital invoicing SaaS) was re-architected on 2026-07-12 from a single-business invoicing app into a **multi-tenant platform for tax consultancy firms managing many SME clients** ("Position 1"). This was a deliberate product pivot chosen by the user after competitor research.

Data hierarchy: **Firm** (tenant/paying customer) → **User** (staff: principal/manager/associate) → **Client** (a managed SME — its own NTN/STRN + per-SME FBR connection) → **Buyer** (the SME's customers) → **Invoice**. Plus Deadline, StoredDocument (inline Buffer, 8MB cap), AuditLog, Invite.

Key semantic change: the old `Client` model meant "buyer"; now `Client` = managed SME and `Buyer` = the SME's customer. The seller identity + fbrMode/fbrToken moved off `User` onto each `Client`.

RBAC lives in `src/lib/access.ts` (`getSession`, `clientScope`, `canAccessClient`, `can`, `logAudit`): principal sees all firm clients; manager/associate see only clients in their `assignedTo`. All API routes are firm-scoped. Plan client-limits in `src/lib/plans.ts` (trial 3 / starter 25 / growth 100 / scale 500), enforced on SME creation.

Verified end-to-end 2026-07-12: firm register → SME → buyer → invoice → FBR sandbox accept (22-digit IRN + 72h `editableUntil`) → stats/health; tenant isolation, invite flow, associate 403 on audit, and trial plan 402 on 4th client all pass. `npm run build` clean.
