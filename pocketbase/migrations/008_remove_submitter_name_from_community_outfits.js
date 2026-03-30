// Removes the legacy submitter_name text field from community_outfits.
// Submitter identity is now derived from the user relation field instead.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("community_outfits");
  collection.fields = collection.fields.filter(f => f.name !== "submitter_name");
  app.save(collection);
  console.log("[008] Removed submitter_name from community_outfits");
}, (app) => {
  const collection = app.findCollectionByNameOrId("community_outfits");
  collection.fields.push(new TextField({
    name: "submitter_name",
    required: false,
  }));
  app.save(collection);
  console.log("[008] Restored submitter_name on community_outfits");
});
