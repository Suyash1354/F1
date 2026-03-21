import React from 'react'

const MidPage = () => {
  return (
    <section className=' Mid w-full h-screen overflow-hidden '>
        <div className="Main w-full h-screen flex flex-col justify-between gap-0  items-center">
            <img className=' Logo w-80 h-160 object-cover opacity-0   ' src="/images/F1.png" alt="" />
            <img   style={{ filter: "drop-shadow(20px 0px 0px rgba(0,0,0,0.5)) ", transform: "rotate(180deg)" }} className='  w-[20vw] h-[100vh] object-cover  ' src="/images/Car.png" alt="" />
        </div>
    </section>
  )
}

export default MidPage