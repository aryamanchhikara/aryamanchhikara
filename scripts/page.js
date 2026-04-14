import { getSection } from "./data.js";

const mount = document.querySelector("#detail-page");
const pageSlug = document.body.dataset.page;
const section = getSection(pageSlug);

if (mount && section) {
  const isMusicPage = section.slug === "music";
  const entriesLabel =
    section.slug === "fashion"
      ? "Following Now"
      : section.slug === "music"
        ? "Artists On Repeat"
        : "Current Picks";
  const entriesClass =
    section.slug === "movies"
      ? "entry-grid entry-grid-movies"
      : section.slug === "music"
        ? "entry-grid entry-grid-music"
        : "entry-grid";
  const badgeData = section.spotify || section.letterboxd;
  const badgeVariantClass = section.spotify ? "social-badge social-badge-spotify" : "social-badge";

  const badgeMarkup = badgeData
    ? `
      <div class="${badgeVariantClass}">
        <div class="social-badge-icon" aria-hidden="true">
          ${
            section.spotify
              ? `
                <span class="spotify-ring"></span>
                <span class="spotify-wave spotify-wave-one"></span>
                <span class="spotify-wave spotify-wave-two"></span>
                <span class="spotify-wave spotify-wave-three"></span>
              `
              : `
                <span class="dot dot-green"></span>
                <span class="dot dot-orange"></span>
                <span class="dot dot-blue"></span>
              `
          }
        </div>
        <div>
          <p class="social-badge-label">${badgeData.label}</p>
          ${
            badgeData.url
              ? `<a class="social-badge-link" href="${badgeData.url}" target="_blank" rel="noreferrer">${badgeData.handle}</a>`
              : `<p class="social-badge-handle">${badgeData.handle}</p>`
          }
        </div>
      </div>
    `
    : "";

  const detailVisualMarkup = section.previewImage
    ? `
      <div class="detail-image detail-image-photo">
        <img src="${section.previewImage.replace("..", ".")}" alt="${section.title} page image." />
      </div>
    `
    : `
      <div class="detail-image detail-image-${section.palette}">
        <div class="detail-image-aura"></div>
        <div class="detail-image-frame"></div>
      </div>
    `;

  const entriesMarkup = section.entries?.length
    ? `
      <section class="detail-entries">
        <article class="detail-panel detail-panel-wide">
          <p class="section-label">${entriesLabel}</p>
          <div class="${entriesClass}">
            ${section.entries
              .map(
                (entry) => `
                  <article class="entry-card">
                    ${
                      entry.poster
                        ? `
                          <div class="entry-poster">
                            <img src="${entry.poster}" alt="${entry.name} poster" />
                          </div>
                        `
                        : ""
                    }
                    <p class="entry-type">${entry.type}</p>
                    <h3>${entry.name}</h3>
                    <p class="entry-note">${entry.note}</p>
                    ${
                      entry.link || entry.source
                        ? `<a class="entry-link" href="${entry.link || entry.source}" target="_blank" rel="noreferrer">${entry.poster ? "View source" : "Open link"}</a>`
                        : ""
                    }
                  </article>
                `
              )
              .join("")}
          </div>
        </article>
      </section>
    `
    : "";

  mount.innerHTML = `
    <section class="detail-hero detail-${section.accent}">
      <div class="detail-copy">
        <p class="eyebrow">${section.eyebrow}</p>
        <h1>${section.title}</h1>
        <p class="detail-text">${section.detail}</p>
        ${badgeMarkup}
        <a class="button button-solid" href="../index.html#preview-grid">Back to homepage peeks</a>
      </div>
      ${detailVisualMarkup}
    </section>

    ${
      isMusicPage
        ? ""
        : `
          <section class="detail-content">
            <article class="detail-panel">
              <p class="section-label">Why it belongs here</p>
              <p class="detail-quote">${section.quote}</p>
            </article>
          </section>
        `
    }
    ${entriesMarkup}
  `;

  if (isMusicPage) {
    initMusicScene();
  }
}

