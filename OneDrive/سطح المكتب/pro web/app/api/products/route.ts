import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validations'
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
    const { images, ...productData } = body

    const validated = productSchema.parse(productData)

    // Generate slug from name
    const baseSlug = slugify(validated.name)
    let slug = baseSlug
    let counter = 1

    // Ensure unique slug within store
    while (
      await prisma.product.findUnique({
        where: { storeId_slug: { storeId: session.storeId, slug } },
      })
    ) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const product = await prisma.product.create({
      data: {
        ...validated,
        slug,
        storeId: session.storeId,
        images: {
          create: images?.map((url: string, index: number) => ({
            url,
            order: index,
          })) || [],
        },
      },
      include: {
        images: true,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

