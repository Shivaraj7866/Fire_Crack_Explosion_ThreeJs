import * as THREE from "three";
import SpriteExplosion from "./SpriteExplosion";

export default class SSFireworks {
  constructor(scene, camera, texture, size) {
    this.scene = scene;
    this.camera = camera;
    this.texture = texture;
    this.num = 0;
    this.size = size;

    this.spriteExplosions = [];
    this.mouse = new THREE.Vector3();

    this.intervalId = setInterval(this.fireAParticles, 1000);

    document.addEventListener("visibilitychange", (e) => {
      if (document.visibilityState === "hidden") {
        clearInterval(this.intervalId);
        this.intervalId = null;
      } else if (
        document.visibilityState === "visible" &&
        this.intervalId === null
      ) {
        // If the tab becomes visible and no interval is running, restart the interval
        this.intervalId = setInterval(this.fireAParticles, 1000);
      }
    });
  }

  dispose = () => {
    if (this.scene) {
      while (this.spriteExplosions.length > 0) {
        this.spriteExplosions[0].dispose();
        this.spriteExplosions.splice(0, 1);
      }

      this.explosionPattern = null;
      this.startPos = null;
      this.targetPos = null;
      this.scene = null;
      this.camera = null;

      clearInterval(this.intervalId);
      this.intervalId = 0;
    }
  };

  fireAParticles = () => {
    this.fireAParticle();
    this.fireAParticle();
  };

  fireAParticle = () => {
    const event1 = {
      clientX: -Math.random() * window.innerWidth * (Math.random() * 200 - 100),
      clientY: Math.random() * window.innerHeight * -60,
    };

    const event2 = {
      clientX: Math.random() * window.innerWidth,
      clientY: Math.random() * window.innerHeight * 0.6,
    };
    const event = this.camera.type === "OrthographicCamera" ? event1 : event2;

    const explosionTypes = ["circular", "spherical"];
    let explosionPattern =
      explosionTypes[Math.floor(Math.random() * explosionTypes.length)];

    const mouse = new THREE.Vector3(
      (event.clientX / this.size.width) * 2 - 1,
      -(event.clientY / this.size.height) * 2 + 1
    );

    mouse.unproject(this.camera);
    const dir = mouse.sub(this.camera.position).normalize();
    const distance = 8;
    const explosionPosition = this.camera.position
      .clone()
      .add(dir.multiplyScalar(distance));

    // Adjust the explosion position within the scene height limits (for orthographic camera)
    if (this.camera.type === "OrthographicCamera") {
      const frustumHeight = this.camera.top - this.camera.bottom;
      const halfFrustumHeight = frustumHeight / 2;

      // Clamp the y position of the explosion
      explosionPosition.y = THREE.MathUtils.clamp(
        explosionPosition.y,
        this.camera.position.y - halfFrustumHeight,
        this.camera.position.y + halfFrustumHeight
      );
    }

    const newSpriteExplosion = new SpriteExplosion(
      this,
      this.scene,
      this.camera,
      explosionPosition, // The position in world space
      explosionPattern,
      this.texture // Pass the loaded textures to SpriteExplosion
    );

    this.num += 1;
    newSpriteExplosion.name = "explosion_" + this.num;

    // Add the explosion to the array to manage it
    this.spriteExplosions.push(newSpriteExplosion);
  };

  removeParticle = (explosion) => {
    for (let i = 0; i < this.spriteExplosions.length; i++) {
      if (explosion.name === this.spriteExplosions[i].name) {
        this.spriteExplosions[i].dispose();
        this.spriteExplosions.splice(i, 1);
        break;
      }
    }
  };

  updateNow = (size) => {
    this.size = size;
    for (let spriteExplosion of this.spriteExplosions) {
      spriteExplosion.updateNow(size);
    }
  };

  clearAll = () => {
    while (this.spriteExplosions.length > 0) {
      this.spriteExplosions[0].dispose();
      this.spriteExplosions.splice(0, 1);
    }
  };
}