async function initMusicScene() {
  const mount = document.querySelector("#music-ascii-bg");

  if (!mount) {
    return;
  }

  const THREE = await import("https://unpkg.com/three@0.164.1/build/three.module.js");
  const { AsciiEffect } = await import("https://unpkg.com/three@0.164.1/examples/jsm/effects/AsciiEffect.js");
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x090807);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.z = 11;

  const effect = new AsciiEffect(renderer, " .:-+*=%@#", { invert: true, resolution: 0.18 });
  effect.domElement.className = "music-ascii-output";
  mount.replaceChildren(effect.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xb7aea0, 2.4, 30);
  pointLight.position.set(4, 5, 10);
  scene.add(pointLight);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(2.8, 0.045, 24, 220),
    new THREE.MeshStandardMaterial({ color: "#dcd3c6", emissive: "#8f877d", roughness: 0.38, metalness: 0.2 })
  );
  halo.rotation.x = 1.1;
  group.add(halo);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.06, 24, 160),
    new THREE.MeshStandardMaterial({ color: "#f3ead9", emissive: "#4c463f", roughness: 0.3, metalness: 0.18 })
  );
  ring.rotation.y = 0.7;
  group.add(ring);

  const waveformLines = [];
  const waveformPoints = [];
  for (let i = 0; i < 4; i += 1) {
    const points = [];
    for (let x = -4.5; x <= 4.5; x += 0.16) {
      points.push(new THREE.Vector3(x, 0, 0));
    }
    waveformPoints.push(points);
    const curveGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(
      curveGeometry,
      new THREE.LineBasicMaterial({
        color: i === 1 ? "#ffffff" : "#c2b8aa",
        transparent: true,
        opacity: i === 1 ? 0.95 : 0.42,
      })
    );
    line.position.y = 1.6 - i * 1.05;
    line.position.z = -1.2 + i * 0.4;
    group.add(line);
    waveformLines.push(line);
  }

  const pointsGeometry = new THREE.BufferGeometry();
  const count = 850;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const stride = i * 3;
    const angle = Math.random() * Math.PI * 2;
    const radius = 2.2 + Math.random() * 3.1;
    positions[stride] = Math.cos(angle) * radius;
    positions[stride + 1] = (Math.random() - 0.5) * 5.4;
    positions[stride + 2] = Math.sin(angle) * radius;
  }

  pointsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    pointsGeometry,
    new THREE.PointsMaterial({
      color: "#ece5d8",
      size: 0.03,
      transparent: true,
      opacity: 0.35,
    })
  );
  group.add(particles);

  const bars = [];
  for (let i = 0; i < 14; i += 1) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1 + Math.random() * 1.4, 0.1),
      new THREE.MeshStandardMaterial({
        color: i % 3 === 0 ? "#f1e7d6" : "#8b837a",
        emissive: i % 3 === 0 ? "#686157" : "#221e1b",
        roughness: 0.55,
        metalness: 0.12,
        transparent: true,
        opacity: 0.82,
      })
    );
    bar.position.x = -3.2 + i * 0.48;
    bar.position.y = -2.45;
    bar.position.z = 0.6;
    group.add(bar);
    bars.push(bar);
  }

  const resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height, false);
    effect.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const animate = () => {
    const scrollProgress = Math.min(window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1), 1);
    const time = performance.now() * 0.001;

    group.rotation.y = time * 0.08 + scrollProgress * 0.55;
    group.rotation.x = 0.14 + Math.sin(time * 0.45) * 0.08 + scrollProgress * 0.1;
    group.position.y = -0.6 + scrollProgress * 1.6;
    particles.rotation.y -= 0.0015;
    halo.rotation.z = time * 0.2;
    halo.scale.setScalar(1 + scrollProgress * 0.18);
    ring.rotation.x = time * 0.32;

    bars.forEach((bar, index) => {
      bar.scale.y = 0.75 + Math.sin(time * 2.4 + index * 0.42 + scrollProgress * 8) * 0.45 + 0.55;
    });

    waveformLines.forEach((line, lineIndex) => {
      const position = line.geometry.attributes.position;
      for (let i = 0; i < position.count; i += 1) {
        const x = position.getX(i);
        const y =
          Math.sin(x * 1.7 + time * (1.2 + lineIndex * 0.22) + scrollProgress * 7) * (0.12 + lineIndex * 0.07) +
          Math.cos(x * 0.55 + time * 0.8) * 0.06;
        position.setY(i, y);
      }
      position.needsUpdate = true;
      line.rotation.z = Math.sin(time * 0.2 + lineIndex) * 0.06;
    });

    effect.render(scene, camera);
    requestAnimationFrame(animate);
  };

  resize();
  window.addEventListener("resize", resize);
  animate();
}

