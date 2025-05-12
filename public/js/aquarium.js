// public/js/aquarium.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';

let renderer, scene, camera, clock;

export function openAquarium() {
  const canvas = document.getElementById('aquarium-canvas');
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Lights
  scene.add(new THREE.AmbientLight(0x888888));
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(5, 5, 5);
  scene.add(dir);

  // Water Shader Plane
  const waterGeo = new THREE.PlaneGeometry(20, 10);
  const waterMat = new THREE.ShaderMaterial({
    uniforms: { u_time: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      precision mediump float;
      varying vec2 vUv;
      uniform float u_time;
      void main() {
        float wave = sin((vUv.x + u_time * 0.3) * 10.0) * 0.02;
        float intensity = 0.5 + wave;
        gl_FragColor = vec4(0.0, 0.2 + intensity, 0.5 + intensity, 1.0);
      }
    `,
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.set(0, 0, -5);
  scene.add(water);

  // Fish Particle System
  const count = 300;
  const posArr = new Float32Array(count * 3);
  const speedArr = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    posArr[i*3] = (Math.random() * 2 -1) * 8;
    posArr[i*3+1] = (Math.random() * 2 -1) * 4;
    posArr[i*3+2] = Math.random() * 2 - 1;
    speedArr[i] = Math.random() * 0.5 + 0.2;
  }
  const fishGeo = new THREE.BufferGeometry();
  fishGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
  fishGeo.setAttribute('speed', new THREE.BufferAttribute(speedArr, 1));

  const fishMat = new THREE.ShaderMaterial({
    uniforms: { u_time: { value: 0 } },
    vertexShader: `
      attribute float speed;
      uniform float u_time;
      void main() {
        vec3 p = position;
        p.x += sin(u_time * speed + position.y * 2.0) * 0.5;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = 4.0;
      }
    `,
    fragmentShader: `
      precision mediump float;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if(d > 0.5) discard;
        gl_FragColor = vec4(0.3, 0.8, 1.0, 1.0);
      }
    `,
    transparent: true,
  });

  const fishPoints = new THREE.Points(fishGeo, fishMat);
  scene.add(fishPoints);

  // Clock & Resize
  clock = new THREE.Clock();
  window.addEventListener('resize', onResize);

  // Start Loop
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  scene.traverse(obj => {
    if (obj.material && obj.material.uniforms && obj.material.uniforms.u_time)
      obj.material.uniforms.u_time.value = t;
  });
  renderer.render(scene, camera);
}

function onResize() {
  const canvas = renderer.domElement;
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}
