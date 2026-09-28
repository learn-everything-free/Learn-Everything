import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** stable "provider|subject" id used to key cloud progress */
      id: string;
    } & DefaultSession["user"];
  }
}
