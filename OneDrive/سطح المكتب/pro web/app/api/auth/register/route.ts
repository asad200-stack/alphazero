import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { slugify } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = registerSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Check if store slug already exists
    const storeSlug = slugify(validated.storeSlug)
    const existingStore = await prisma.store.findUnique({
      where: { slug: storeSlug },
    })

    if (existingStore) {
      return NextResponse.json(
        { error: 'Store slug already taken' },
        { status: 400 }
      )
    }

    // Create user and store
    const hashedPassword = await hashPassword(validated.password)

    const store = await prisma.store.create({
      data: {
        name: validated.storeName,
        slug: storeSlug,
        status: 'ACTIVE',
        owner: {
          create: {
            email: validated.email,
            password: hashedPassword,
            name: validated.name,
            role: 'STORE_OWNER',
          },
        },
        settings: {
          create: {
            allowInquiries: true,
            allowOrders: false,
          },
        },
      },
      include: {
        owner: true,
      },
    })

    // Update user with storeId
    await prisma.user.update({
      where: { id: store.owner.id },
      data: { storeId: store.id },
    })

    return NextResponse.json(
      { message: 'Store created successfully', storeId: store.id },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}

