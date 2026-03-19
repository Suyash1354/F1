import GooeyEffect from "../components/GooeyEffect.jsx";

export default function Hero() {
  return (
    <section
      className="w-full h-screen relative flex justify-center items-center  "
      style={{ cursor: "none" }}
    >
      <div className="w-full h-screen flex flex-col justify-between items-center ">
        <GooeyEffect
          imageSrc="/images/Helmet-Photoroom.png"
          hoverSrc="/images/Sanny1-Photoroom.png "
        />

        <div className=" flex flex-col items-center justify-center w-full h-screen gap-16 bf  ">
          
          <div className="flex Heading absolute top-70 pointer-events-none justify-between items-center gap-[24vw] text-[#D5B05F] text-[6vw] pt-sans-regular">
            <h1 className="    capitalize  ">Plan C  </h1>
            <h1 className="   capitalize  "> is for  </h1>
          </div>

          <div className="Heading2   w-full  flex justify-center items-center text-[22vw] pt-sans-bold  ">
            <h1 className=" pointer-events-none text-[#4F2C1F]">Combact</h1>
            <h1 className=" absolute z-100 pointer-events-none">Combact</h1>
          </div>
        </div>


      </div>






    </section>
  );
}


