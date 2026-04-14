
import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";
import { sections } from "./data.js";

const previewGrid = document.querySelector("#preview-grid");

if (previewGrid) {
  previewGrid.innerHTML = sections
    .map(
      (section) => `
        <article class="preview-card preview-${section.accent}">
          <a class="preview-link" href="./pages/${section.slug}.html">
            <div class="preview-meta">
              <p class="section-label">${section.eyebrow}</p>
              <h2>${section.title}</h2>
              <p class="preview-blurb">${section.blurb}</p>
            </div>
            <div class="preview-image preview-image-${section.palette}">
              ${
                section.previewImage
                  ? `<img src="${section.previewImage.replace("..", ".")}" alt="${section.title} preview image." />`
                  : `
                    <div class="preview-image-glow"></div>
                    <div class="preview-image-grid"></div>
                  `
              }
            </div>
            <ul class="preview-list">
              ${section.previewPoints.map((point) => `<li>${point}</li>`).join("")}
            </ul>
            <div class="preview-footer">
              <span>${section.quote}</span>
              <span class="preview-arrow">Open page</span>
            </div>
          </a>
        </article>
      `
    )
    .join("");
}

const canvas = document.querySelector("#scene");

if (canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 12;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const geometry = new THREE.BufferGeometry();
  const particleCount = 1800;
  const positions = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i += 1) {
    const stride = i * 3;
    positions[stride] = (Math.random() - 0.5) * 22;
    positions[stride + 1] = (Math.random() - 0.5) * 18;
    positions[stride + 2] = (Math.random() - 0.5) * 14;
    scales[i] = Math.random();
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("scale", new THREE.BufferAttribute(scales, 1));

  const material = new THREE.PointsMaterial({
    color: "#f4eee4",
    size: 0.045,
    transparent: true,
    opacity: 0.82,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  const driftPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 32, 32),
    new THREE.MeshBasicMaterial({
      color: "#502c22",
      transparent: true,
      opacity: 0.08,
    })
  );
  driftPlane.position.z = -4;
  scene.add(driftPlane);

  const clock = new THREE.Clock();

  function animate() {
    const elapsed = clock.getElapsedTime();
    particles.rotation.y = elapsed * 0.025;
    particles.rotation.x = Math.sin(elapsed * 0.15) * 0.08;
    driftPlane.rotation.z = elapsed * 0.03;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function handlePointerMove(event) {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = (event.clientY / window.innerHeight) * 2 - 1;
    particles.rotation.y += x * 0.0009;
    particles.rotation.x += y * 0.0005;
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("resize", handleResize);
  animate();
}
