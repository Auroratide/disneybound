// Locks the community_outfits collection so only PocketBase admins (i.e. the
// Next.js API layer using superuser credentials) can create, update, or delete
// records. Ownership enforcement for deletes moves into the API route.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("community_outfits");

  collection.createRule = null;
  collection.deleteRule = null;
  // updateRule is already null — no change needed.

  app.save(collection);
  console.log("[013] community_outfits create/deleteRule locked to null (admin-only writes)");
}, (app) => {
  const collection = app.findCollectionByNameOrId("community_outfits");

  collection.createRule = "@request.auth.id != ''";
  collection.deleteRule = "@request.auth.id != '' && user = @request.auth.id";

  app.save(collection);
  console.log("[013] community_outfits create/deleteRule restored");
});
