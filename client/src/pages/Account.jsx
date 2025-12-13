import Header from '../components/Header'
import BottomNavigation from '../components/BottomNavigation'
import { useLanguage } from '../context/LanguageContext'

const Account = () => {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />
      
      <main className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">{t('myAccount')}</h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">{t('welcome') || 'Welcome!'}</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              {t('login')}
            </button>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}

export default Account

