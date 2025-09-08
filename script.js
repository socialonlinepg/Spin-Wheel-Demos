const wheel = document.getElementById('wheel');
const slicesCount = 6;
const colors = ['#110b35', '#289d89'];
const sliceTexts = ['Jackpot', 'Try Again', '50$', '100$', 'Free Spin', '250$'];

const popup = document.getElementById('popup');
const popupPrize = document.getElementById('popup-prize');
const claimBtn = document.getElementById('claimBtn');
const mainContent = document.getElementById('main-content');

let currentRotation = 0;

function generateWheel() {
  const degPerSlice = 360 / slicesCount;
  wheel.innerHTML = '';
  const radius = 120;

  for (let i = 0; i < slicesCount; i++) {
    const textEl = document.createElement('div');
    textEl.className = 'slice-text';
    textEl.textContent = sliceTexts[i];

    const angle = i * degPerSlice + degPerSlice / 2;

    textEl.style.transform = `
      translate(-50%, -50%)
      rotate(${angle}deg)
      translateY(-${radius}px)
      rotate(-90deg)
    `;
    textEl.style.transformOrigin = 'center center';

    wheel.appendChild(textEl);
  }

  let gradient = '';
  for (let i = 0; i < slicesCount; i++) {
    gradient += `${colors[i % 2]} ${i*degPerSlice}deg ${(i+1)*degPerSlice}deg,`;
  }
  wheel.style.background = `conic-gradient(${gradient.slice(0,-1)})`;
}

generateWheel();

claimBtn.addEventListener('click', () => {
  popup.style.opacity = '0';
  popup.style.pointerEvents = 'none';
  popup.style.transform = 'translate(-50%, -50%) scale(0.8)';
  mainContent.classList.remove('blur');
});

function showPopup(prize) {
  popupPrize.textContent = `You win ${prize}!`;
  popup.style.opacity = '1';
  popup.style.pointerEvents = 'auto';
  popup.style.transform = 'translate(-50%, -50%) scale(1)';

  mainContent.classList.add('blur');
}

claimBtn.addEventListener('click', () => {
  popup.style.opacity = '0';
  popup.style.pointerEvents = 'none';
  popup.style.transform = 'translate(-50%, -50%) scale(0.8)';

  mainContent.classList.remove('blur');
});

document.getElementById('spinBtn').addEventListener('click', () => {
  const degPerSlice = 360 / slicesCount;
  const randomIndex = Math.floor(Math.random() * slicesCount);
  const offset = Math.random() * (degPerSlice - 2) + 1;
  const targetDeg = 360 * 5 + degPerSlice * randomIndex + offset;

  currentRotation += targetDeg;
  wheel.style.transition = 'transform 5s cubic-bezier(0.25, 1, 0.3, 1)';
  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    const landedSliceIndex = Math.floor(((360 - currentRotation % 360) % 360) / degPerSlice);
    const prize = sliceTexts[landedSliceIndex];

    winkLandedSlice(4, 300, () => {
      showPopup(prize);
    });

  }, 5000); 
});

function winkLandedSlice(times = 4, intervalMs = 300, callback) {
  const degPerSlice = 360 / slicesCount;
  const normalizedRotation = currentRotation % 360;
  const landedSliceIndex = Math.floor(((360 - normalizedRotation) % 360) / degPerSlice);

  let blinkCount = 0;
  let dark = true;

  const blinkInterval = setInterval(() => {
    let gradient = '';
    for (let i = 0; i < slicesCount; i++) {
      let color = colors[i % 2];
      if (i === landedSliceIndex && dark) {
        color = shadeColor(color, -30);
      }
      gradient += `${color} ${i*degPerSlice}deg ${(i+1)*degPerSlice}deg,`;
    }
    wheel.style.background = `conic-gradient(${gradient.slice(0,-1)})`;

    dark = !dark;
    blinkCount++;

    if (blinkCount >= times * 2) {
      clearInterval(blinkInterval);
      let originalGradient = '';
      for (let i = 0; i < slicesCount; i++) {
        originalGradient += `${colors[i % 2]} ${i*degPerSlice}deg ${(i+1)*degPerSlice}deg,`;
      }
      wheel.style.background = `conic-gradient(${originalGradient.slice(0,-1)})`;

      if (callback) callback(); 
    }
  }, intervalMs);
}

function shadeColor(color, percent) {
  const f = parseInt(color.slice(1),16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent)/100;
  const R = f>>16;
  const G = f>>8&0x00FF;
  const B = f&0x0000FF;
  return '#' + (0x1000000 + (Math.round((t-R)*p)+R)*0x10000 + (Math.round((t-G)*p)+G)*0x100 + (Math.round((t-B)*p)+B)).toString(16).slice(1);
}