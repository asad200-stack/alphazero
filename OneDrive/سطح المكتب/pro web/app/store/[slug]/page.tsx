import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ProductCard from '@/components/ProductCard'

export default async function StorePage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { category?: string; search?: string }
}) {
  const store = await prisma.store.findUnique({
    where: { slug: params.slug, status: 'ACTIVE' },
    include: {
      settings: true,
    },
  })

  if (!store) {
    notFound()
  }

  const where: any = {
    storeId: store.id,
    visibility: 'VISIBLE',
  }

  if (searchParams.category) {
    const category = await prisma.category.findFirst({
      where: { storeId: store.id, slug: searchParams.category },
    })
    if (category) {
      where.categoryId = category.id
    }
  }

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: 'insensitive' } },
      { description: { contains: searchParams.search, mode: 'insensitive' } },
      { tags: { has: searchParams.search } },
    ]
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { order: 'asc' }, take: 1 },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { storeId: store.id },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="bg-white border-b border-gray-200 sticky top-0 z-50"
        style={{ borderBottomColor: store.themeColor || undefined }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {store.logo && (
                <img
                  src={store.logo}
                  alt={store.name}
                  className="h-10 w-10 object-contain"
                />
              )}
              <h1 className="text-xl font-bold" style={{ color: store.themeColor || undefined }}>
                {store.name}
              </h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Store Info */}
      {store.description && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-gray-600">{store.description}</p>
            {(store.contactEmail || store.contactPhone || store.address) && (
              <div className="mt-4 text-sm text-gray-500 space-y-1">
                {store.contactEmail && <p>Email: {store.contactEmail}</p>}
                {store.contactPhone && <p>Phone: {store.contactPhone}</p>}
                {store.address && <p>Address: {store.address}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/store/${store.slug}`}
                className={`px-4 py-2 rounded-lg ${
                  !searchParams.category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/store/${store.slug}?category=${category.slug}`}
                  className={`px-4 py-2 rounded-lg ${
                    searchParams.category === category.slug
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.name} ({category._count.products})
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-8">
          <form method="get" className="max-w-md">
            <input
              type="text"
              name="search"
              placeholder="Search products..."
              defaultValue={searchParams.search}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchParams.category && (
              <input type="hidden" name="category" value={searchParams.category} />
            )}
          </form>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} storeSlug={store.slug} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

