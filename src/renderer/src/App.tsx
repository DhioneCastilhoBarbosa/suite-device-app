import Footer from './components/Footer'
import { Header } from './components/Header'
import Main from './components/Main'

function App(): JSX.Element {
  return (
    <div className="flex-row min-h-screen ">
      <Header />
      <Main />
    </div>
  )
}

export default App
