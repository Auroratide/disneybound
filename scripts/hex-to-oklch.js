#!/usr/bin/env node
// Usage: node scripts/hex-to-oklch.js "#FF0000" "#3A5F8E" ...
// Prints oklch(l c h) for each hex color provided.

function hexToOklch(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const toLinear = (c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const [rl, gl, bl] = [toLinear(r), toLinear(g), toLinear(b)];

  const lms_l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const lms_m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const lms_s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;

  const l_ = Math.cbrt(lms_l);
  const m_ = Math.cbrt(lms_m);
  const s_ = Math.cbrt(lms_s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const C = Math.sqrt(a * a + bb * bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return {
    l: Math.round(L * 1000) / 1000,
    c: Math.round(C * 1000) / 1000,
    h: Math.round(H * 10) / 10,
  };
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/hex-to-oklch.js \"#FF0000\" \"#3A5F8E\" ...");
  process.exit(1);
}

for (const hex of args) {
  const { l, c, h } = hexToOklch(hex);
  console.log(`${hex}  =>  oklch(${l} ${c} ${h})`);
}
