import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getGoogleAuthUrl(state: string) {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // forces Google to always return a refresh_token
    scope: GOOGLE_SCOPES,
    state,
  });
}

export async function storeTokensFromCode(code: string) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);

  const existing = await prisma.googleToken.findUnique({ where: { id: 1 } });

  const refreshToken = tokens.refresh_token ?? existing?.refreshToken;
  if (!refreshToken) {
    throw new Error(
      "Google did not return a refresh token. Remove DMT Builders from https://myaccount.google.com/permissions and try connecting again."
    );
  }

  await prisma.googleToken.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      accessToken: tokens.access_token ?? "",
      refreshToken,
      expiryDate: BigInt(tokens.expiry_date ?? Date.now()),
      scope: tokens.scope ?? GOOGLE_SCOPES.join(" "),
    },
    update: {
      accessToken: tokens.access_token ?? "",
      refreshToken,
      expiryDate: BigInt(tokens.expiry_date ?? Date.now()),
      scope: tokens.scope ?? GOOGLE_SCOPES.join(" "),
    },
  });
}

export async function isCalendarConnected() {
  const token = await prisma.googleToken.findUnique({ where: { id: 1 } });
  return Boolean(token?.refreshToken);
}

/** Returns an OAuth2 client authenticated with the stored owner tokens,
 * automatically persisting refreshed access tokens back to the database. */
export async function getAuthorizedClient() {
  const record = await prisma.googleToken.findUnique({ where: { id: 1 } });
  if (!record) {
    throw new Error(
      "Google Calendar is not connected. Visit /admin to connect Michael's Google account."
    );
  }

  const client = getOAuthClient();
  client.setCredentials({
    access_token: record.accessToken,
    refresh_token: record.refreshToken,
    expiry_date: Number(record.expiryDate),
  });

  client.on("tokens", (tokens) => {
    void prisma.googleToken.update({
      where: { id: 1 },
      data: {
        accessToken: tokens.access_token ?? record.accessToken,
        ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
        expiryDate: BigInt(tokens.expiry_date ?? Date.now()),
      },
    });
  });

  return client;
}

export async function getCalendarClient() {
  const auth = await getAuthorizedClient();
  return google.calendar({ version: "v3", auth });
}

export async function getConnectedAccountEmail(): Promise<string | null> {
  try {
    const auth = await getAuthorizedClient();
    const oauth2 = google.oauth2({ version: "v2", auth });
    const { data } = await oauth2.userinfo.get();
    return data.email ?? null;
  } catch {
    return null;
  }
}
