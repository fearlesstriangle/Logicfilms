//Author : Adarsh Mahadev

AOS.init({
  duration: 300,
  once: false
});

// "Video should be shot in" buttons logic
const videoButtons = document.querySelectorAll('#videoShotInButtons .btn-choice');
const videoShotInInput = document.getElementById('videoShotIn');
videoButtons.forEach(button => {
  button.addEventListener('click', function() {
    videoButtons.forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    videoShotInInput.value = this.getAttribute('data-choice');
  });
});
