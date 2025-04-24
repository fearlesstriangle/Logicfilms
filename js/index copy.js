// Global flag removed as it's no longer needed

// Initialize AOS with duration 300ms and once:false (animations re-trigger on scroll)
AOS.init({
  duration: 300,
  once: false
});
AOS.refresh();

// Reveal hero text on scroll
const heroText = document.querySelector('#hero .hero-text');
window.addEventListener('scroll', () => {
  heroText.classList.toggle('visible', window.scrollY > 100);
});

// Lazy load YouTube iframes in About section (if any remain)
document.addEventListener("DOMContentLoaded", () => {
  const aboutSection = document.getElementById("about");
  const iframes = aboutSection.querySelectorAll("iframe");
  iframes.forEach(iframe => {
    const src = iframe.getAttribute("src");
    if (src && src.includes("youtube.com/embed/")) {
      iframe.setAttribute("allow", "encrypted-media");
    }
  });
  
  // Remove hero section background when video is ready
  const bgVideo = document.querySelector("#hero .bg-video");
  if (bgVideo) {
    bgVideo.addEventListener("canplay", () => {
      document.getElementById("hero").style.backgroundImage = "none";
    });
  }
  
  // Header Video Preloading
  const heroVideo = document.querySelector("#hero .bg-video");
  const sourceElem = heroVideo.querySelector("source");
  sourceElem.src = "assets/videos/header_low_quality_video.mp4";
  heroVideo.load();
  const preloadVideo = document.createElement("video");
  preloadVideo.src = "assets/videos/header_high_quality_video.mp4";
  preloadVideo.preload = "auto";
  preloadVideo.addEventListener("canplaythrough", () => {
    heroVideo.pause();
    sourceElem.src = "assets/videos/header_high_quality_video.mp4";
    heroVideo.load();
    heroVideo.play();
  });
  
  // Banner text animation
  const bannerContainer = document.querySelector(".banner-text-container");
  const texts = bannerContainer.innerHTML;
  bannerContainer.innerHTML += texts;
  bannerContainer.style.animation = "scrollText 20s linear infinite";
});
