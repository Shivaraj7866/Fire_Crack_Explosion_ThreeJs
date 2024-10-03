import * as THREE from "three";
import Stats from "stats.js"; // Import stats.js
import Fireworks from "./Fireworks";
import CustomCamera from "./CustomCamera";

const stats = new Stats(); // Initialize stats.js

// Add stats.js panel for FPS
stats.showPanel(0); // 0 = FPS
document.body.appendChild(stats.domElement); // Add stats to DOM

// Texture loader and audio listener
const textureLoader = new THREE.TextureLoader();

/**
 * load all textures before adding to material
 */
const BASE_PATH = "./textures/particles";
const textureByPathName = [
    { img8: `${BASE_PATH}/8.png` },
];

// Function to load textures and return a Promise
function loadTextures(textureByPathName) {
    const texturePromises = textureByPathName.map((textureObj) => {
        const textureName = Object.keys(textureObj)[0];
        const texturePath = textureObj[textureName];

        return new Promise((resolve, reject) => {
            textureLoader.load(
                texturePath,
                (texture) => resolve({ [textureName]: texture }), // Resolve with texture
                undefined,
                (error) => reject(error) // Reject on error
            );
        });
    });

    return Promise.all(texturePromises);
}

// Call loadTextures and initialize scene after textures are loaded
loadTextures(textureByPathName)
    .then((loadedTextures) => {
        console.log("All textures loaded:", loadedTextures);

        // Store loaded textures in a dictionary
        const textures = loadedTextures.reduce((acc, texObj) => {
            return { ...acc, ...texObj };
        }, {});

        // Initialize Three.js scene after textures are loaded
        initScene(textures);
    })
    .catch((error) => {
        console.error("Error loading textures:", error);
    });

function initScene(textures) {
    const sizes = {
        x: window.innerWidth,
        y: window.innerHeight,
    };

    const canvas = document.querySelector("canvas.webgl");
    const scene = new THREE.Scene();

   // Create either Orthographic or Perspective camera
   const cameraType = "perspective"; // Change this to "orthographic" if needed
   let frustumSize = 5;
   const customCamera = new CustomCamera(cameraType, sizes,frustumSize);
   const camera = customCamera.getCamera();
   camera.position.set(0, 0, 5);
   scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(sizes.x, sizes.y);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    //------------------------------------------Debug Starts-------------------------------------------
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
    //------------------------------------------Debug Ends-------------------------------------------

    function onMouseClick() {
        fireworks.dispose();
    }

    window.addEventListener("click", onMouseClick);

    console.log("textures.img8: ", textures.img8);
    let fireworks = new Fireworks(scene, camera, textures.img8, { width: window.innerWidth, height: innerHeight });

    window.addEventListener("resize", () => {
        sizes.x = window.innerWidth;
        sizes.y = window.innerHeight;
        customCamera.updateSize(frustumSize)
        renderer.setSize(sizes.x, sizes.y);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    function animate() {
        stats.begin(); // Begin stats measurement
        fireworks.updateNow({ width: window.innerWidth, height: innerHeight });
        renderer.render(scene, camera);
        updateOverlay(); // Update draw calls and texture info
        stats.end(); // End stats measurement

        requestAnimationFrame(animate);
    }
    animate();
}
