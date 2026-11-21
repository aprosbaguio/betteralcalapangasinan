# BetterAlcala Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Admin-Only Mutations**: Only verified administrators (`apros.baguio@gmail.com` with `email_verified == true`, or users listed in `/admins/{uid}` with `email_verified == true`) may create, update, or delete `/civic_records/{recordId}`.
2. **PII Isolation**: `/admins/{adminUid}` contains admin email addresses and MUST NEVER be readable by unauthenticated or non-admin users. `/civic_records/{recordId}` MUST NOT store personal citizen or admin emails—only opaque `updatedByUid`.
3. **Strict Category & Status Enum**: `category` MUST be one of the 13 valid BetterAlcala categories and `verificationStatus` MUST be one of `Verified`, `Needs Review`, `Outdated`, or `Unavailable`.
4. **Immutable Creation Metadata**: On `update`, `recordId`, `category`, and `createdAt` cannot be altered, and `updatedAt` MUST equal `request.time`.
5. **Bounded Payloads**: `recordId` MUST match `^[a-zA-Z0-9_\-]+$` (<= 128 chars), `title` <= 300 chars, `verificationNotes` <= 1000 chars, and `payload` map <= 30 keys.

## 2. "Dirty Dozen" Adversarial Test Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Create**: Anonymous client attempts `create` on `/civic_records/fake-1` -> DENIED.
2. **Non-Admin Authenticated Create**: Signed-in non-admin user (`resident@gmail.com`) attempts `create` on `/civic_records/fake-2` -> DENIED.
3. **Email Spoofing Attack**: Signed-in user with `email: "apros.baguio@gmail.com"` but `email_verified: false` attempts `create` -> DENIED.
4. **Self-Assigned Admin Escalation**: Non-admin user attempts `create` on `/admins/{ownUid}` -> DENIED.
5. **Admin PII Leak Read**: Non-admin user attempts `get` or `list` on `/admins/{anyUid}` -> DENIED.
6. **Shadow / Ghost Field Injection**: Admin attempts `create` on `/civic_records/test-1` with extra key `isSuperAdmin: true` -> DENIED (`hasOnly` check).
7. **ID Poisoning Attack**: Admin attempts `create` on `/civic_records/bad$id!with*chars` -> DENIED (`isValidId` check).
8. **Invalid Category Injection**: Admin attempts `create` with `category: "arbitrary_table"` -> DENIED.
9. **Invalid Verification Status**: Admin attempts `update` setting `verificationStatus: "ApprovedByAI"` -> DENIED.
10. **Client Timestamp Forgery**: Admin attempts `create` with `createdAt` != `request.time` -> DENIED.
11. **Immutable Field Mutation**: Admin attempts `update` changing `createdAt` or `category` -> DENIED.
12. **Denial-of-Wallet Oversized String**: Admin attempts `create` with 2,000-character `title` -> DENIED (`size() <= 300`).
