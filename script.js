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

/* ---------- 5. 交互逻辑 ---------- */

// 翻开
btnAsk.addEventListener('click', () => {
  if (state.current !== 's-idle') return; // 防重复点击

  goTo('s-flip');
  page.classList.add('flipping');

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
  goTo('s-idle');
});
