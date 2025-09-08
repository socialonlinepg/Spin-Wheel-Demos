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
  B: ['🎰 Welcome', '🃏 Free Spin', 'Bonus 50$', 'Jackpot', 'Try Again', '100 Coins'],
  C: ['🎰', '🃏', '🤑', '💰', '🎲', '⭐']
};

const colors = ['#110b35', '#289d89'];

const dailyRewards = [
  ['$100', 'Free Spin', 'Jackpot'],
  ['€100', 'Bonus 50$', 'Try Again'],
  ['🎰', '🃏', '💰'],
  ['$50', 'Free Spin', 'Jackpot'],
  ['€50', 'Bonus 25$', 'Try Again'],
  ['🎲', '⭐', '💎'],
  ['$250', 'Free Spin', 'Bonus 100$']
];

function generateWheel(sliceTexts, colorsArr = colors) {
  const slicesCount = sliceTexts.length;
  const degPerSlice = 360 / slicesCount;
  wheel.innerHTML = '';
  const radius = 120;

  for (let i = 0; i < slicesCount; i++) {
    const textEl = document.createElement('div');
    textEl.className = 'slice-text';
    textEl.textContent = sliceTexts[i];
    const angle = i * degPerSlice + degPerSlice / 2;
    textEl.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-90deg)`;
    wheel.appendChild(textEl);
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
  generateWheel(demos[demoSelect.value]);
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
  const ctx = canvas.getContext('2d');

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

    const fw = {
      x: pos.x + (Math.random() - 0.5) * 50, 
      y: pos.y + (Math.random() - 0.5) * 50,
      radius: Math.random() * 3 + 2,
      color: 'gold',
      speedY: Math.random() * 4 + 4,
      exploded: false,
      particles: []
    };

    fw.targetY = fw.y - (Math.random() * 100 + 50);
    fireworks.push(fw);

    count++;
    if (count > 20) clearInterval(fwInterval);
  }, 200);
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

  fireworks.forEach((fw, index) => {
    if (!fw.exploded) {
      fw.y -= fw.speedY;
      ctx.beginPath();
      ctx.arc(fw.x, fw.y, fw.radius, 0, Math.PI * 2);
      ctx.fillStyle = fw.color;
      ctx.fill();

      if (fw.y <= fw.targetY) {
        fw.exploded = true;
        for (let i = 0; i < 25; i++) {
          fw.particles.push({
            x: fw.x,
            y: fw.y,
            radius: Math.random() * 2 + 1,
            color: 'gold',
            speedX: (Math.random() - 0.5) * 6,
            speedY: (Math.random() - 0.5) * 6,
            alpha: 1
          });
        }
      }
    } else {
      fw.particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha -= 0.03; 
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      fw.particles = fw.particles.filter(p => p.alpha > 0);
      if (fw.particles.length === 0) fireworks.splice(index, 1);
    }
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


