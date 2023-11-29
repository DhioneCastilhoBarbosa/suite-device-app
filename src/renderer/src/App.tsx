import Footer from './components/Footer'
import { Header } from './components/Header'
import Main from './components/Main'

function App(): JSX.Element {
  return (
    <div className="flex flex-row min-h-screen">
      <Header />
      <Main />
      <Footer />
    </div>
  )
}

export default App
