# Relay Digital contact form migration (review before deployment)

This change replaces the legacy public-prefixed SMTP credentials with server-only environment variables: `CONTACT_SMTP_USER`, `CONTACT_SMTP_APP_PASSWORD`, `CONTACT_RECIPIENT`. Configure these as server-only secrets in the deployment before merging; **do not copy any old password without rotating it**. The existing `NEXT_PUBLIC_EMAIL_PASSWORD`, `NEXT_PUBLIC_EMAIL_PASSWORD_2`, `NEXT_PUBLIC_API_TOKEN`, and `NEXT_PUBLIC_RESEND_API_KEY` variable names warrant a separate client-bundle exposure audit. Remove/rotate only after verifying usage and dependent services. No secret values are stored in this PR.

The previous handler disabled TLS certificate verification, interpolated untrusted text into HTML, accepted unbounded input, sent confirmation email to any submitted address (an abuse vector), and used an invalid NextResponse error path. The new handler bounds payloads at 8 KiB, validates fields, escapes HTML, retains TLS verification, and sends one internal email only. It fails closed with 503 if new configuration is absent.

The route is intentionally **not a durable CRM**. SMTP success confirms mail-provider acceptance, not CRM persistence. Add rate limiting or CAPTCHA at the edge before opening this endpoint to large-scale traffic. Test the contact form against a dedicated mailbox before merging. No real mail was sent by unit tests.

Run: `node --test relay-headless/tests/contact-core.test.mjs` (Node 22+).
