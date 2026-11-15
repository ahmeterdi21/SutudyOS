# StudyOS Teams — setup and pilot

[Detailed Turkish guide](TEAMS-SETUP.tr.md)

Teams is an unprovisioned development preview. It uses Supabase Auth, PostgreSQL and a private Storage bucket. Personal SQLite records remain local; only explicitly shared team data is uploaded. No cloud project has been created, no live user account has been contacted, and this feature has not been released.

## Provision

1. Create a dedicated project in the [Supabase Dashboard](https://supabase.com/dashboard). Free-plan limits apply; review [current pricing](https://supabase.com/pricing). Inactive free projects may pause, and PDF storage/downloads consume quota.
2. Run the complete `supabase/migrations/202611150001_teams.sql` in SQL Editor. It creates tables, membership-checked RPCs, RLS policies and the **private** `study-team-files` bucket. Keep the bucket private and RLS enabled.
3. Obtain the Project URL and publishable key (legacy `anon` public key also works). Never ship a secret/service-role key, database password or SMTP password.
4. Restart `npm run tauri dev`; open **Takım → Yönetici kurulumu** and connect the project. All pilot computers must use the same project. This initial implementation accepts HTTPS `*.supabase.co` projects only.
5. For a private pilot without an email provider, create two separate confirmed application users in **Authentication → Users → Add user** with strong temporary passwords. Each user signs into **Parolayla giriş** in StudyOS. Do not make friends project/Dashboard administrators.
6. For public email-code signup, enable Email Auth/signups and customize the Magic Link template with `{{ .Token }}`. Configure the signup confirmation template too if applicable. Set up custom SMTP for ordinary users: Supabase's built-in sender is restricted to organization-authorized addresses and a very low quota. [OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless) · [SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

## Pilot acceptance

With separate accounts and computers, create a team, join with a generated code, schedule a session, mark attendance, upload/open a PDF, rotate/revoke an invite and remove a member. A third nonmember must not access team rows or files. Verify stale revisions are rejected rather than overwriting a newer plan. Restart to check session persistence; sign out and confirm personal records remain intact.

Local PostgreSQL tests exercise roles, RLS and RPCs, but do not replace live Supabase Auth/SMTP/Storage HTTP tests. These live tests are still outstanding. Complete them before a public release.

## Distribution

The release workflow reads repository **Variables** `STUDYOS_TEAM_URL` and `STUDYOS_TEAM_PUBLIC_KEY` into the Rust build. Once configured, a new signed build can provide the project to ordinary users automatically. Previously installed versions are not retroactively configured. A local administrator-configured project overrides the compiled default.

## Scope and maintenance

- Up to 20 members/team; five owned teams/account. The owner cannot leave in v1; ownership transfer and whole-team deletion are not implemented.
- Invites expire after seven days with at most 20 uses. Only their hashes are stored; rotating invalidates the previous code.
- Shared sessions use UTC instants and local display times, optimistic revisions and creator/owner edit/delete rules. Joining a session does not synchronize a common live timer.
- Shared resources are PDFs up to 25 MB; uploader/owner may delete. A failed two-stage deletion remains retryable. Failed upload cleanup may require operator inspection of orphan objects.
- Polling every ~30 seconds while the team screen is active; latest 200 plans/resources shown. No offline write queue, chat, audio/video calls or presence service.
- Tokens are stored separately under Windows DPAPI, not in personal JSON exports or browser storage. Passwords are not persisted. Private downloads already saved by members cannot be recalled after removal.
- Personal JSON backups do not contain shared cloud records/files. Operators own cloud backup, quota monitoring and deletion/account-lifecycle procedures.
- Run `npm run test:teams` for the server-rule tests, `npm test` for app helpers and Cargo tests for native validation. No browser automation, live notification or audible test is needed.
