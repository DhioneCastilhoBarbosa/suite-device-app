import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './styles/toast-custom.css'

import i18n from './i18n'
import { I18nextProvider, useTranslation } from 'react-i18next'
import App from './App'

function AppWithLang(): React.ReactElement {
  // Chama o hook para reagir a languageChanged sem forçar remount
  useTranslation()
  return <App />
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <AppWithLang />
    </I18nextProvider>
  </React.StrictMode>
)
