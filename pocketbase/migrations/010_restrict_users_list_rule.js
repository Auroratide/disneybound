// Locks down the users listRule to admin-only.
// listRule was implicitly permissive, allowing authenticated users to enumerate
// other accounts. Only viewRule = "" is needed (for expanding user relations on
// community_outfits); bulk listing must remain admin-only.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.listRule = null;
  app.save(collection);
  console.log("[010] users listRule set to admin-only");
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.listRule = "";
  app.save(collection);
  console.log("[010] users listRule reverted to public");
});
