import { NextRequest, NextResponse } from 'next/server'
import { requireStoreAccess } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validations'
import { slugify } from '@/lib/utils'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: { storeId: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    await requireStoreAccess(product.storeId)

    const body = await request.json()
    const { images, ...productData } = body

    const validated = productSchema.parse(productData)

    // Update product
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: validated,
    })

    // Update images
    if (images) {
      // Delete existing images
      await prisma.productImage.deleteMany({
        where: { productId: params.id },
      })

      // Create new images
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((url: string, index: number) => ({
            productId: params.id,
            url,
            order: index,
          })),
        })
      }
    }

    return NextResponse.json({ product: updated })
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { order: 'asc' } },
        category: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

