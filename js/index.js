// Author : Adarsh Mahadev

// Global flag to track if a video is playing
let videoPlaying = false;

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

// Helper: Load the embed by simply setting the iframe src from its data-src attribute.
function loadShortsEmbed(iframe) {
  const originalUrl = iframe.getAttribute("data-src");
  if (originalUrl) {
    iframe.setAttribute("allow", "encrypted-media");
    iframe.setAttribute("src", originalUrl);
  }
}

// Thumbnail Navigation for the Shorts Carousel:
const thumbnails = document.querySelectorAll('.carousel-thumbnails img');
thumbnails.forEach((thumb, index) => {
  thumb.addEventListener('click', () => {
    const carousel = bootstrap.Carousel.getInstance(document.getElementById('shortsCarousel'));
    // Only change slide if no video is playing
    if (!videoPlaying) {
      carousel.to(index);
      const carouselItem = document.querySelector(`#shortsCarousel .carousel-inner .carousel-item:nth-child(${index + 1})`);
      if (carouselItem) {
        const iframe = carouselItem.querySelector('iframe');
        if (iframe && iframe.hasAttribute('data-src')) {
          loadShortsEmbed(iframe);
        }
      }
    }
  });
});

const shortsCarousel = document.getElementById('shortsCarousel');

shortsCarousel.addEventListener('slide.bs.carousel', (e) => {
  if (videoPlaying) {
    e.preventDefault();
    return;
  }
  // Clear src from the slide that's leaving so its video stops playing.
  const prevItem = document.querySelector(`#shortsCarousel .carousel-item:nth-child(${e.from + 1})`);
  if (prevItem) {
    const prevIframe = prevItem.querySelector('iframe');
    if (prevIframe) {
      prevIframe.removeAttribute("src");
    }
  }
});

shortsCarousel.addEventListener('slid.bs.carousel', (e) => {
  thumbnails.forEach((thumb, i) => {
    thumb.classList.toggle('active', i === e.to);
  });
  const activeItem = document.querySelector(`#shortsCarousel .carousel-inner .carousel-item.active`);
  if (activeItem) {
    const iframe = activeItem.querySelector('iframe');
    if (iframe && iframe.hasAttribute('data-src')) {
      loadShortsEmbed(iframe);
    }
  }
});

// "Video should be shot in" buttons (unchanged)
const videoButtons = document.querySelectorAll('#videoShotInButtons .btn-choice');
const videoShotInInput = document.getElementById('videoShotIn');
videoButtons.forEach(button => {
  button.addEventListener('click', function() {
    videoButtons.forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    videoShotInInput.value = this.getAttribute('data-choice');
  });
});

// DOMContentLoaded initialization
document.addEventListener("DOMContentLoaded", async () => {
  // --- NEW CODE: Fetch first 5 YouTube Shorts IDs from the provided playlist ---
  try {
    const apiKey = "AIzaSyBTEaIs3SeY2DEqjOgNB8zBdND0h5GHWms";
    const playlistId = "PLEmlYxMnrcpUc4lnAwV3HD19hKHoz6Dr4";
    const maxResults = 5;
    const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${maxResults}&playlistId=${playlistId}&key=${apiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    const items = data.items;
    if (items && items.length >= maxResults) {
      const carouselItems = document.querySelectorAll('#shortsCarousel .carousel-item');
      const thumbnailImages = document.querySelectorAll('.carousel-thumbnails .thumbnail-container img');
      items.slice(0, maxResults).forEach((item, index) => {
        const videoId = item.snippet.resourceId.videoId;
        const newUrl = "https://www.youtube.com/embed/" + videoId + "?autoplay=0";
        // Update carousel iframe
        const carouselItem = carouselItems[index];
        if (carouselItem) {
          const iframe = carouselItem.querySelector('iframe');
          if (iframe) {
            iframe.setAttribute("data-src", newUrl);
            iframe.setAttribute("title", "YouTube Short " + (index + 1));
            iframe.removeAttribute("src");
          }
        }
        // Update thumbnail image
        const thumb = thumbnailImages[index];
        if (thumb) {
          thumb.setAttribute("data-video-id", videoId);
          thumb.setAttribute("src", "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg");
          thumb.setAttribute("alt", "Thumb " + (index + 1));
        }
      });
    }
  } catch (err) {
    console.error("Error fetching YouTube playlist: ", err);
  }
  // --- END NEW CODE ---

  // Lazy load YouTube iframes in About section
  const aboutSection = document.getElementById("about");
  const iframes = aboutSection.querySelectorAll("iframe");
  iframes.forEach(iframe => {
    const src = iframe.getAttribute("data-src") || iframe.getAttribute("src");
    if (src && src.includes("youtube.com/embed/")) {
      iframe.setAttribute("data-src", src);
      iframe.removeAttribute("src");
      loadShortsEmbed(iframe);
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
  
  // YouTube IFrame API Integration for Carousel
  let players = [];
  window.onYouTubeIframeAPIReady = () => {
    const carouselItems = document.querySelectorAll('#shortsCarousel .carousel-item');
    carouselItems.forEach(item => {
      const iframe = item.querySelector('iframe');
      if (iframe) {
        const player = new YT.Player(iframe, {
          events: {
            'onStateChange': onPlayerStateChange
          }
        });
        players.push(player);
      }
    });
  };

  // Handler for YouTube player state changes.
  function onPlayerStateChange(event) {
    const carousel = bootstrap.Carousel.getInstance(document.getElementById('shortsCarousel'));
    if (!carousel) return;
    
    // When a video is playing, set the flag and pause carousel auto sliding.
    if (event.data === YT.PlayerState.PLAYING) {
      console.log("Video playing - pausing carousel");
      videoPlaying = true;
      carousel.pause();
    } 
    // When the video is paused, clear the flag and resume carousel cycling.
    else if (event.data === YT.PlayerState.PAUSED) {
      console.log("Video paused - resuming carousel");
      videoPlaying = false;
      setTimeout(() => carousel.cycle(), 1000);
    }
  }
  
  // Banner text animation
  const bannerContainer = document.querySelector(".banner-text-container");
  const texts = bannerContainer.innerHTML;
  bannerContainer.innerHTML += texts;
  bannerContainer.style.animation = "scrollText 20s linear infinite";
});

document.getElementById("contact-form").addEventListener("submit", function(e) {
  e.preventDefault(); // Prevent default submission
  
  const form = this;
  const formData = new FormData(form);
  
  fetch("https://docs.google.com/forms/u/0/d/e/1FAIpQLSc9tVxRIFcveP46HgwaUZIX4qtsxvjgVB0w8UssLBSurkdliw/formResponse", {
    method: "POST",
    mode: "no-cors",
    body: formData
  }).then(response => {
    // In no-cors mode the response is opaque.
    // Assume success if no error is thrown.
    form.reset();
    var successModal = new bootstrap.Modal(document.getElementById("successModal"));
    successModal.show();
  }).catch(error => {
    // If there's an error, assume the user has already submitted.
    form.reset();
    var errorModal = new bootstrap.Modal(document.getElementById("errorModal"));
    errorModal.show();
  });
});
