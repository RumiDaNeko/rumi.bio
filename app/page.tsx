"use client"
import Image from "next/image";
import StaggeredMenu from '@/components/StaggeredMenu';
import Particles from '@/components/Particles';
import SpotlightCard from '@/components/SpotlightCard';
import CircularGallery from '@/components/CircularGallery'
import GradualBlur from '@/components/GradualBlur';
import DecryptedText from '@/components/DecryptedText';
import TextType from '@/components/TextType';
import ShinyText from '@/components/ShinyText';
import CurvedLoop from '@/components/CurvedLoop';
import BlurText from "@/components/BlurText";
import CountUp from '@/components/CountUp'
import Squares from '@/components/Squares';

import { Leaf } from "lucide-react";
import { useEffect, useState } from "react";

const menuItems: any[] = [
  { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
  { label: 'Cloudcode', ariaLabel: 'Learn more about cloudcode', link: 'https://cloudcode.site' },
];

const socialItems: any[] = [
  { label: 'Discord', link: 'https://discord.gg/BMzQcBG2Cj' },
  { label: 'GitHub', link: 'https://github.com/RumiDaNeko' },
  { label: 'BBB', link: 'https://builtbybit.com/members/harumi.517696/' }
];

const carroselItem: any[] = [
  { image: "https://media.harumi.io.vn/Non%20Transparent.png", text: "Cloudcode"},
  { image: "https://media.harumi.io.vn/IMG_0009.jpeg", text: "Cute, isn't she?"},
  { image: "https://media.harumi.io.vn/IMG_0479.png", text: "Overlix, part-time slave"},
  { image: "https://media.harumi.io.vn/R.jpg", text: "My goofyah university"}
]
export default function Home() {

  const [mwidth, setWidth] = useState(1024); // default safe value

useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
  }, []);
  const isSmall = mwidth < 768;
 
 useEffect(() => {
  let song = new Audio("music.mp3")
  song.muted = true
  document.getElementById("blur").style.pointerEvents = "auto"
  document.getElementById("blur").style.backdropFilter = "blur(5px)";
  document.getElementById("blur").style.zIndex = 10000
      document.getElementById("blur").style.WebkitBackdropFilter = "blur(5px)";
  document.addEventListener('click', () => {
    song.muted = false
    document.getElementById("blur").style.backdropFilter = "none";  
    document.getElementById("blur").style.pointerEvents = "none"
      document.getElementById("blur").style.WebkitBackdropFilter = "none";
      document.getElementById("blur").style.zIndex = 9998
     song.play()
    document.removeEventListener("click", () =>{})
  });
 },[])
  return (
<div>
  <div
    id="blur"
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 9998,
      pointerEvents: 'none',
      backdropFilter: 'none', // initial blur
      WebkitBackdropFilter: 'none',
      transition: 'backdrop-filter 0.5s ease, -webkit-backdrop-filter 0.5s ease'
    }}
  ></div>
  <section>
    <div id="menu" style={{ position: 'fixed', top: 0, right: 0, height:'100%', width: '100%', zIndex: 9999, pointerEvents: 'none' }}><StaggeredMenu
    position="right"
    items={menuItems}
    socialItems={socialItems}
    displaySocials={true}
    displayItemNumbering={true}
    menuButtonColor="#fff"
    openMenuButtonColor="#000"
    changeMenuColorOnOpen={true}
    colors={['#e2a6a6ff', '#ec8686']}
    logoUrl="https://media.harumi.io.vn/b1b309ef51130584278d71550927df9d.webp"
    accentColor="#ec8686"
    onMenuOpen={() => {
      document.getElementById("menu").style.pointerEvents = "auto"
      document.getElementById("blur").style.backdropFilter = "blur(5px)";
      document.getElementById("blur").style.WebkitBackdropFilter = "blur(5px)";
    }}
    onMenuClose={() => {
      document.getElementById("menu").style.pointerEvents = "none"
      document.getElementById("blur").style.backdropFilter = "none";  
      document.getElementById("blur").style.WebkitBackdropFilter = "none";
    }}
  />
  </div>
  <div style={{ height:'100vh', width: '100%' }}>
    <div style={{ background: '#1a1a1a', position: "sticky", top: 0, right: 0, width: "100%", height: '100%', zIndex: 0}}>
          <Particles
    particleColors={['#ffffff', '#ffffff']}
    particleCount={500}
    particleSpread={10}
    speed={0.1}
    particleBaseSize={100}
    moveParticlesOnHover={true}
    alphaParticles={false}
    disableRotation={false}
  />
    <GradualBlur
    target="parent"
    position="bottom"
    height="6rem"
    strength={2}
    divCount={5}
    curve="bezier"
    exponential={true}
    opacity={1}
  />
  
  </div>
  <div style={{position: "absolute", top: 0, right: 0, width: "100%", height: '100%', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', }}> 
    <div style={{ }}>
      <SpotlightCard className="card-content" spotlightColor="#ec8686">
  <div style={{color: "#fff", display: "flex"}}>
    <img style={{width:"64px", height:"64px", marginRight: "10px"}} src="https://media.harumi.io.vn/b1b309ef51130584278d71550927df9d.webp"></img>
    <div style={{display:"flex", flexDirection:"column"}}>
      <h1><strong><TextType text={"Hi, Im Rumi!"}
  typingSpeed={75}
  pauseDuration={1500}
  showCursor={true}
  cursorCharacter="|"
/></strong></h1>
      <p><DecryptedText text="im the dumbass who wrote this web" speed={100} maxIterations={100} animateOn="view" revealDirection="start" sequential={true} />
      </p>
    </div>
  </div>
</SpotlightCard>
    </div>
  </div>
  </div>
  </section>
  <section>
   <div style={{ height:'100vh', width: '100%', background: '#000'}}>
   <div style={{ background: '#1a1a1a', top: 0, right: 0, width: "100%", height: '60%', zIndex: 0}}>
       <CircularGallery items={carroselItem} bend={0} textColor="#ffffff" borderRadius={0.05} scrollEase={0.02}/>     
       <div style={{display: "flex", justifyContent: "center", alignItems:"center"}}>
 <ShinyText 
  text="Sometime, you gotta show your favorite thing to the world!" 
  disabled={false} 
  speed={3} 
  className='custom-class' 
/>
</div>
  </div>
  <div style={{ background: 'linear-gradient(to bottom, #1a1a1a, #1a1a1a, #000)', top: 0, right: 0, width: "100%", height: '40%', zIndex: 0 }}></div>
  </div>
   </section>
   <section>
  <div style={{ background: '#000', top: 0, right: 0, width: "100%", height: '100vh', zIndex: 0}}>
<CurvedLoop 
  marqueeText="What ✦ About ✦ My ✦ Boring ✦ Life? ✦"
  speed={3}
  curveAmount={-180}
  direction="left"
  interactive={false}
  className="custom-text-style"
/>
<div style={{ background: '#000', display: "flex", justifyContent:"space-evenly", alignItems:'center' }}>
 <ShinyText 
  text="Statistics" 
  disabled={false} 
  speed={3} 
  className='text-5xl spaceonresize' 
/>
</div>
<div className="cardbox" style={{background: '#000', height: isSmall == true  ? "1550px" : "40vh", width: "100%", display: "flex", flexDirection: isSmall == true  ? "column" : "row", gap:50, justifyContent:"space-evenly", alignItems:'center'}}>
  <SpotlightCard className="card-content" spotlightColor="#ec8686">
  <div  className="card-content" style={{height: "auto", width: "auto", color: "#fff", display: "flex", flexDirection:"column",alignItems: "center", justifyContent: "space-evenly"}}>
    <img style={{width:"100px", height:"100px", marginBottom: "10px"}} src="https://media.harumi.io.vn/b1b309ef51130584278d71550927df9d.webp"></img>
    <div style={{display:"flex", flexDirection:"column",alignItems: "center"}}>
     <BlurText text="About me" delay={150} animateBy="words" direction="top" className="text-2xl mb-8"/>
     <p>Im Haruka Kanemari (AKA Rumi)
      The one behind cloudcode hosting.
     </p>
    </div>
  </div>
</SpotlightCard>
  <SpotlightCard className="card-content" spotlightColor="#ec8686">
  <div  className="card-content" style={{height: "auto", width: "auto", color: "#fff", display: "flex", flexDirection:"column",alignItems: "center", justifyContent: "space-evenly"}}>
    <CountUp
  from={0}
  to={18}
  separator=","
  direction="up"
  duration={3}
  className="text-8xl mb-8"
/>
    <div style={{display:"flex", flexDirection:"column",alignItems: "center"}}>
      <h1><BlurText text="Survived years" delay={150} animateBy="words" direction="top" className="text-2xl mb-8"/></h1>
       <p>This mean i had survived 18 years of pain and suffering bruh 
     </p>
    </div>
  </div>
</SpotlightCard>
<SpotlightCard className="card-content" spotlightColor="#ec8686">
  <div  className="card-content" style={{height: "auto", width: "auto", color: "#fff", display: "flex", flexDirection:"column",alignItems: "center", justifyContent: "space-evenly"}}>
    <CountUp
  from={0}
  to={20000}
  separator=","
  direction="up"
  duration={3}
  className="text-8xl mb-8"
/>
    <div style={{display:"flex", flexDirection:"column",alignItems: "center"}}>
      <h1><BlurText text="Dollar spent on project" delay={150} animateBy="words" direction="top" className="text-2xl mb-8"/></h1>
       <p>Yes i spend this much, thanks
     </p>
    </div>
  </div>
</SpotlightCard>
<SpotlightCard className="card-content" spotlightColor="#ec8686">
  <div  className="card-content" style={{height: "auto", width: "auto", color: "#fff", display: "flex", flexDirection:"column",alignItems: "center", justifyContent: "space-evenly"}}>
    <CountUp
  from={0}
  to={4}
  separator=","
  direction="up"
  duration={3}
  className="text-8xl mb-8"
/>
    <div style={{display:"flex", flexDirection:"column",alignItems: "center"}}>
      <h1><BlurText text="VPSes owned" delay={150} animateBy="words" direction="top" className="text-2xl mb-8"/></h1>
       <p>Mostly for cloudcode and stuff
     </p>
    </div>
  </div>
</SpotlightCard>
</div>
<div style={{background:"#000", width:"100%", height:"75vh"}}>
  <div style={{zIndex: 1}}>
     <GradualBlur
    target="parent"
    position="top"
    height="6rem"
    strength={2}
    divCount={5}
    curve="bezier"
    exponential={true}
    opacity={1}
  />
  </div>
         <Squares 
speed={0.5} 
squareSize={40}
direction='diagonal' // up, down, left, right, diagonal
borderColor='#fff'
hoverFillColor='#222'
/>
</div>
  </div>
  </section>
</div>
  );
}