const express = require("express");
const router = express.Router();
const { oauthCallback } = require("../Controllers/oauthController");
const { config } = require("../services/oauth");

router.get("/:provider", (req, res) => {
  const { provider } = req.params;
  const conf = config[provider];

  if (!conf) return res.status(400).send("Invalid provider");

  const authUrl = {
    google: "https://accounts.google.com/o/oauth2/v2/auth",
    github: "https://github.com/login/oauth/authorize",
    facebook: "https://www.facebook.com/v17.0/dialog/oauth"
  }[provider];

  // Build base query parameters
  const params = new URLSearchParams({
    client_id: conf.client_id,
    redirect_uri: conf.redirect_uri,
    response_type: "code",
    scope: conf.scope,
  });

  // For Google, force account selection popup
  if (provider === "google") {
    params.append("prompt", "select_account");
  }

  const redirect = `${authUrl}?${params.toString()}`;
  res.redirect(redirect);
});

router.get("/:provider/callback", oauthCallback);

module.exports = router;
