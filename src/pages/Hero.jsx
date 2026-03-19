import GooeyEffect from "../components/GooeyEffect.jsx";

export default function Hero() {
  return (
    <section
      className="w-full h-screen relative flex justify-center items-center bg  "
      style={{ cursor: "none" }}
    >
      <GooeyEffect
        imageSrc="/images/HelmetEnh.png"
        hoverSrc="/images/SannyEnh.png"
      />

 
    </section>
  );
}


