// Adds created and updated autodate fields to community_outfits.
// These were omitted from the initial migration; without them, sorting
// by -created fails with a 400 from PocketBase.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("community_outfits");

  collection.fields.add(new AutodateField({
    name: "created",
    onCreate: true,
    onUpdate: false,
  }));

  collection.fields.add(new AutodateField({
    name: "updated",
    onCreate: true,
    onUpdate: true,
  }));

  app.save(collection);
  console.log("[002] added created/updated fields to community_outfits");
}, (app) => {
  const collection = app.findCollectionByNameOrId("community_outfits");

  const created = collection.fields.getByName("created");
  if (created) collection.fields.remove(created);

  const updated = collection.fields.getByName("updated");
  if (updated) collection.fields.remove(updated);

  app.save(collection);
  console.log("[002] removed created/updated fields from community_outfits");
});
