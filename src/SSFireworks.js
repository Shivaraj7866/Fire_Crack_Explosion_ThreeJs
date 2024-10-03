import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.module.js";
import { SSFirework } from "./SSFirework.js";

export class SSFireworks {
  constructor(scene, frustumSize, width, height,textures) {
    this.textures = textures
    this.scene = scene;
    this.frustumSize = frustumSize;
    this.aspect = width / height;
    this.launchDuration = 1;
    this.fireworks = [];
    this.lastLaunchTime = 0;
    this.particleSize = 15;
    this.speed = this.frustumSize * 0.004
    this.colors = [
      { r: 1.0, g: 0, b: 0 },
      { r: 0, g: 1.0, b: 0 },
      { r: 0, g: 0, b: 1.0 },
    ];
  }

  updateNow(time) {
    if (time - this.lastLaunchTime >= this.launchDuration) {
      this.lastLaunchTime = Math.floor(time);

      const position = {
        x: (Math.random() - 0.5) * this.frustumSize * this.aspect, // Scale based on aspect ratio
        y: (Math.random() * this.frustumSize) / 2, // Scale based on frustum size
        z: 0,
      };
      const randomColor =
        this.colors[Math.floor(Math.random() * this.colors.length)];

      this.fireworks.push(
        new SSFirework(
          this.scene,
          position,
          time,
          this.particleSize,
          this.speed,
          randomColor,
          this.frustumSize,
          this.textures
        )
      );
    }

    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const alive = this.fireworks[i].updateNow(time);
      if (!alive) {
        this.fireworks[i].dispose();
        this.fireworks.splice(i, 1);
      }
    }
  }

  updateForResize = (width, height, frustumSize, time) => {
    this.frustumSize = frustumSize;
    this.aspect = width / height;
    this.particleSize = this.particleSize;
    this.speed = this.speed; // Ensure speed scales with the frustum size
    this.lastLaunchTime = this.lastLaunchTime;
    this.updateNow(time);
  };
}
