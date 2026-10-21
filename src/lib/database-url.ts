/**
 * Ligação MySQL para o Prisma (Hostinger).
 */
export function effectiveMysqlHost(rawFromEnv: string | undefined): string {
  const trimmed = (rawFromEnv ?? "").trim();
  const host = trimmed || "localhost";
  if (process.env.NODE_ENV !== "production") {
    return trimmed || "localhost";
  }
  if (host === "localhost" || host === "::1") {
    return "127.0.0.1";
  }
  return host;
}

function withMysqlConnectTimeout(url: string): string {
  if (/[?&]connect_timeout=/.test(url)) return url;
  return url.includes("?") ? `${url}&connect_timeout=12` : `${url}?connect_timeout=12`;
}

function fixLocalhostInUrl(url: string): string {
  return url.replace(/@localhost([:/])/g, "@127.0.0.1$1");
}

export function resolveDatabaseUrl(): string {
  const siteUrl =
    process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim() || "";
  if (siteUrl.includes("skyblue-lark-202006")) {
    return withMysqlConnectTimeout(
      "mysql://u494944867_vitorduarteebb:Blade1411%40@127.0.0.1:3306/u494944867_horyzonn",
    );
  }

  const user = process.env.DATABASE_USER?.trim();
  const database = process.env.DATABASE_NAME?.trim();
  const useParts =
    process.env.DATABASE_USE_COMPONENTS?.trim().toLowerCase() === "true" ||
    process.env.DATABASE_USE_COMPONENTS === "1";

  if (useParts && user && database) {
    const host = effectiveMysqlHost(process.env.DATABASE_HOST);
    const port = process.env.DATABASE_PORT?.trim() || "3306";
    let password = "";
    const b64 = process.env.DATABASE_PASSWORD_BASE64?.trim();
    if (b64) {
      password = Buffer.from(b64, "base64").toString("utf8");
    } else {
      password = (process.env.DATABASE_PASSWORD ?? "").replace(/\r$/, "").trim();
    }
    return withMysqlConnectTimeout(
      `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`,
    );
  }

  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("Defina DATABASE_URL ou DATABASE_USE_COMPONENTS.");
  }
  return withMysqlConnectTimeout(fixLocalhostInUrl(url));
}
