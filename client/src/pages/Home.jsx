
import Header from "../Components/Header"
import Navbar from "../Components/Navbar"
function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen min-h-screen bg-gray-100 relative">
     <Navbar />
     <Header/>
    </div>
  )
}

export default Home
