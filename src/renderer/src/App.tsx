import Footer from './components/Footer'
import { Header } from './components/Header'
import Main from './components/Main'
import { ToastContainer } from 'react-toastify'

function App(): JSX.Element {
  return (
    <>
      <div className="flex flex-col items-center h-screen ">
        <Header />
        <Main />
        <Footer />
      </div>
      <ToastContainer position="top-right" autoClose={4000} theme="colored" pauseOnHover />
    </>
  )
}

export default App
