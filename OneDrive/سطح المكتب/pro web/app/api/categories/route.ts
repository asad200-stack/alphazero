import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { categorySchema } from '@/lib/validations'
import { slugify } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    if (session.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!session.storeId) {
      return NextResponse.json({ error: 'No store associated' }, { status: 400 })
    }

    const body = await request.json()
    const validated = categorySchema.parse(body)

    // Generate slug from name
    const baseSlug = slugify(validated.name)
    let slug = baseSlug
    let counter = 1

    // Ensure unique slug within store
    while (
      await prisma.category.findUnique({
        where: { storeId_slug: { storeId: session.storeId, slug } },
      })
    ) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const category = await prisma.category.create({
      data: {
        ...validated,
        slug,
        storeId: session.storeId,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create category error:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

