const wheel = document.getElementById('wheel');
const mainContent = document.getElementById('main-content');
const popup = document.getElementById('popup');
const popupPrize = document.getElementById('popup-prize');
const claimBtn = document.getElementById('claimBtn');
const demoSelect = document.getElementById('demoSelect');
const daysPanel = document.getElementById('days-panel');
const fireworksCanvas = document.getElementById('fireworks-canvas');
const losingPopup = document.getElementById('losing-popup');
const closeLosingBtn = document.getElementById('closeLosingBtn');

let currentRotation = 0;
let coinsInterval;
let fireworks = [];
let fireworksAnimation;

const demos = {
  A: ['$1000', '€1000', '$500', '€500', 'ZERO', '€250'],
  B: ['100% up to €500 + 200 Free Spins', '100% up to €250', '100% up to €350 + 100 Free Spins', '200% up to €300 + 40 Free Spins', '100% up to €500 Cashback', '100% up to €350 + 100 Free Spins'],
  C: [
    '/assets/icon1.png', 
    '/assets/icon2.png', 
    '/assets/icon3.png',
    '/assets/icon1.png',
    '/assets/icon2.png',
    '/assets/icon3.png'
  ]
};

const colors = ['#110b35', '#289d89'];

const dailyRewards = [
  ['$100', 'Free Spin', 'Jackpot'],
  ['€100', 'Bonus 50$', 'Try Again'],
  ['Free spin', '$25', 'Bonus €25'],
  ['$50', 'Free Spin', 'Jackpot'],
  ['€50', 'Bonus 25$', 'Try Again'],
  ['Free spin', '$25', 'Bonus €25'],
  ['$250', 'Free Spin', 'Bonus 100$']
];

function generateWheel(sliceItems, colorsArr = colors, isImage = false) {
  const slicesCount = sliceItems.length;
  const degPerSlice = 360 / slicesCount;
  wheel.innerHTML = '';
  const radius = 120;

  for (let i = 0; i < slicesCount; i++) {
    const angle = i * degPerSlice + degPerSlice / 2;

    if (isImage) {
      const imgEl = document.createElement('img');
      imgEl.className = 'slice-image';
      imgEl.src = sliceItems[i];
      imgEl.style.width = '40px';
      imgEl.style.height = '40px';
      imgEl.style.objectFit = 'contain';
      imgEl.style.position = 'absolute';
      imgEl.style.top = '50%';
      imgEl.style.left = '50%';
      imgEl.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`;

      wheel.appendChild(imgEl);
    } else {
      const textEl = document.createElement('div');
      textEl.className = 'slice-text';
      textEl.textContent = sliceItems[i];

      if (sliceItems[i].length > 25) textEl.style.fontSize = "11px";
      else if (sliceItems[i].length > 15) textEl.style.fontSize = "13px";
      else textEl.style.fontSize = "16px";

      textEl.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-90deg)`;
      textEl.style.maxWidth = "100px"; 
      textEl.style.wordWrap = "break-word";

      wheel.appendChild(textEl);
    }
  }

  let gradient = '';
  for (let i = 0; i < slicesCount; i++) {
    gradient += `${colorsArr[i % colorsArr.length]} ${i * degPerSlice}deg ${(i + 1) * degPerSlice}deg,`;
  }
  wheel.style.background = `conic-gradient(${gradient.slice(0, -1)})`;
}


generateWheel(demos.A);

function updateDailyRewards() {
  const dayItems = daysPanel.querySelectorAll('.day-item');
  dayItems.forEach((day, i) => {
    const reward = dailyRewards[i][Math.floor(Math.random() * dailyRewards[i].length)];
    day.textContent = `Day ${i + 1}: ${reward}`;
  });
}
updateDailyRewards();

demoSelect.addEventListener('change', () => {
  if (demoSelect.value === 'C') {
    generateWheel(demos.C, colors, true); 
  } else {
    generateWheel(demos[demoSelect.value]);
  }
});


document.getElementById('spinBtn').addEventListener('click', () => {
  const sliceTexts = Array.from(wheel.querySelectorAll('.slice-text')).map(t => t.textContent);
  const slicesCount = sliceTexts.length;
  const degPerSlice = 360 / slicesCount;
  const randomIndex = Math.floor(Math.random() * slicesCount);
  const offset = Math.random() * (degPerSlice - 2) + 1;
  const targetDeg = 360 * 5 + degPerSlice * randomIndex + offset;
  currentRotation += targetDeg;
  wheel.style.transition = 'transform 5s cubic-bezier(0.25, 1, 0.3, 1)';
  wheel.style.transform = `rotate(${currentRotation}deg)`;

setTimeout(() => {
  const landedIndex = Math.floor(((360 - currentRotation % 360) % 360) / degPerSlice);
  const prize = sliceTexts[landedIndex];

  if (prize === 'ZERO' || prize === 'Try Again') {
    showLosingPopup(); 
  } else {
    startCoinsFromSlice(landedIndex, () => {
      showPopup(prize, 'fireworks'); 
    });
  }
}, 5000);
});


