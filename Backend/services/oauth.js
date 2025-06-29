const axios = require("axios");

const config = {
  google: {
    tokenUrl: "https://oauth2.googleapis.com/token",
    profileUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    scope: "profile email",
  },
  github: {
    tokenUrl: "https://github.com/login/oauth/access_token",
    profileUrl: "https://api.github.com/user",
    emailUrl: "https://api.github.com/user/emails",
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    redirect_uri: process.env.GITHUB_REDIRECT_URI,
    scope: "user:email",
  },
  facebook: {
    tokenUrl: "https://graph.facebook.com/v17.0/oauth/access_token",
    profileUrl: "https://graph.facebook.com/me?fields=id,name,email,picture",
    client_id: process.env.FACEBOOK_CLIENT_ID,
    client_secret: process.env.FACEBOOK_CLIENT_SECRET,
    redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
    scope: "email",
  },
};

/**
 * Exchange authorization code for access token
 */
const getAccessToken = async (provider, code) => {
  try {
    const conf = config[provider];

    if (!conf) {
      throw new Error("Unsupported provider");
    }

    if (provider === "github") {
      const res = await axios.post(
        conf.tokenUrl,
        {
          client_id: conf.client_id,
          client_secret: conf.client_secret,
          code,
          redirect_uri: conf.redirect_uri,
        },
        {
          headers: { Accept: "application/json" },
        }
      );

      return res.data.access_token;
    }

    if (provider === "google" || provider === "facebook") {
      const params = new URLSearchParams();
      params.append("client_id", conf.client_id);
      params.append("client_secret", conf.client_secret);
      params.append("redirect_uri", conf.redirect_uri);
      params.append("code", code);
      params.append("grant_type", "authorization_code");

      const res = await axios.post(conf.tokenUrl, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return res.data.access_token;
    }

    throw new Error("Unsupported provider");
  } catch (err) {
    console.error(
      `Error getting access token for ${provider}:`,
      err.response?.data || err.message
    );
    throw new Error("Failed to get access token");
  }
};

/**
 * Fetch user profile using the access token
 */
const getUserProfile = async (provider, accessToken) => {
  try {
    const conf = config[provider];

    if (!conf) {
      throw new Error("Unsupported provider");
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const res = await axios.get(conf.profileUrl, { headers });

    if (provider === "google") {
      return {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        avatar: res.data.picture,
      };
    }

    if (provider === "github") {
      let email = res.data.email;

      // If email not returned in profile, fetch separately
      if (!email) {
        const emailRes = await axios.get(conf.emailUrl, { headers });
        const primaryEmail = emailRes.data.find((e) => e.primary && e.verified);
        email = primaryEmail ? primaryEmail.email : null;
      }

      return {
        id: res.data.id,
        name: res.data.name || res.data.login,
        email: email || `user${res.data.id}@github.com`,
        avatar: res.data.avatar_url,
      };
    }

    if (provider === "facebook") {
      return {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email || `${res.data.id}@facebook.com`,
        avatar: res.data.picture?.data?.url,
      };
    }

    throw new Error("Unsupported provider");
  } catch (err) {
    console.error(
      `Error getting user profile from ${provider}:`,
      err.response?.data || err.message
    );
    throw new Error("Failed to get user profile");
  }
};

module.exports = { config, getAccessToken, getUserProfile };
