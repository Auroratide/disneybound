// Enables OTP authentication on the built-in users collection and disables
// password auth, so the only way to log in is via a one-time email code.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");

  collection.passwordAuth = { enabled: false };
  collection.otp = { enabled: true, duration: 300, length: 6 };

  app.save(collection);
  console.log("[003] OTP auth enabled on users collection");
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");

  collection.passwordAuth = { enabled: true };
  collection.otp = { enabled: false };

  app.save(collection);
  console.log("[003] OTP auth reverted on users collection");
});
