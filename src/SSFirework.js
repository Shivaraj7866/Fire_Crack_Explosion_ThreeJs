import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.module.js";

export class SSFirework {
    constructor(scene, position, time, size, maxSpeed, color, frustumSize,textures) {
        this.scene = scene;
        this.particleCount = 300;
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.particleCount * 3);
        this.velocities = new Float32Array(this.particleCount * 3);
        this.colors = new Float32Array(this.particleCount * 3);
        this.launchTime = Math.floor(time);
        this.textures = textures

        // Define explosion patterns randomly
        this.explosionPattern = [
            "circular",
            "cone",
            "cube",
            "ring",
            "star",
        ][Math.floor(Math.random() * 5)];

        for (let i = 0; i < this.particleCount; i++) {
            this.positions[i * 3] = position.x;
            this.positions[i * 3 + 1] = position.y;
            this.positions[i * 3 + 2] = position.z;

            const speed = (maxSpeed / 2 + Math.random() * maxSpeed) ; // Apply velocity scale

            this.setVelocity(i, speed);
            this.setColor(i, color);
        }

        this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute("velocities", new THREE.BufferAttribute(this.velocities, 3));
        this.geometry.setAttribute("color", new THREE.BufferAttribute(this.colors, 3));

        this.material = new THREE.PointsMaterial({
            size: size,
            alphaMap: this.textures,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
        });

        this.particleSystem = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.particleSystem);
    }

    setVelocity(i, speed) {
        const angle = Math.random() * 2 * Math.PI; // Common angle for most patterns
        if (this.explosionPattern === "circular") {
            const phi = Math.acos(2 * Math.random() - 1);
            this.velocities[i * 3] = speed * Math.sin(phi) * Math.cos(angle);
            this.velocities[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(angle);
            this.velocities[i * 3 + 2] = speed * Math.cos(phi);
        } else if (this.explosionPattern === "cone") {
            const theta = (Math.random() * Math.PI) / 4;
            this.velocities[i * 3] = speed * Math.sin(theta) * Math.cos(angle);
            this.velocities[i * 3 + 1] = speed * Math.sin(theta) * Math.sin(angle);
            this.velocities[i * 3 + 2] = speed * Math.cos(theta);
        } else if (this.explosionPattern === "cube") {
            this.velocities[i * 3] = (Math.random() - 0.5) * speed;
            this.velocities[i * 3 + 1] = (Math.random() - 0.5) * speed;
            this.velocities[i * 3 + 2] = (Math.random() - 0.5) * speed;
        } else if (this.explosionPattern === "ring") {
            const height = (Math.random() - 0.5) * 0.5;
            this.velocities[i * 3] = Math.cos(angle) * speed;
            this.velocities[i * 3 + 1] = Math.sin(angle) * speed;
            this.velocities[i * 3 + 2] = height;
        } else if (this.explosionPattern === "star") {
            const starPoints = 7;
            const point = i % starPoints;
            const starAngle = (point * 2 * Math.PI) / starPoints + Math.random() * (Math.PI / starPoints);
            this.velocities[i * 3] = Math.cos(starAngle) * speed;
            this.velocities[i * 3 + 1] = Math.sin(starAngle) * speed;
            this.velocities[i * 3 + 2] = (Math.random() - 0.5) * speed;
        } 
    }

    setColor(i, baseColor) {
        // Randomize color if desired
        this.colors[i * 3] = baseColor.r * Math.random();
        this.colors[i * 3 + 1] = baseColor.g * Math.random();
        this.colors[i * 3 + 2] = baseColor.b * Math.random();
    }

    dispose = () => {
        this.geometry.dispose();
        this.material.dispose();
        if (this.particleSystem) {
            this.scene.remove(this.particleSystem);
            this.particleSystem = null;
        }
    };

    updateNow = (time) => {
        for (let i = 0; i < this.particleCount; i++) {
            this.positions[i * 3] += this.velocities[i * 3] * 0.5;
            this.positions[i * 3 + 1] += this.velocities[i * 3 + 1] * 0.5 
            // this.positions[i * 3 + 1] += this.velocities[i * 3 + 1] * 0.5 - 0.5 * 9.81 * (time - this.launchTime) * 0.5;
            this.positions[i * 3 + 2] += this.velocities[i * 3 + 2] * 0.5;
        }

        this.geometry.attributes.position.needsUpdate = true;

        this.material.opacity = Math.max(1 - (time - this.launchTime) / 5, 0);

        if (this.material.opacity <= 0) {
            this.scene.remove(this.particleSystem);
            this.particleSystem = null;
            return false;
        }

        return true;
    };
}
