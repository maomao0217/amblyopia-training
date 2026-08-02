/**
 * 弱视训练条纹背景
 * - 黑白高对比度光栅条纹
 * - 支持垂直/水平滚动
 * - 速度、粗细、对比度可调
 */
class StripeBackground {
  constructor() {
    this.canvas = document.getElementById('stripe-bg');
    this.ctx = this.canvas.getContext('2d');
    this.offset = 0;
    this.speed = 0.8;
    this.stripeWidth = 30;
    this.contrast = 0.35;
    this.direction = 'vertical'; // 'vertical' | 'horizontal'
    this.color1 = '#000000';
    this.color2 = '#ffffff';
    this.running = true;
    this.timer = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  start() {
    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.timer) {
      cancelAnimationFrame(this.timer);
      this.timer = null;
    }
  }

  setIntensity(level) {
    // level: 1-5
    this.speed = 0.3 + level * 0.3;
    this.contrast = 0.15 + level * 0.08;
    this.stripeWidth = 40 - level * 4;
  }

  loop() {
    if (!this.running) return;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const sw = this.stripeWidth;

    // 半透明覆盖实现条纹
    ctx.clearRect(0, 0, w, h);

    if (this.direction === 'vertical') {
      // 垂直条纹水平滚动
      this.offset = (this.offset + this.speed) % (sw * 2);
      let x = -this.offset;
      while (x < w) {
        ctx.fillStyle = this.color1;
        ctx.fillRect(x, 0, sw, h);
        x += sw;
        ctx.fillStyle = this.color2;
        ctx.fillRect(x, 0, sw, h);
        x += sw;
      }
    } else {
      // 水平条纹垂直滚动
      this.offset = (this.offset + this.speed) % (sw * 2);
      let y = -this.offset;
      while (y < h) {
        ctx.fillStyle = this.color1;
        ctx.fillRect(0, y, w, sw);
        y += sw;
        ctx.fillStyle = this.color2;
        ctx.fillRect(0, y, w, sw);
        y += sw;
      }
    }

    // 降低整体不透明度
    ctx.fillStyle = `rgba(26, 26, 46, ${1 - this.contrast})`;
    ctx.fillRect(0, 0, w, h);

    this.timer = requestAnimationFrame(() => this.loop());
  }
}

// 全局实例
const stripeBg = new StripeBackground();
stripeBg.start();
