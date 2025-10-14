document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.innerWidth < 768; // Tablet or smaller
  
    const numberOfPetals = isMobile ? 15 : 30; // Fewer petals on mobile
  
    for (let i = 0; i < numberOfPetals; i++) {
      createPetal();
    }
  
    function createPetal() {
      const petal = document.createElement('div');
      petal.classList.add('petal');
  
      petal.innerText = '🌸'; // sakura emoji
  
      petal.style.left = Math.random() * 100 + 'vw';
  
      const fallDuration = (Math.random() * 7 + 8).toFixed(2);
      petal.style.animationDuration = fallDuration + 's';
  
      petal.style.opacity = (Math.random() * 0.5 + 0.5).toFixed(2);
  
      petal.style.fontSize = (Math.random() * (isMobile ? 8 : 14) + 18) + 'px';
  
      const pinkShades = ['#F8C8DC', '#F4A7B9', '#F2ACC4', '#FADADD', '#F8BBD0'];
      petal.style.color = pinkShades[Math.floor(Math.random() * pinkShades.length)];
  
      petal.style.animationDelay = (Math.random() * 5) + 's';
  
      document.body.appendChild(petal);
  
      petal.addEventListener('animationend', () => {
        petal.remove();
        createPetal();
      });
    }
  });
  