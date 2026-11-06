# MarketBridge — Replit full-stack starter

This is the next development foundation for MarketBridge. It replaces browser-only demo storage with Supabase Auth and PostgreSQL.

## What is included now
- Next.js + TypeScript app
- Supabase email/password sign-up and sign-in
- Business and marketer account roles
- Shared open-project feed
- Business project publishing
- Marketer proposal submission
- Initial PostgreSQL schema and Row Level Security policies
- Initial verification, contracts, milestones, payment ledger, disputes and reviews tables

## Run in Replit
1. Create a new Replit App using the Node.js / Next.js template.
2. Upload this project ZIP or import the extracted files into the Replit workspace.
3. In the Shell, run `npm install`.
4. Create a Supabase project at https://supabase.com/.
5. In Supabase SQL Editor, run `supabase/schema.sql`.
6. In Replit Secrets, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   Use the Project URL and anon/public key from Supabase Project Settings → API.
7. Run `npm run dev`.

## Important setup notes
- Enable email authentication in Supabase. For production, configure a custom SMTP provider and your site's allowed redirect URLs.
- The app uses the Supabase anon key in the browser. This is expected; RLS is the security boundary. Never expose a Supabase service-role key in client code.
- Admin status must be granted only through a trusted server-side process. Do not let users set their own role to admin.
- KYC is only represented by a provider-reference workflow. Do not collect Aadhaar/PAN/passport numbers, document images, or full address details in this starter.
- Payments are schema placeholders only. Do not create a "funds held" or "escrow" claim until a payment provider approves the marketplace settlement structure. Payment records should be written by verified server-side webhooks only.
- Email notifications, AI model calls, scheduled deadline reminders, file uploads, social publishing APIs, refunds, and payout automation are not active yet. They need server-side routes, provider credentials, testing and compliance review.

## Recommended next implementation sequence
1. Complete profile editing and proposal review / acceptance using secure database functions.
2. Add server-side notification jobs and email delivery.
3. Integrate a compliant KYC provider with provider callbacks.
4. Integrate payment gateway orders, signed webhooks, refunds and approved marketplace payouts.
5. Add secure project file storage and dispute evidence upload.
6. Add social media account integrations only through official OAuth/API permissions.
7. Add AI matching and proposal analysis using a server-side model API key.
8. Add audit logging, rate limiting, backups, monitoring and production security review.

This is a working starter foundation, not a finished production marketplace. Test all policies with separate business, marketer and admin accounts before inviting real users.
