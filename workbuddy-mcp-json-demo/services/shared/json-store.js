import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.resolve(here, "../../data");

const defaults = {
  "users.json": [
    {
      "id": "user_001",
      "username": "demo",
      "password": "123456",
      "displayName": "Demo User"
    }
  ],
  "clients.json": [],
  "authorization-codes.json": [],
  "tokens.json": []
};

const writeQueues = new Map();

export async function ensureDataFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  for (const [filename, initial] of Object.entries(defaults)) {
    const target = path.join(DATA_DIR, filename);
    try {
      await fs.access(target);
    } catch {
      await fs.writeFile(target, JSON.stringify(initial, null, 2) + "\n", "utf8");
    }
  }
}

export async function readJson(filename) {
  await ensureDataFiles();
  const raw = await fs.readFile(path.join(DATA_DIR, filename), "utf8");
  return JSON.parse(raw);
}

export async function writeJson(filename, value) {
  await ensureDataFiles();
  const previous = writeQueues.get(filename) || Promise.resolve();
  const next = previous.then(async () => {
    const target = path.join(DATA_DIR, filename);
    const temp = `${target}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(temp, JSON.stringify(value, null, 2) + "\n", "utf8");
    await fs.rename(temp, target);
  });
  writeQueues.set(filename, next.catch(() => { }));
  return next;
}

export async function updateJson(filename, updater) {
  const rows = await readJson(filename);
  const updated = await updater(rows);
  await writeJson(filename, updated);
  return updated;
}
