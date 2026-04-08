import NextAuth from "next-auth";
import type { User as NextAuthUser } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type DbUserFields = {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  merchantId: string | null;
  whatsapp: string | null;
};

function needsProfileFor(u: DbUserFields): boolean {
  return u.role === "CUSTOMER" && !u.whatsapp;
}

function mergeTokenFromDb(
  token: Record<string, unknown>,
  dbUser: DbUserFields,
) {
  token.sub = dbUser.id;
  token.role = dbUser.role;
  token.merchantId = dbUser.merchantId;
  token.whatsapp = dbUser.whatsapp;
  token.needsProfile = needsProfileFor(dbUser);
}

const googleConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash,
        );
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email ?? "",
          name: user.name ?? "",
          role: user.role,
          merchantId: user.merchantId,
          whatsapp: user.whatsapp,
        } as NextAuthUser & {
          role: string;
          merchantId: string | null;
          whatsapp: string | null;
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      const email =
        (profile as { email?: string } | undefined)?.email?.toLowerCase() ??
        user.email?.toLowerCase();
      if (!email) return false;

      const acc = account as {
        provider: string;
        providerAccountId: string;
        refresh_token?: string | null;
        access_token?: string | null;
        expires_at?: number | null;
        token_type?: string | null;
        scope?: string | null;
        id_token?: string | null;
        session_state?: string | null;
      };

      let dbUser = await prisma.user.findUnique({ where: { email } });
      if (!dbUser) {
        const merchant = await prisma.merchant.findFirst();
        if (!merchant) return false;

        dbUser = await prisma.user.create({
          data: {
            email,
            name:
              (profile as { name?: string }).name ??
              user.name ??
              email.split("@")[0],
            emailVerified: (profile as { email_verified?: boolean })
              .email_verified
              ? new Date()
              : null,
            image: (profile as { picture?: string }).picture ?? null,
            passwordHash: null,
            role: "CUSTOMER",
            merchantId: merchant.id,
            whatsapp: null,
          },
        });

        await prisma.account.create({
          data: {
            userId: dbUser.id,
            type: "oauth",
            provider: acc.provider,
            providerAccountId: acc.providerAccountId,
            refresh_token: acc.refresh_token,
            access_token: acc.access_token,
            expires_at: acc.expires_at,
            token_type: acc.token_type,
            scope: acc.scope,
            id_token: acc.id_token,
            session_state: acc.session_state ?? null,
          },
        });
      } else {
        const existing = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: acc.provider,
              providerAccountId: acc.providerAccountId,
            },
          },
        });
        if (!existing) {
          await prisma.account.create({
            data: {
              userId: dbUser.id,
              type: "oauth",
              provider: acc.provider,
              providerAccountId: acc.providerAccountId,
              refresh_token: acc.refresh_token,
              access_token: acc.access_token,
              expires_at: acc.expires_at,
              token_type: acc.token_type,
              scope: acc.scope,
              id_token: acc.id_token,
              session_state: acc.session_state ?? null,
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile, trigger }) {
      if (trigger === "update" && token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub as string },
        });
        if (dbUser) {
          mergeTokenFromDb(token, dbUser);
        }
        return token;
      }

      if (account?.provider === "google" && profile) {
        const email = (profile as { email?: string }).email?.toLowerCase();
        if (email) {
          const dbUser = await prisma.user.findUnique({ where: { email } });
          if (dbUser) {
            mergeTokenFromDb(token, dbUser);
          }
        }
        return token;
      }

      if (user && account?.provider !== "google") {
        const u = user as NextAuthUser & {
          role: string;
          merchantId: string | null;
          whatsapp: string | null;
        };
        mergeTokenFromDb(token, {
          id: u.id ?? "",
          email: u.email ?? null,
          name: u.name ?? null,
          role: u.role,
          merchantId: u.merchantId,
          whatsapp: u.whatsapp,
        });
        return token;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) ?? "";
        session.user.role = (token.role as string) ?? "CUSTOMER";
        session.user.merchantId = (token.merchantId as string | null) ?? null;
        session.user.whatsapp = (token.whatsapp as string | null) ?? null;
        session.user.needsProfile = Boolean(token.needsProfile);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
