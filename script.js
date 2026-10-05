/* ============================================================
 * Answer Book — 逻辑
 * ============================================================ */

/* ---------- 1. 答案数据 ---------- */
const answers = [
  '是',
  '否',
  '也许',
  '再想想',
  '一定会',
  '不要',
  '顺其自然',
  '时机未到',
  '相信直觉',
  '答案在你心里',
  '勇敢一点',
  '再等等',
  '换个角度',
  '放手吧',
  '值得一试',
  '别回头',
  '听从内心',
  '现在不是时候',
  '会的',
  '不会',
];

/* ---------- 2. 随机引擎（CSPRNG + 拒绝采样） ---------- */
function secureRandomInt(n) {
  const buf = new Uint32Array(1);
  const max = 0x100000000; // 2^32
  const limit = Math.floor(max / n) * n;
  let x;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % n;
}

/* ---------- 3. 状态机 ---------- */
const state = { current: 's-idle' };

function goTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  state.current = screenId;
}

/* ---------- 4. DOM 引用 ---------- */
const btnAsk = document.getElementById('btn-ask');
const btnClose = document.getElementById('btn-close');
const answerText = document.getElementById('answer-text');
const page = document.getElementById('page');

const FLIP_DURATION = 1200; // 必须和 CSS transition 时长一致

/* ---------- 5. 音效（Web Audio 合成，零依赖零文件） ---------- */
let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// 一段衰减白噪声 → 纸页"沙沙"声
function noiseBurst(ctx, start, dur, freq, q, peak) {
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = freq;
  bp.Q.value = q;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(bp);
  bp.connect(gain);
  gain.connect(ctx.destination);
  src.start(start);
  src.stop(start + dur);
}

// 翻页：纸页掀起 + 落下 两段沙沙声
function playFlipSound() {
  const ctx = ensureAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  noiseBurst(ctx, now, 0.32, 1600, 0.9, 0.5);
  noiseBurst(ctx, now + 0.37, 0.28, 2300, 1.4, 0.3);
}

// 合上：低沉的落书声
function playCloseSound() {
  const ctx = ensureAudio();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(160, now);
  osc.frequency.exponentialRampToValueAtTime(55, now + 0.16);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.4, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.22);
}

/* ---------- 6. 交互逻辑 ---------- */

// 翻开
btnAsk.addEventListener('click', () => {
  if (state.current !== 's-idle') return; // 防重复点击

  goTo('s-flip');
  void page.offsetWidth; // 强制 reflow：先渲染"合拢的书"，transition 才有起点
  page.classList.add('flipping');
  playFlipSound();

  // 动画结束的最后一刻才取随机数
  setTimeout(() => {
    const idx = secureRandomInt(answers.length);
    answerText.textContent = answers[idx];
    page.classList.remove('flipping');
    goTo('s-answer');
  }, FLIP_DURATION);
});

// 合上
btnClose.addEventListener('click', () => {
  if (state.current !== 's-answer') return;
  playCloseSound();
  goTo('s-idle');
});
