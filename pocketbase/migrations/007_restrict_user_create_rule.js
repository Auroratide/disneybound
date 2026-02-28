// Reverts migration 006: restricts direct user creation to admins only.
// New users are created by the /api/auth/request-otp Next.js route using the
// admin client, so the collection's public createRule is not needed.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.createRule = null;
  app.save(collection);
  console.log("[007] users createRule set to admin-only");
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.createRule = "";
  app.save(collection);
  console.log("[007] users createRule reverted to public");
});
