// Locks the characters collection so only PocketBase admins (i.e. the Next.js
// API layer using superuser credentials) can create, update, or delete records.
// Regular user tokens — however obtained — are rejected for all write operations.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("characters");

  collection.createRule = null;
  // updateRule and deleteRule are already null — no change needed.

  app.save(collection);
  console.log("[012] characters createRule locked to null (admin-only writes)");
}, (app) => {
  const collection = app.findCollectionByNameOrId("characters");

  collection.createRule = "@request.auth.id != ''";

  app.save(collection);
  console.log("[012] characters createRule restored to authenticated-user");
});
