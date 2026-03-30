// Allows unauthenticated requests to view individual user records by ID so that
// expand: "user" works on community_outfits and returns name/avatar.
//
// listRule stays null — public bulk enumeration of users is not allowed.
// viewRule = "" — looking up a user by ID is safe because:
//   1. User IDs are already embedded in public community_outfits records.
//   2. PocketBase respects emailVisibility: false, so emails are never exposed.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.viewRule = "";
  app.save(collection);
  console.log("[009] users viewRule set to public (listRule unchanged)");
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.viewRule = null;
  app.save(collection);
  console.log("[009] users viewRule reverted to admin-only");
});
