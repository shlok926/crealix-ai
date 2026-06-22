# The Production-Readiness Master Prompt — Basic to Advanced (Tiered Edition)
*Supersedes the earlier flat version. This one explicitly separates Basic (never skip),
Intermediate (before real users see it), and Advanced (only matters at real scale/enterprise).
A coding agent given a flat list will quietly skip "boring" basics because nothing flags them
as urgent — tiering forces it to treat Tier 1 as non-negotiable.*

---

## PART A — The Prompt (copy-paste this to your coding agent)

```
You are helping me build a production-grade application. I want you to think across
THREE TIERS, not just features:

TIER 1 = BASIC — must exist even in a weekend project. No excuses, no "later."
TIER 2 = INTERMEDIATE — must exist before a real user, recruiter, or interviewer
         touches this thing.
TIER 3 = ADVANCED — only matters once this has real traffic, real customers, or is
         being evaluated for enterprise/compliance use. Don't waste time here for
         a portfolio/MVP project, but tell me it exists so I know what I'm deferring.

For everything below, tell me explicitly which tier it landed in for THIS project,
whether it's done/partial/skipped, and why if skipped. Do not silently omit anything.


===== TIER 1 — BASIC (non-negotiable, every project) =====

SECRETS & CONFIG
- No secret/API key is ever hardcoded or committed to git. .env is gitignored,
  .env.example exists with placeholder values.
- Required env vars are validated at startup — app crashes immediately with a
  clear message if one is missing, instead of failing mysteriously later.

AUTH & INPUT
- Passwords hashed with bcrypt/argon2, never plaintext or reversible encryption.
- All user input is validated server-side, not just client-side.
- HTTPS enforced; no sensitive data ever sent over plain HTTP.

ERROR HANDLING
- No raw stack traces or internal exception details returned to the client in
  production. Errors are caught and return a clean, consistent response shape.

BASIC INFRA HYGIENE
- CORS has an explicit allow-list, never a wildcard `*` in production.
- A `/health` endpoint exists and returns real status (not just "200 OK always").
- Dependency lockfiles (package-lock.json / poetry.lock / pinned requirements.txt)
  are committed so builds are reproducible.

DOCUMENTATION
- A README exists with: how to run it locally, what env vars are needed (names
  only, no real secrets), and a one-paragraph architecture overview.

BACKUPS
- Some form of backup exists for the database, even if manual at this stage —
  "we have zero backups" is never acceptable, even on day one.


===== TIER 2 — INTERMEDIATE (before a real user/recruiter sees this) =====

ACCESS CONTROL
- Role-based access control (RBAC) if there's more than one user type — enforced
  at the route/data layer, not just hidden in the UI.
- Multi-tenant data isolation explicitly tested: write at least one test proving
  User A cannot access User B's data by guessing/incrementing an ID.

DATA PROTECTION
- The single most sensitive table/dataset in the app is identified, and it gets
  field- or table-level encryption at rest plus audit logging of reads, not just writes.

DEPENDENCY & SUPPLY CHAIN
- `npm audit` / `pip-audit` (or equivalent) runs in CI, at minimum reporting,
  ideally blocking on high/critical CVEs.
- A one-time git history secret scan (gitleaks/trufflehog) confirms no key was
  ever committed in an earlier commit, even if removed since.

PERFORMANCE & SCALE
- Database queries have indexes on every WHERE/JOIN/ORDER BY column used.
- Pagination is used everywhere instead of loading full tables.
- Caching (Redis or equivalent) is used for frequently-read, rarely-changed data.
- Connection pooling is configured — not opening a new DB connection per request.

RELIABILITY
- Backups are actually tested by restoring one, at least once.
- Database schema changes go through a migration tool (Alembic/Prisma
  migrate/etc.), not manual ALTER TABLE statements.
- The app handles SIGTERM gracefully (in-flight requests finish before shutdown).

OBSERVABILITY
- Errors are logged with enough context to debug without local reproduction.
- A basic uptime/error monitor exists (even a free-tier tool) — you find out
  about outages from your own system, not from a user.
- Logs never contain secrets, full request bodies with sensitive data, or PII
  in plaintext.

CI/CD
- Deploys go through a repeatable pipeline, not manual file copying.
- At least smoke-level automated tests run before deploy (auth flow, core
  feature path) — not full coverage, just enough to catch an obvious break.
- Separate dev/staging/prod configs exist.

AI/LLM-SPECIFIC (if this app uses any LLM/AI feature)
- The LLM API key is backend-only, proxied, never reaching the client.
- Per-user/session rate limiting and a token/cost cap exist to prevent
  abuse-driven billing spikes.
- User-supplied content is strictly separated from system-level instructions
  so it cannot override the AI's behavior (prompt injection resistance).
- If the AI can execute/analyze user-submitted code, that execution is sandboxed
  (isolated, no network, hard timeout).
- AI output is labeled as advisory, not presented as verified fact.

POLICY (minimum viable)
- A basic Privacy Policy + Terms of Service exists if any user/org data is stored.
- A security contact or `/security.txt` exists for vulnerability disclosure.
- A one-page (internal, not user-facing) incident response note exists: who's
  notified and roughly how fast if data is ever exposed.

API DESIGN
- Routes are versioned (`/api/v1/...`) so future breaking changes don't silently
  break existing clients.
- Request payload size limits and outbound call timeouts are set (a hanging
  third-party call should never tie up your server indefinitely).


===== TIER 3 — ADVANCED (only once there's real scale, real customers, or
                            real compliance pressure — flag these, don't chase them prematurely) =====

SECURITY MATURITY
- Formal threat modeling (e.g., STRIDE) done on critical flows.
- Independent penetration testing or a bug bounty program.
- WAF / DDoS protection in front of public endpoints.
- Zero-trust internal network assumptions (services don't implicitly trust
  each other just because they're on the same network).

COMPLIANCE & GOVERNANCE
- SOC 2 / ISO 27001 readiness (formal control documentation, not just good
  practices informally followed).
- Data residency/sovereignty controls if serving multiple regulatory regions
  (GDPR, India's DPDP Act, etc.), including right-to-be-forgotten automation.
- Formal vendor/third-party risk review (are your sub-processors themselves
  compliant?).
- Dependency license compliance audit (no GPL-licensed code accidentally
  shipped inside a closed-source product, etc.).

SCALE & ARCHITECTURE
- Horizontal scaling / load balancing / auto-scaling configured, not just
  "it runs on one server."
- Database read replicas or sharding strategy if write/read volume demands it.
- Feature flags and canary/blue-green deployments instead of all-at-once releases.

OBSERVABILITY AT SCALE
- Distributed tracing and structured logging across services (not just
  per-service console logs).
- Application Performance Monitoring (APM) with defined SLOs/SLAs.
- On-call rotation and escalation policy formally defined.

RESILIENCE TESTING
- Scheduled, actually-executed disaster recovery drills (not just a written plan).
- Chaos engineering / fault injection testing on critical paths.

AI GOVERNANCE (advanced, if AI is core to the product)
- Red-teaming of the AI features specifically for prompt injection and
  jailbreak attempts, on a recurring basis, not a one-time check.
- An evaluation pipeline that scores AI output quality/safety over time,
  not just "it looked right when I tested it."
- A fallback/degradation plan if the AI provider has an outage or rate-limits you.

COST GOVERNANCE
- Cloud billing alerts and resource tagging so a runaway process or attack
  doesn't silently produce a surprise bill.


After going through all three tiers against this specific project, give me:
(a) a single prioritized action list for what's realistically worth doing NOW
    given this project's actual stage (don't recommend Tier 3 work for a
    pre-launch solo project),
(b) a status table: item → tier → done/partial/skipped → reason if skipped,
(c) an updated "Known Gaps / Roadmap" section for my README that's honest about
    what's deferred and why — this is what actually reads as senior-level
    judgment to a reviewer, not a checklist of unfinished work.
```

---

## PART B — How to actually use the tiers (the realistic part)

**Tier 1 is not optional, ever.** These items take minutes to hours each, not days. If a coding agent skips any of these on a fresh project, that's a red flag about the agent or the prompt you gave it — not a legitimate scope tradeoff.

**Tier 2 is the bar for "I'd show this to a recruiter/interviewer/real user."** This is where most solo/portfolio projects should aim to land. It's achievable in days, not months, if you prioritize the items that actually apply to your specific app (e.g., AI/LLM section only matters if you're using one).

**Tier 3 is where most solo developers waste time they don't have**, building enterprise-grade resilience for an app with zero real users. The right move is almost never "implement it" — it's "know it exists, name it explicitly as a deferred concern, and be able to talk through how you'd approach it if asked." That answer in an interview is frequently stronger than having actually built it badly under time pressure.

**The one thing to never skip regardless of tier:** anything in Tier 1 plus the single highest-value Tier 2 item specific to your app's actual risk (for QuantumShield, that's encryption + audit logging on the Asset & Vendor Inventory table, and prompt-injection resistance on the AI Analyst — not generic items, the ones tied to what your app actually does).
