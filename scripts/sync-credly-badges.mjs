/**
 * Fetches public Credly badges and writes assets/data/credly-badges.json.
 * Run before deploy or locally: npm run sync:credly
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const USERNAME = "musalehofficial";
const API_URL = `https://www.credly.com/users/${USERNAME}/badges.json`;
const OUT_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "assets",
  "data",
  "credly-badges.json",
);

const res = await fetch(API_URL, {
  headers: { Accept: "application/json" },
});

if (!res.ok) {
  console.error(`Credly API error: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const payload = await res.json();
const badges = (payload.data ?? [])
  .filter((b) => b.public && b.state === "accepted")
  .map((b) => ({
    id: b.id,
    name: b.badge_template?.name ?? "Badge",
    issuer: b.issuer?.summary?.replace(/^issued by /i, "") ?? "",
    issuedAt: b.issued_at_date ?? null,
    imageUrl: b.image_url ?? b.badge_template?.image_url ?? b.image?.url ?? "",
    url: `https://www.credly.com/badges/${b.id}`,
  }))
  .sort((a, b) => {
    const da = a.issuedAt ?? "";
    const db = b.issuedAt ?? "";
    return db.localeCompare(da);
  });

const out = {
  username: USERNAME,
  profileUrl: `https://www.credly.com/users/${USERNAME}`,
  syncedAt: new Date().toISOString(),
  badges,
};

await mkdir(path.dirname(OUT_PATH), { recursive: true });
await writeFile(OUT_PATH, `${JSON.stringify(out, null, 2)}\n`, "utf8");
console.log(`Wrote ${badges.length} badge(s) to ${OUT_PATH}`);