function startCoinsFromSlice(landedIndex, callback) {
  clearCoins();
  const slice = wheel.querySelectorAll('.slice-text')[landedIndex];
  const rect = slice.getBoundingClientRect();

  const startX = rect.left + rect.width / 2 - 12; 
  const startY = rect.top + rect.height / 2 - 12;

  const coinsCount = 20;
  let emitted = 0;

  coinsInterval = setInterval(() => {
    if (emitted >= coinsCount) return;
    emitted++;

    const coin = document.createElement('div');
    coin.className = 'coin';
    coin.style.left = `${startX}px`;
    coin.style.top = `${startY}px`;
    coin.style.position = 'fixed';
    coin.style.zIndex = '9999'; 
    document.body.appendChild(coin);

    let posX = startX;
    let posY = startY;
    const velocityX = (Math.random() - 0.5) * 8;
    let velocityY = -Math.random() * 8 - 5;
    let rotation = 0;

    const anim = setInterval(() => {
      posX += velocityX;
      posY += velocityY;
      velocityY += 0.4; 
      rotation += 15;
      coin.style.transform = `translate(${posX - startX}px, ${posY - startY}px) rotate(${rotation}deg)`;

      if (posY > window.innerHeight + 50 || posX < -50 || posX > window.innerWidth + 50) {
        coin.remove();
        clearInterval(anim);
      }
    }, 16);

  }, 80);

  setTimeout(() => {
    clearCoins();
    if (callback) callback();
  }, coinsCount * 80 + 1500);
}

function clearCoins() {
  clearInterval(coinsInterval);
  document.querySelectorAll('.coin').forEach(c => c.remove());
}


function showPopup(prize, type = 'coins') {
  popupPrize.textContent = `You win ${prize}!`;
  popup.style.opacity = '1';
  popup.style.pointerEvents = 'auto';
  popup.style.transform = 'translate(-50%, -50%) scale(1)';
  mainContent.classList.add('blur');

  if (type === 'fireworks') startFireworks();
  else clearAnimations();
}

claimBtn.addEventListener('click', () => {
  popup.style.opacity = '0';
  popup.style.pointerEvents = 'none';
  popup.style.transform = 'translate(-50%, -50%) scale(0.8)';
  mainContent.classList.remove('blur');
  clearAnimations();
});

function showLosingPopup() {
  losingPopup.style.opacity = '1';
  losingPopup.style.pointerEvents = 'auto';
  losingPopup.style.transform = 'translate(-50%, -50%) scale(1)';
  mainContent.classList.add('blur');
}

closeLosingBtn.addEventListener('click', () => {
  losingPopup.style.opacity = '0';
  losingPopup.style.pointerEvents = 'none';
  losingPopup.style.transform = 'translate(-50%, -50%) scale(0.8)';
  mainContent.classList.remove('blur');
});

function startFireworks() {
    const canvas = fireworksCanvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    fireworks = [];
    fireworksAnimation = requestAnimationFrame(drawFireworks);

    const popupRect = popup.getBoundingClientRect();
    const offset = 150;

    const positions = [
        { x: popupRect.left + popupRect.width / 2, y: popupRect.top - offset },
        { x: popupRect.left + popupRect.width / 2, y: popupRect.bottom + offset },
        { x: popupRect.left - offset, y: popupRect.top + popupRect.height / 2 },
        { x: popupRect.right + offset, y: popupRect.top + popupRect.height / 2 }
    ];

    let count = 0;
    const fwInterval = setInterval(() => {
        const pos = positions[Math.floor(Math.random() * positions.length)];

        const firework = {
            x: pos.x,
            y: pos.y,
            particles: [],
            exploded: false
        };

        const particleCount = 60 + Math.floor(Math.random() * 30); 
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const speed = Math.random() * 8 + 5; 
            firework.particles.push({
                x: firework.x,
                y: firework.y,
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                gravity: 0.08 + Math.random() * 0.05,
                radius: Math.random() * 3 + 2, 
                alpha: 1,
                decay: 0.012 + Math.random() * 0.01, 
                color: `hsl(45, 100%, ${50 + Math.random() * 20}%)`
            });
        }

        fireworks.push(firework);
        count++;
        if (count > 25) clearInterval(fwInterval);
    }, 150);
}



function createFirework(width, height) {
  return {
    x: Math.random() * width,
    y: height,
    targetY: Math.random() * height / 2,
    radius: Math.random() * 3 + 2,
    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
    speedY: Math.random() * 4 + 4,
    exploded: false,
    particles: []
  };
}

function drawFireworks() {
    const ctx = fireworksCanvas.getContext('2d');
    ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    fireworks.forEach((fw, fIndex) => {
        fw.particles.forEach((p, pIndex) => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.speedY += p.gravity;
            p.alpha -= p.decay;

            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.shadowColor = 'gold';
            ctx.shadowBlur = 8; 
            ctx.fill();
        });

        fw.particles = fw.particles.filter(p => p.alpha > 0);
        if (fw.particles.length === 0) fireworks.splice(fIndex, 1);
    });

    ctx.globalAlpha = 1;
    fireworksAnimation = requestAnimationFrame(drawFireworks);
}




function clearAnimations() {
  clearCoins();
  cancelAnimationFrame(fireworksAnimation);
  fireworks = [];
  const ctx = fireworksCanvas.getContext('2d');
  ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
}


