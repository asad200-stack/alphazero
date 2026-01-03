import { useLanguage } from '../context/LanguageContext'
import ScrollAnimation from './ScrollAnimation'

const TrustElements = () => {
  const { language, t } = useLanguage()

  const elements = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      title: language === 'ar' ? 'تقييمات زبائن' : 'Customer Reviews',
      description: language === 'ar' ? 'آلاف التقييمات الإيجابية' : 'Thousands of positive reviews'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: language === 'ar' ? 'شحن سريع' : 'Fast Shipping',
      description: language === 'ar' ? 'توصيل سريع وآمن' : 'Fast and secure delivery'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: language === 'ar' ? 'دفع آمن' : 'Secure Payment',
      description: language === 'ar' ? 'دفع آمن أو عند الاستلام' : 'Secure payment or cash on delivery'
    }
  ]

  return (
    <div className="bg-white border-y border-gray-200 py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {elements.map((element, index) => (
            <ScrollAnimation key={index} delay={index * 150}>
              <div 
                className="flex items-center space-x-4 space-x-reverse text-center md:text-right hover-lift smooth-transition p-4 rounded-lg"
              >
                <div className="flex-shrink-0 text-blue-600 smooth-transition group-hover:scale-110">
                  {element.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {element.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {element.description}
                  </p>
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TrustElements

