// Configures PocketBase SMTP settings from environment variables.
// In dev, set PB_SMTP_HOST=mailpit in pocketbase/.env.local to point at the
// local Mailpit container. In production, set PB_SMTP_HOST to your real SMTP
// provider. If PB_SMTP_HOST is not set, this migration is a no-op (configure
// SMTP manually via the PocketBase admin UI instead).
migrate((app) => {
  const host = process.env.PB_SMTP_HOST;
  if (!host) return;

  const settings = app.settings();
  settings.smtp.enabled = true;
  settings.smtp.host = host;
  settings.smtp.port = parseInt(process.env.PB_SMTP_PORT || "1025");
  settings.smtp.username = process.env.PB_SMTP_USERNAME || "";
  settings.smtp.password = process.env.PB_SMTP_PASSWORD || "";
  settings.smtp.authMethod = process.env.PB_SMTP_AUTH_METHOD || "PLAIN";
  settings.smtp.tls = process.env.PB_SMTP_TLS === "true";
  app.save(settings);
  console.log("[005] SMTP configured via environment variables");
}, () => {
  // Settings changes are not meaningfully reversible via down migration.
});
