// Adds an optional user relation to community_outfits so uploaded outfits are
// owned by an account. Also tightens the access rules: only authenticated users
// can submit, and only the owner can delete their own record.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("community_outfits");
  const users = app.findCollectionByNameOrId("users");

  collection.fields.add(new RelationField({
    name: "user",
    collectionId: users.id,
    required: false,
    maxSelect: 1,
  }));

  collection.createRule = "@request.auth.id != ''";
  collection.deleteRule = "@request.auth.id != '' && user = @request.auth.id";

  app.save(collection);
  console.log("[004] Added user field and updated rules on community_outfits");
}, (app) => {
  const collection = app.findCollectionByNameOrId("community_outfits");

  const field = collection.fields.getByName("user");
  if (field) collection.fields.remove(field);

  collection.createRule = "";
  collection.deleteRule = null;

  app.save(collection);
  console.log("[004] Reverted user field on community_outfits");
});
