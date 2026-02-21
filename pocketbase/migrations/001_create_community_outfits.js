// Creates the community_outfits collection where users can submit photos
// of their Disney bounding outfits for a given character and outfit.
migrate((app) => {
  const collection = new Collection({
    name: "community_outfits",
    type: "base",

    // Anyone can submit; only admin can approve, update, or delete.
    createRule: "",
    listRule: "status = 'approved'",
    viewRule: "status = 'approved'",
    updateRule: null,
    deleteRule: null,

    fields: [
      {
        name: "character_slug",
        type: "text",
        required: true,
      },
      {
        name: "outfit_name",
        type: "text",
        required: true,
      },
      {
        name: "image",
        type: "file",
        required: true,
        maxSelect: 1,
        maxSize: 5242880, // 5 MB
        mimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
      {
        name: "submitter_name",
        type: "text",
        required: false,
      },
      {
        name: "status",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["pending", "approved", "rejected"],
      },
    ],
  });

  app.save(collection);
  console.log("[001] community_outfits collection created");
}, (app) => {
  const collection = app.findCollectionByNameOrId("community_outfits");
  app.delete(collection);
  console.log("[001] community_outfits collection deleted");
});
