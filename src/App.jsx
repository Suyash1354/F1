import React, { useState, useEffect } from 'react'
import Hero from './pages/Hero'
import MidPage from './pages/MidPage'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const Loader = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-screen bg-black flex items-center justify-center z-[9999]">
      <img 
        src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjV3ZWYxY2ZqdHJzamRqa2E5aGV6am03N3RvM3hleWFkczV1OTVwNyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/lGpXFAeEHFkuUimqr9/giphy.gif"
        alt="loading..."
        className="w-40 h-40 object-contain"
      />
    </div>
  )
}

const App = () => {

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // simulate loading OR wait for window load
    const handleLoad = () => {
      setTimeout(() => setLoading(false), 1000) // small delay for smoothness
    }

    if (document.readyState === "complete") {
      handleLoad()
    } else {
      window.addEventListener("load", handleLoad)
      return () => window.removeEventListener("load", handleLoad)
    }
  }, [])

  useGSAP(() => {
    if (loading) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".Hero",
        start: "top top",
        end: "+=800",
        markers: false,
        scrub: 1,
        pin: true,
      }
    })

    tl.to(".Hero", { opacity:0, duration: 4, ease: "power2.inOut", borderRadius: "80px" })
    tl.to(".Mid", { 
      y: "-100vh", 
      duration: 4, 
      ease: "power2.inOut",
      onComplete: () => {
        gsap.to(".Logo", { opacity: 1, duration: 0.5, ease: "power2.inOut" })
      },
    }, 1)
  }, [loading])

  const isSmallScreen = window.innerWidth < 1024

  if (loading) return <Loader />

  if (isSmallScreen) {
    return (
      <div className="font-[DxWideground-Regular] w-full h-screen flex items-center justify-center bg-black px-8">
        <p className="text-white text-center text-2xl tracking-widest uppercase"
           style={{ fontFamily: "sans-serif", letterSpacing: "0.2em" }}>
          Please visit this Website on a Big Screen
        </p>
      </div>
    )
  }

  return (
    <div className='w-full h-screen'>
      <Hero />
      <MidPage />
    </div>
  )
}

export default App