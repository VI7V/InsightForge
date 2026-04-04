import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User, AuthPayload } from '../types';
import { storeJSON, getJSON, listKeys } from '../utils/storage';

const JWT_SECRET = process.env.JWT_SECRET || 'insightforge-dev-secret-change-in-production';
const JWT_EXPIRES = '7d';
const SALT_ROUNDS = 10;

export interface JWTPayload {
  userId: string;
  email: string;
}

export async function registerUser(email: string, password: string, name: string): Promise<AuthPayload> {
  // Check existing
  const existing = await getJSON<User>(`user:email:${email.toLowerCase()}`);
  if (existing) throw new Error('An account with this email already exists.');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user: User = {
    id: uuidv4(),
    email: email.toLowerCase(),
    name,
    passwordHash,
    createdAt: new Date().toISOString(),
    plan: 'free',
  };

  await storeJSON(`user:${user.id}`, user);
  await storeJSON(`user:email:${user.email}`, user);

  const token = generateToken(user);
  const { passwordHash: _, ...safeUser } = user;
  return { token, user: safeUser };
}

export async function loginUser(email: string, password: string): Promise<AuthPayload> {
  const user = await getJSON<User>(`user:email:${email.toLowerCase()}`);
  if (!user) throw new Error('Invalid email or password.');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid email or password.');

  const token = generateToken(user);
  const { passwordHash: _, ...safeUser } = user;
  return { token, user: safeUser };
}

export async function getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
  const user = await getJSON<User>(`user:${userId}`);
  if (!user) return null;
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export function generateToken(user: User): string {
  return jwt.sign({ userId: user.id, email: user.email } as JWTPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
