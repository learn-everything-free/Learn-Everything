// Auth.js v5 — OAuth providers with JWT sessions. No database: the session
// lives in a signed, httpOnly cookie, and each user gets a stable `uid`
// (provider|subject) used to key their progress blob in Redis.
//
// Providers are only registered when their env vars exist, so the platform
// runs (and builds) without any OAuth configured — the sign-in menu simply
// shows nothing. See .env.example for setup.

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";

const providers: Provider[] = [];
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google);
}
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(GitHub);
}

// Without any OAuth provider there is nothing to sign in with, so a placeholder
// secret keeps the platform fully functional in zero-config runs. When
// providers ARE configured, AUTH_SECRET must be set — Auth.js will fail loudly
// otherwise (correct: a missing secret would be a deployment mistake).
const hasOAuth = providers.length > 0;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret: process.env.AUTH_SECRET ?? (hasOAuth ? undefined : "no-oauth-configured"),
  // Vercel sets this automatically; explicit for local production builds.
  trustHost: true,
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, account }) {
      if (account) token.uid = `${account.provider}|${token.sub}`;
      return token;
    },
    session({ session, token }) {
      if (token.uid) session.user.id = token.uid as string;
      return session;
    },
  },
});
