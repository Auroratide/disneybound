---
name: login-to-localhost
description: Use when navigating the website via agent-browser and needing to log in as a test user.
---

You should pretend to be a real user when using the website via agent-browser. Do not try and get a token from pocketbase manually, do everything within the website.

When you want to login, follow these steps:

1. Click the login button on the website.
2. Use `claude@disneybounding.com` as your email.
3. In a separate browser session, navigate to `localhost:8025`. This is Mailpit. It will have an email with the auth code in it. Find that email and remember the six-digit code.
4. Go back to the website, input the OTP code, and log in.
