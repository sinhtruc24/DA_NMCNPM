// Script để tạo mật khẩu đã được hash
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString("hex")}.${salt}`;
}

// Hash mật khẩu 'password123'
async function main() {
  const hashedPassword = await hashPassword('password123');
  console.log('Hashed password:', hashedPassword);
}

main().catch(console.error);