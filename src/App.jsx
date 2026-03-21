import React from 'react'
import Hero from './pages/Hero'
import MidPage from './pages/MidPage'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const App = () => {

  useGSAP(() => {
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

    tl.to(".Hero", { opacity:0, duration: 4,  ease: "power2.inOut", borderRadius: "80px" })
    tl.to(".Mid", { y: "-100vh", duration: 4, ease: "power2.inOut",
      onComplete: () => {
        gsap.to(".Logo", { opacity: 1, duration: 0.5, ease: "power2.inOut" })
      },
    }, 1)
  })

  // Show message on screens smaller than 1024px (lg breakpoint)
  const isSmallScreen = window.innerWidth < 1024

  if (isSmallScreen) {
    return (
      <div className=" font-[DxWideground-Regular] w-full h-screen flex items-center justify-center bg-black px-8 ">
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