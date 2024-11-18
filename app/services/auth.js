import { Google } from "arctic";
import { appConfig, oauthConfig } from "../../config/config.js";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { generateRandomString } from "@oslojs/crypto/random";
import { sha256 } from "@oslojs/crypto/sha2";
import { hash, verify } from "@node-rs/argon2";
import mongoclient, { user_col, user_session_col } from "../services/database.js";

export const google = new Google(
  oauthConfig.google.clientId,
  oauthConfig.google.clientSecret,
  new URL(oauthConfig.google.redirectURI, appConfig.hostBaseUrl)
);

export async function hashPassword(password) {
  return await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

export async function verifyPasswordHash(hash, password) {
  return await verify(hash, password);
}

const random = {
  read(bytes) {
    crypto.getRandomValues(bytes);
  },
};

export function generateId(length) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  return generateRandomString(random, alphabet, length);
}

export function generateSessionToken() {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(token, userId) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await mongoclient.connect();
  try {
    await user_session_col.insertOne({
      id: session.id,
      user_id: session.userId,
      expires_at: session.expiresAt,
    });
  } finally {
    await mongoclient.close();
  }
  return session;
}

export async function validateSessionToken(token) {
  let session = null;
  let user = null;
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  try {
    await mongoclient.connect();
    const result_s = await user_session_col.findOne({
      id: sessionId,
    });
    if (!result_s) return { session: session, user: user };

    const result_u = await user_col.findOne({
      id: result_s.user_id,
    });
    session = {
      id: result_s.id,
      userId: result_s.user_id,
      expiresAt: new Date(result_s.expires_at * 1000),
    };
    user = {
      id: result_s.user_id,
      username: result_u.username,
      email: result_u.email,
      admin: result_u.admin,
    };

    if (Date.now() >= session.expiresAt.getTime()) {
      await user_session_col.deleteOne({
        id: session.id,
      });
      return null;
    }
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
      session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
      const filter = { id: session.id };
      const updateDocument = {
        $set: {
          expires_at: session.expiresAt,
        },
      };
      await user_session_col.update(filter, updateDocument);
    }
  } finally {
    await mongoclient.close();
  }
  return { session: session, user: user };
}

export async function invalidateSession(sessionId) {
  try {
    await mongoclient.connect();
    await user_session_col.deleteOne({
      id: sessionId,
    });
  } finally {
    await mongoclient.close();
  }
}

export function verifyRequestOrigin(origin, allowedDomains) {
  if (!origin || allowedDomains.length === 0) {
    return false;
  }
  const originHost = safeURL(origin)?.host ?? null;
  if (!originHost) {
    return false;
  }
  for (const domain of allowedDomains) {
    let host;
    if (domain.startsWith("http://") || domain.startsWith("https://")) {
      host = safeURL(domain)?.host ?? null;
    } else {
      host = safeURL("https://" + domain)?.host ?? null;
    }
    if (originHost === host) {
      return true;
    }
  }
  return false;
}
function safeURL(url) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}
