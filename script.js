const wheel = document.getElementById('wheel');
const mainContent = document.getElementById('main-content');
const popup = document.getElementById('popup');
const popupPrize = document.getElementById('popup-prize');
const claimBtn = document.getElementById('claimBtn');
const demoSelect = document.querySelector('.demo-select');
const sliceCountSelect = document.getElementById('sliceCount');
const daysPanel = document.getElementById('days-panel');
const fireworksCanvas = document.getElementById('fireworks-canvas');
const losingPopup = document.getElementById('losing-popup');
const closeLosingBtn = document.getElementById('closeLosingBtn');
const dayIndicator = document.getElementById('day-indicator');
const daysTypeSelect = document.getElementById('daysType');

let currentRotation = 0;
let coinsInterval;
let fireworks = [];
let fireworksAnimation;
let currentDayIndex = 0;

const demos = {
  A: ['$1000', '€1000', '$500', '€500', 'ZERO', '€250', '$250', '€350', '$350', 'ZERO', '$700', '€700'],
  B: [
    '100% up to €500 + 200 Free Spins', '100% up to €250', '100% up to €350 + 100 Free Spins',
    '200% up to €300 + 40 Free Spins', '100% up to €500 Cashback', '100% up to €350 + 100 Free Spins',
    '100% up to €500 + 200 Free Spins', '100% up to €250', '100% up to €350 + 100 Free Spins',
    '200% up to €300 + 40 Free Spins', '100% up to €500 Cashback', '100% up to €350 + 100 Free Spins'
  ],
  C: [
    '/assets/brutalcasino.png', '/assets/alexandercasino.png', '/assets/logo.png',
    '/assets/fatboss.png', '/assets/casinoextra.png', '/assets/lucky31.png',
    '/assets/onlinebingo.png', '/assets/alexandercasino.png', '/assets/logo.png',
    '/assets/fatboss.png', '/assets/brutalcasino.png', '/assets/casinoextra.png'
  ]
};

const colors = ['#f37a58', '#ffd27f'];

function getSelectedSlices(sliceItems) {
  const selectedCount = parseInt(sliceCountSelect.value, 10);
  return sliceItems.slice(0, Math.min(selectedCount, sliceItems.length));
}

function generateWheel(sliceItems, colorsArr = colors, isImage = false) {
  const slicesCount = sliceItems.length;
  const degPerSlice = 360 / slicesCount;
  wheel.innerHTML = '';

  const wheelWrap = document.getElementById('wheel-wrap');
  let radius, imgSize, fontSize, maxWidth;

  if (window.innerWidth <= 768) {
    radius = wheelWrap.clientWidth / 2 * 0.65;
    imgSize = 25;
    fontSize = 8;
    maxWidth = "40px";
  } else {
    radius = 110;
    imgSize = 40;
  }

  for (let i = 0; i < slicesCount; i++) {
    const angle = i * degPerSlice + degPerSlice / 2;

    if (isImage) {
      const imgEl = document.createElement('img');
      imgEl.className = 'slice-image';
      imgEl.src = sliceItems[i];
      imgEl.style.width = (window.innerWidth <= 768 ? imgSize : 60) + 'px';
      imgEl.style.height = (window.innerWidth <= 768 ? imgSize : 60) + 'px';
      imgEl.style.objectFit = 'contain';
      imgEl.style.position = 'absolute';
      imgEl.style.top = '50%';
      imgEl.style.left = '50%';
      if (window.innerWidth <= 768) {
        imgEl.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-90deg)`;
      } else {
        imgEl.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-90deg)`;
      }
      wheel.appendChild(imgEl);
    } else {
      const textEl = document.createElement('div');
      textEl.className = 'slice-text';
      textEl.textContent = sliceItems[i];

      if (window.innerWidth <= 768) {
        textEl.style.fontSize = fontSize + 'px';
        textEl.style.maxWidth = maxWidth;
        textEl.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-90deg)`;
      } else {
        if (sliceItems[i].length > 25) textEl.style.fontSize = "11px";
        else if (sliceItems[i].length > 15) textEl.style.fontSize = "13px";
        else textEl.style.fontSize = "16px";
        textEl.style.maxWidth = "90px";
        textEl.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px) rotate(-90deg)`;
      }

      textEl.style.wordWrap = "break-word";
      textEl.style.color = '#2b0000';
      wheel.appendChild(textEl);
    }
  }

  let gradient = '';
  for (let i = 0; i < slicesCount; i++) {
    const color = colorsArr[i % colorsArr.length];
    gradient += `${color} ${i * degPerSlice}deg ${(i + 1) * degPerSlice}deg,`;
  }
  wheel.style.background = `conic-gradient(${gradient.slice(0, -1)})`;
}

