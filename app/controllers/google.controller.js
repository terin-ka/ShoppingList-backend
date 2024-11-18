// konfigurace google https://support.google.com/cloud/answer/6158849?hl=en
// developer console https://console.cloud.google.com
// https://github.com/pilcrowOnPaper/arctic/blob/main/docs/pages/providers/google.md
// http://localhost:8080/login/google/callback

import { google, generateId, generateSessionToken, createSession } from "../services/auth.js";
import { generateCodeVerifier, generateState } from "arctic";
import mongoclient, { user_col, oauth_account_col } from "../services/database.js";
import { appConfig, oauthConfig } from "../../config/config.js";

const clientRedirectUrl = (id, username, email, sessionid, err) => {
  const encodedEmail = email ? encodeURIComponent(email) : "";
  const encodedUsername = username ? encodeURIComponent(username) : "";
  const encodedId = id ? encodeURIComponent(id) : "";
  const encodedSessionId = id ? encodeURIComponent(sessionid) : "";
  const encodedErr = err ? encodeURIComponent(err) : "";
  const queryString = `?id=${encodedId}&username=${encodedUsername}&email=${encodedEmail}&sessionid=${encodedSessionId}&err=${encodedErr}`;
  return `${new URL(oauthConfig.google.clientRedirect, appConfig.clientBaseUrl)}${queryString}`;
};

export async function login(_, res) {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  let url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["profile", "email"],
  });
  url = url + "&prompt=select_account"; // toto vynutí výběr účtů pokaždé když se uživatel pokusí přihlásit
  const opt = {
    path: "/",
    maxAge: 600000, // v milisec
    secure: true, // process.env.NODE_ENV === "production",
    httpOnly: true,
  };
  res.cookie("state", state, opt);
  res.cookie("code_verifier", codeVerifier, opt);
  res.location(url.toString());
  res.redirect(url.toString());
}

export async function callback(req, res) {
  const code = req.query.code?.toString() ?? null;
  const state = req.query.state?.toString() ?? null;
  const storedState = req.cookies?.state ?? null;
  const storedCodeVerifier = req.cookies?.code_verifier ?? null;
  try {
    if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
      throw new Error("Stored state or code mismatch");
    }

    const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    // vrácené hodnoty viz. https://developers.google.com/identity/openid-connect/openid-connect#an-id-tokens-payload
    const googleUser = await response.json();
    let existingUser;
    let result_u;
    try {
      await mongoclient.connect();
      existingUser = await oauth_account_col.findOne({
        provider_id: "google",
        provider_user_id: googleUser.sub,
      });

      if (existingUser) {
        result_u = await user_col.findOne({
          id: existingUser.user_id,
        });
      }
    } finally {
      if (mongoclient && mongoclient.topology && mongoclient.topology.isConnected()) {
        await mongoclient.close();
      }
    }
    if (existingUser) {
      const token = generateSessionToken();
      const session = await createSession(token, existingUser.user_id);

      return res.redirect(
        clientRedirectUrl(existingUser.user_id, result_u.username, result_u.email, token, null)
      ); /* redirect na klienta po přihlášení*/
    }

    let userId;
    try {
      await mongoclient.connect();
      userId = generateId(15);

      await user_col.insertOne({
        id: userId,
        username: googleUser.name,
        email: googleUser.email,
      });

      await oauth_account_col.insertOne({
        provider_id: "google",
        provider_user_id: googleUser.sub,
        user_id: userId,
      });
    } catch (error) {
      // If the execution reaches this line, an error occurred.
      // The transaction has already been rolled back automatically by Sequelize!
      throw new Error(error.message);
    } finally {
      if (mongoclient && mongoclient.topology && mongoclient.topology.isConnected()) {
        await mongoclient.close();
      }
    }
    //const session = await lucia.createSession(userId, {});
    const token = generateSessionToken();
    const session = await createSession(token, userId);
    return res.redirect(clientRedirectUrl(userId, googleUser.name, googleUser.email, token, null));
  } catch (e) {
    /*i při chybě provedu přesměrování zpět na klienta kde chybu ohlásím */
    return res.redirect(clientRedirectUrl(null, null, null, null, e.message));
  }
}
