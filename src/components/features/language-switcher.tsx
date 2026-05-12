'use client'

import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation()

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'sw' : 'en')
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="h-9 gap-1.5 rounded-full border px-3 text-xs font-medium"
    >
      <span className="text-base leading-none">
        {language === 'en' ? '🇬🇧' : '🇰🇪'}
      </span>
      <span className="hidden sm:inline">
        {language === 'en' ? 'English' : 'Kiswahili'}
      </span>
    </Button>
  )
}