function updateWheel() {
  const selectedDemo = demoSelect.value;
  const slices = selectedDemo === 'C' ? getSelectedSlices(demos.C) : getSelectedSlices(demos[selectedDemo]);
  const isImage = selectedDemo === 'C';
  generateWheel(slices, colors, isImage);

  if (daysTypeSelect.value === 'coins') {
    daysPanel.classList.add('hidden');
    dayIndicator.classList.add('hidden');
    document.getElementById('coins-panel').classList.remove('hidden');
  } else {
    daysPanel.classList.remove('hidden');
    dayIndicator.classList.remove('hidden');
    document.getElementById('coins-panel').classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  sliceCountSelect.value = '6';
  updateWheel();
  moveDayIndicator(currentDayIndex);
});

demoSelect.addEventListener('change', updateWheel);
sliceCountSelect.addEventListener('change', updateWheel);
daysTypeSelect.addEventListener('change', updateWheel);

document.getElementById('spinBtn').addEventListener('click', () => {
  const selectedDemo = demoSelect.value;
  const sliceItems = selectedDemo === 'C' ? getSelectedSlices(demos.C) : getSelectedSlices(demos[selectedDemo]);
  const slicesCount = sliceItems.length;
  const degPerSlice = 360 / slicesCount;
  const randomIndex = Math.floor(Math.random() * slicesCount);
  const offset = Math.random() * (degPerSlice - 2) + 1;
  const targetDeg = 360 * 5 + degPerSlice * randomIndex + offset;
  currentRotation += targetDeg;

  wheel.style.transition = 'transform 5s cubic-bezier(0.25, 1, 0.3, 1)';
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    const landedIndex = Math.floor(((360 - currentRotation % 360) % 360) / degPerSlice);
    const prize = sliceItems[landedIndex];
    const isImage = prize.endsWith('.png') || prize.endsWith('.jpg') || prize.endsWith('.jpeg') || prize.endsWith('.svg');

    if (!document.getElementById('coins-panel').classList.contains('hidden')) {
      disableNextCoin();
    }

    if (prize === 'ZERO' || prize === 'Try Again') {
      showLosingPopup();
      return;
    }

    startCoinsFromSlice(landedIndex, () => {
      if (isImage) {
        showPopup(`<img src="${prize}" style="width:60px;height:60px;object-fit:contain;">`, 'fireworks');
      } else {
        showPopup(prize, 'fireworks');
        if (demoSelect.value !== 'C') {
          currentDayIndex = (currentDayIndex + 1) % 7;
          moveDayIndicator(currentDayIndex);
        }
      }
    });
  }, 5000);
});


function startCoinsFromSlice(landedIndex, callback) {
  clearCoins();
  let slice = wheel.querySelectorAll('.slice-text')[landedIndex] || wheel.querySelectorAll('.slice-image')[landedIndex];
  if (!slice) { if (callback) callback(); return; }

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

// --- Popups ---
function showPopup(prize, type = 'coins') {
  popupPrize.innerHTML = '';
  const wrapper = document.createElement('span');
  wrapper.textContent = 'You win ';
  popupPrize.appendChild(wrapper);

  if (prize.startsWith('<img')) {
    const temp = document.createElement('div');
    temp.innerHTML = prize;
    popupPrize.appendChild(temp.firstChild);
  } else {
    const textNode = document.createTextNode(prize + '!');
    popupPrize.appendChild(textNode);
  }

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

function moveDayIndicator(dayIndex) {
  const dayItems = document.querySelectorAll('.day-item');
  const targetItem = dayItems[dayIndex];
  if (!targetItem) return;

  if (window.innerWidth <= 768) {
    const offset = targetItem.offsetLeft + targetItem.offsetWidth / 2 - dayIndicator.offsetWidth / 2;
    dayIndicator.style.transform = `translateX(${offset}px)`;
  } else {
    const offset = targetItem.offsetTop + targetItem.offsetHeight / 2 - dayIndicator.offsetHeight / 2;
    dayIndicator.style.transform = `translateY(${offset}px)`;
  }
}

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
    const firework = { x: pos.x, y: pos.y, particles: [] };
    const particleCount = 50 + Math.floor(Math.random() * 30);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const speed = Math.random() * 3 + 2;
      firework.particles.push({
        x: firework.x,
        y: firework.y,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        gravity: 0.03 + Math.random() * 0.02,
        radius: Math.random() * 3 + 2,
        alpha: 1,
        decay: 0.005 + Math.random() * 0.005,
        color: `hsl(45, 100%, ${50 + Math.random() * 20}%)`
      });
    }

    fireworks.push(firework);
    count++;
    if (count > 25) clearInterval(fwInterval);
  }, 200);
}

function drawFireworks() {
  const ctx = fireworksCanvas.getContext('2d');
  ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

  fireworks.forEach((fw, fIndex) => {
    fw.particles.forEach(p => {
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

function disableNextCoin() {
  const coins = document.querySelectorAll('#coins-panel .coin-item.active');
  if (coins.length > 0) {
    coins[0].classList.remove('active');
    coins[0].classList.add('disabled');
  }
}
