import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { UserRole } from '@prisma/client'

const secretKey = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const key = new TextEncoder().encode(secretKey)

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  storeId?: string
}

export async function encrypt(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key)
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    })
    return payload as JWTPayload
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  return await decrypt(session)
}

export async function createSession(payload: JWTPayload) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const session = await encrypt(payload)

  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function requireAuth(requiredRole?: UserRole) {
  const session = await getSession()
  
  if (!session) {
    throw new Error('Unauthorized')
  }

  if (requiredRole && session.role !== requiredRole) {
    throw new Error('Forbidden')
  }

  return session
}

export async function requireStoreAccess(storeId: string) {
  const session = await getSession()
  
  if (!session) {
    throw new Error('Unauthorized')
  }

  // Super admin can access any store
  if (session.role === 'SUPER_ADMIN') {
    return session
  }

  // Store owner can only access their own store
  if (session.storeId !== storeId) {
    throw new Error('Forbidden: Cannot access this store')
  }

  return session
}

