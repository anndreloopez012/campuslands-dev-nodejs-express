import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const deriveKey = promisify(scrypt);
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

async function hashPassword(password) {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const key = await deriveKey(password, salt, KEY_LENGTH);
  return `${salt}:${key.toString("hex")}`;
}

async function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(":");
  const key = await deriveKey(password, salt, KEY_LENGTH);
  return timingSafeEqual(key, Buffer.from(hash, "hex"));
}

export { hashPassword, verifyPassword };
