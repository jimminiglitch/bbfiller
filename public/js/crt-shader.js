// public/js/crt-shader.js (ES module)
import { initShaderCanvas } from './utils.js';

const fragSrc = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float noise = fract(sin(dot(uv ,vec2(12.9898,78.233))) * 43758.5453);
  float scan = step(0.02, mod(gl_FragCoord.y + sin(u_time*10.0), 4.0));
  float flicker = 0.9 + 0.1 * sin(u_time*50.0);
  gl_FragColor = vec4(vec3(noise * scan * flicker), 1.0);
}`;

initShaderCanvas('crt-canvas', fragSrc);