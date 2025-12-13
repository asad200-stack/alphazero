/**
 * Helper functions for product price calculations
 */

export const getProductPrices = (product) => {
  // Handle both string and number values from database
  const discountPriceRaw = product.discount_price
  const priceRaw = product.price
  
  // Debug: log raw values - TEMPORARY FOR DEBUGGING
  // console.log('🔍 ProductHelper RAW -', product.name || 'Unknown', {
  //   id: product.id,
  //   discount_price_raw: discountPriceRaw,
  //   price_raw: priceRaw,
  //   discount_percentage_raw: product.discount_percentage,
  //   discount_price_type: typeof discountPriceRaw,
  //   price_type: typeof priceRaw
  // })
  
  const discountPrice = (discountPriceRaw !== null && 
                         discountPriceRaw !== undefined && 
                         discountPriceRaw !== '' && 
                         String(discountPriceRaw) !== '0' &&
                         discountPriceRaw !== 0)
    ? parseFloat(discountPriceRaw) 
    : null
    
  const originalPriceValue = (priceRaw !== null && priceRaw !== undefined)
    ? parseFloat(priceRaw) 
    : 0
  
  // Calculate discount price from percentage if needed
  let calculatedDiscountPrice = discountPrice
  
  // If we have discount_percentage, calculate the discount price
  if (product.discount_percentage && originalPriceValue > 0) {
    const discountPercent = parseFloat(product.discount_percentage)
    if (!isNaN(discountPercent) && discountPercent > 0 && discountPercent < 100) {
      const calculated = originalPriceValue * (1 - discountPercent / 100)
      const calculatedRounded = Math.round(calculated * 100) / 100
      
      // Use calculated price if discount_price is null, or use the one that's provided
      if (calculatedDiscountPrice === null) {
        calculatedDiscountPrice = calculatedRounded
      }
    }
  }

  // Check if product has valid discount - simplified check
  const hasDiscount = originalPriceValue > 0 && 
                      calculatedDiscountPrice !== null && 
                      !isNaN(calculatedDiscountPrice) &&
                      calculatedDiscountPrice > 0 && 
                      calculatedDiscountPrice < originalPriceValue

  // Calculate discount percentage
  const discountPercentage = hasDiscount
    ? Math.round(((originalPriceValue - calculatedDiscountPrice) / originalPriceValue) * 100)
    : (product.discount_percentage ? parseFloat(product.discount_percentage) : 0)

  // Get display prices
  const displayPrice = hasDiscount ? calculatedDiscountPrice : originalPriceValue
  const originalPrice = hasDiscount ? originalPriceValue : null

  // Debug: log calculated values - TEMPORARY FOR DEBUGGING
  // console.log('✅ ProductHelper CALCULATED -', product.name || 'Unknown', {
  //   discountPrice,
  //   calculatedDiscountPrice,
  //   originalPriceValue,
  //   hasDiscount,
  //   displayPrice,
  //   originalPrice,
  //   discountPercentage
  // })

  // Ensure all values are correct
  const result = {
    hasDiscount: Boolean(hasDiscount),
    displayPrice: hasDiscount ? Number(calculatedDiscountPrice) : Number(originalPriceValue),
    originalPrice: hasDiscount ? Number(originalPriceValue) : null,
    discountPrice: calculatedDiscountPrice,
    originalPriceValue: Number(originalPriceValue),
    discountPercentage: Number(discountPercentage)
  }
  
  // Debug: log final result
  console.log('✅ FINAL RESULT -', product.name || 'Unknown', result)
  
  return result
}

