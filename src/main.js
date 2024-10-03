import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.module.js";
import { SSFireworks } from "./SSFireworks.js";

// Function to load textures with promises
function loadTextures(textureUrls) {
  const loader = new THREE.TextureLoader();
  const promises = textureUrls.map((url) => {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  });
  return Promise.all(promises);
}

// Initialize the scene once all textures are loaded
function initScene(textures) {
    console.log("*******************textures loaded******************",textures)
  const scene = new THREE.Scene();
  let width = window.innerWidth;
  let height = window.innerHeight;

  const frustumSize = 20;
  const aspect = width / height;
  const camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    -1000,
    1000
  );
  camera.position.z = 1;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "100px";
  overlay.style.padding = "10px";
  overlay.style.color = "white";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  document.body.appendChild(overlay);

  function updateOverlay() {
    overlay.innerHTML = `
      <strong>Draw Calls:</strong> ${renderer.info.render.calls}<br>
      <strong>Frame:</strong> ${renderer.info.render.frame}<br>
      <strong>Textures:</strong> ${renderer.info.memory.textures}<br>
      <strong>Geometries:</strong> ${renderer.info.memory.geometries}
    `;
  }

  let clock = new THREE.Clock();
  let time = 0;
  let fireworks = new SSFireworks(scene, frustumSize, width, height,textures[0]);

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    time += delta;
    fireworks.updateNow(time);
    updateOverlay();
    renderer.render(scene, camera);
  }

  animate();

  // Handle window resize
  window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    const aspect = width / height;
    camera.left = (frustumSize * aspect) / -2;
    camera.right = (frustumSize * aspect) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    fireworks.updateForResize(width, height, frustumSize);
  }, false);
}

// Example usage: Load textures and then initialize the scene
const textureUrls = [
  './textures/particles/5.png',
  './textures/particles/8.png',
  './textures/particles/9.png',
  './textures/particles/11.png',
  // Add more texture URLs as needed
];

loadTextures(textureUrls)
  .then((textures) => {
    // Textures loaded, now initialize the scene
    initScene(textures);
  })
  .catch((error) => {
    console.error("Error loading textures:", error);
  });
