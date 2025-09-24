// src/renderer/src/main.tsx (ou src/index.tsx do renderer)
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './styles/toast-custom.css'

import i18n from './i18n'
import { I18nextProvider, useTranslation } from 'react-i18next'
import App from './App'

function AppWithLangKey(): React.ReactElement {
  const { i18n } = useTranslation()
  const [lang, setLang] = useState(i18n.resolvedLanguage || 'pt')

  useEffect(() => {
    const handler = (lng: string) => setLang(lng)
    i18n.on('languageChanged', handler)
    return () => i18n.off('languageChanged', handler)
  }, [i18n])

  return <App key={lang} />
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <AppWithLangKey />
    </I18nextProvider>
  </React.StrictMode>
)
