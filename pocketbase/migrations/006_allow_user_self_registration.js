// Allows PocketBase to auto-create a user record when requestOTP is called
// for an unknown email. Without this, requestOTP silently does nothing for
// new emails (returning a fake otpId to prevent enumeration), making it
// impossible to sign up via the OTP flow.
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.createRule = "";
  app.save(collection);
  console.log("[006] users createRule set to allow self-registration");
}, (app) => {
  const collection = app.findCollectionByNameOrId("users");
  collection.createRule = null;
  app.save(collection);
  console.log("[006] users createRule reverted");
});
