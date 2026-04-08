import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    merchantId?: string | null;
    whatsapp?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      merchantId: string | null;
      whatsapp: string | null;
      needsProfile: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    merchantId?: string | null;
    whatsapp?: string | null;
    needsProfile?: boolean;
  }
}
