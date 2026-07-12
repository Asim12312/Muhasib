---
name: muhasib-external-integration-gaps
description: Muhasib Position 1 modules that are functional in-app but still need external providers to be production-real
metadata:
  type: project
---

Muhasib's Position 1 build (see [[muhasib-position1-architecture]]) is functionally complete in-app but these pieces use pragmatic MVP stand-ins pending external services:

- **Staff invites**: generate a shareable `/invite/<token>` link shown in the Staff UI to copy manually. No email is actually sent (no email provider wired).
- **Deadline reminders**: deadlines are generated + surfaced in the dashboard/calendar, but no email/WhatsApp dispatch — needs a provider (WhatsApp is what users actually check in PK).
- **Billing**: plan tiers + client-limit enforcement + tier-switch UI are real, but there is NO payment gateway. RAAST/card is "arranged with our team"; switching tier just updates the limit.
- **Document vault**: files stored inline as Buffer in MongoDB (8MB cap, `select:false`). Move to S3/GridFS before real volume.
- **FBR PRAL adapter** (`src/lib/fbr/pral.ts`): follows the published DI payload shape but field names must be verified against the current PRAL spec; only the sandbox mock is exercised.
- **OTP login**: not implemented — email+password only.

Also not yet done: landing page pricing copy still shows the old per-invoice tiers, not the new per-client firm plans.
