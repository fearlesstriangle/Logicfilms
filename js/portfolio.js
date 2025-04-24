//Author : Adarsh Mahadev

AOS.init({ duration: 300, once: false });

// Filter logic: show all items by default.
const filterBtns = document.querySelectorAll('.filter-btn');
const videoItems = document.querySelectorAll('.video-item');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.getAttribute('data-filter');
    videoItems.forEach(item => {
      const cat = item.getAttribute('data-cat');
      item.style.display = (filter === 'all' || cat === filter) ? 'block' : 'none';
    });
    AOS.refresh();
  });
});

// Modal video functionality using the built-in website player.
const portfolioItems = document.querySelectorAll('.video-item');
const modalVideo = document.getElementById('modalVideo');
const videoModal = new bootstrap.Modal(document.getElementById('videoModal'));
let currentVideoUrl = "";
const videoModalElement = document.getElementById('videoModal');

videoModalElement.addEventListener('show.bs.modal', function () {
  modalVideo.src = currentVideoUrl;
});
videoModalElement.addEventListener('hidden.bs.modal', function () {
  modalVideo.src = "";
});
portfolioItems.forEach(item => {
  item.addEventListener('click', () => {
    const videoId = item.getAttribute('data-video-id');
    currentVideoUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&rel=0&showinfo=0`;
    videoModal.show();
  });
});

// Noembed Script: Updates video titles dynamically without an API key
document.querySelectorAll('.video-item').forEach(item => {
  const videoId = item.getAttribute('data-video-id');
  fetch(`https://noembed.com/embed?url=https://youtu.be/${videoId}`)
    .then(response => response.json())
    .then(data => {
      if(data && data.title) {
        const titleElem = item.querySelector('.video-title');
        if(titleElem) {
          titleElem.textContent = data.title;
        }
      }
    })
    .catch(err => console.error('Error fetching video metadata:', err));
});
