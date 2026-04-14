// Creates the characters collection where curated and user-submitted character
// outfits are stored. Each record represents one character+outfit combination.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");

  const collection = new Collection({
    name: "characters",
    type: "base",

    // Public can browse approved characters; authenticated users can submit new ones.
    listRule: "status = 'approved'",
    viewRule: "status = 'approved'",
    createRule: "@request.auth.id != ''",
    updateRule: null,
    deleteRule: null,

    fields: [
      {
        name: "slug",
        type: "text",
        required: true,
      },
      {
        name: "name",
        type: "text",
        required: true,
      },
      {
        name: "movie",
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
        name: "image_alt",
        type: "text",
        required: true,
      },
      {
        name: "card_color",
        type: "text",
        required: true,
      },
      {
        name: "colors",
        type: "json",
        required: true,
      },
      {
        name: "status",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["pending", "approved"],
      },
      {
        name: "submitted_by",
        type: "relation",
        required: false,
        collectionId: users.id,
        maxSelect: 1,
        cascadeDelete: false,
      },
    ],
  });

  app.save(collection);

  // Unique index on slug — ensures no two records share the same character/outfit URL key.
  app.db().newQuery(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_characters_slug ON characters (slug)"
  ).execute();

  console.log("[011] characters collection created with unique slug index");
}, (app) => {
  const collection = app.findCollectionByNameOrId("characters");
  app.delete(collection);
  console.log("[011] characters collection deleted");
});
