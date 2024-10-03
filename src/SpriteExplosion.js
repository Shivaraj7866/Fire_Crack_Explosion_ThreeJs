import * as THREE from "three";

export default class SpriteExplosion {
    constructor(callback, scene, camera, pos, explosionPattern, texture) {
        this.callback = callback;
        this.scene = scene;
        this.camera = camera;
        this.startPos = new THREE.Vector3();
        this.targetPos = new THREE.Vector3(0, 0.2, 0);
        this.sprite = null;
        this.particleSystem = null;
        this.velocities = null;
        this.isSpriteAnimationOver = false;
        this.particles = 250;
        this.explosionPattern = explosionPattern;
        this.explosionRadius = 0.6;
        this.particleOpacity = { opacity: 0.00001 };
        this.particleVelocityControl = { particleSpeed: 0.65 };
        this.animationStartTime = null;
        this.texture = texture;
        this.num = 0;

        this.particleGeometry = new THREE.BufferGeometry();

        this.sprites = [];
        this.particleSystems = [];

        this.originalFrustumSize = 10; // Reference frustum size for normalization

        // Initialize sprite and set positions
        this.initializeSpriteAnimation(pos);
    }

    dispose = () => {
        if (this.scene) {
            while (this.sprites.length > 0) {
                this.scene.remove(this.sprites[0]);
                this.sprites[0].geometry.dispose();
                this.sprites[0].material.dispose();
                this.sprites.splice(0, 1);
            }

            while (this.particleSystems.length > 0) {
                this.scene.remove(this.particleSystems[0]);
                this.particleSystems[0].geometry.dispose();
                this.particleSystems[0].material.dispose();
                this.particleSystems.splice(0, 1);
            }

            this.explosionPattern = null;
            this.startPos = null;
            this.targetPos = null;
            this.scene = null;
            this.camera = null;
        }
    };

    // Function to normalize based on current frustum size
    normalizeValue(value) {
        const currentFrustumSize = this.camera.top - this.camera.bottom;
        return value * (currentFrustumSize / this.originalFrustumSize);
    }

    initializeSpriteAnimation(pos) {
        this.startPos.set(pos.x, -4, pos.z);
        const spriteTexture = this.texture;
        const spriteMaterial = new THREE.SpriteMaterial({
            alphaMap: spriteTexture,
            transparent: true,
            depthWrite: false,
        });
        this.sprite = new THREE.Sprite(spriteMaterial);

        if (this.camera.type === "OrthoGraphicCamera") {
            // Normalize sprite size based on current frustum size
            const normalizedScaleX = this.normalizeValue(0.1);
            const normalizedScaleY = this.normalizeValue(0.1);
            this.sprite.scale.set(normalizedScaleX, normalizedScaleY, 0.5);
        } else if (this.camera.type === "PerspectiveCamera") {
            this.sprite.scale.set(0.3, 0.5, 0.5);
        }

        this.sprite.position.copy(this.startPos);
        this.scene.add(this.sprite);
        spriteMaterial.dispose();

        this.sprites.push(this.sprite);

        this.animationStartTime = performance.now();
        this.targetPos.copy(pos);
        this.isSpriteAnimationOver = false;
    }

    createParticles() {
        const positions = new Float32Array(this.particles * 3);
        const colors = new Float32Array(this.particles * 3);
        this.velocities = new Float32Array(this.particles * 3);

        for (let i = 0; i < this.particles; i++) {
            let x, y, z;

            switch (this.explosionPattern) {
                case "circular":
                    const angle = Math.random() * Math.PI * 2;
                    if (this.camera.type === "OrthoGraphicCamera") {
                        const radius = this.normalizeValue(this.explosionRadius * Math.sqrt(Math.random()) * 0.5);
                        x = radius * Math.cos(angle);
                        y = radius * Math.sin(angle);
                        z = (Math.random() - 0.5) * this.normalizeValue(this.explosionRadius) * 0.5;
                    } else {
                        const radius = this.explosionRadius * Math.sqrt(Math.random()) * 0.5;
                        x = radius * Math.cos(angle);
                        y = radius * Math.sin(angle);
                        z = (Math.random() - 0.5) * this.explosionRadius * 0.5;
                    }
                    break;
                case "spherical":
                    x = (Math.random() - 0.5) * 2;
                    y = (Math.random() - 0.5) * 2;
                    z = (Math.random() - 0.5) * 2;
                    const mag = Math.sqrt(x * x + y * y + z * z);

                    if (this.camera.type === "OrthoGraphicCamera") {
                        x = (x / mag) * Math.random() * this.normalizeValue(this.explosionRadius);
                        y = (y / mag) * Math.random() * this.normalizeValue(this.explosionRadius);
                        z = (z / mag) * Math.random() * this.normalizeValue(this.explosionRadius);
                    } else {
                        x = (x / mag) * Math.random() * this.explosionRadius;
                        y = (y / mag) * Math.random() * this.explosionRadius;
                        z = (z / mag) * Math.random() * this.explosionRadius;
                    }
                    break;
                default:
                    x = y = z = 0;
            }

            positions.set([this.targetPos.x, this.targetPos.y, this.targetPos.z], i * 3);
            this.velocities.set([x * 0.08, y * 0.08, z * 0.01], i * 3);
            colors.set([
                Math.min(Math.random() * 1.5, 1.0),
                Math.min(Math.random() * 1.5, 1.0),
                Math.min(Math.random() * 1.5, 1.0),
            ],
                i * 3);
        }

        this.particleGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3)
        );
        this.particleGeometry.setAttribute(
            "color",
            new THREE.BufferAttribute(colors, 3)
        );

        const particleMaterial = new THREE.PointsMaterial({
            size: this.camera.type === "OrthographicCamera" ? 14 : 0.3,
            sizeAttenuation: true,
            transparent: true,
            color: new THREE.Color(`hsl(${Math.random() * 100},100%,50%)`),
            opacity: 1,
            alphaMap: this.texture,
            depthWrite: false,
        });

        let particleSystem = new THREE.Points(
            this.particleGeometry,
            particleMaterial
        );
        this.num += 1;
        particleSystem.name = "particle_" + this.num;
        this.scene.add(particleSystem);
        this.particleSystems.push(particleSystem);
    }

    triggerExplosion() {
        this.createParticles();
    }

    updateNow(size) {
        let spriteTarget = this.targetPos
            ? this.targetPos
            : new THREE.Vector3(
                Math.random() * size.width * 0.8,
                size.height * 0.5 + Math.random() * size.height * 0.6,
                this.camera.type === "PerspectiveCamera" ? 2 : 0
            );
        if (this.sprite && this.animationStartTime !== null) {
            const elapsedTime = (performance.now() - this.animationStartTime) / 1000;
            if (elapsedTime < 1) {

                this.sprite.position.lerpVectors(
                    this.startPos,
                    spriteTarget,
                    elapsedTime
                );
                this.isSpriteAnimationOver = false;
                this.sprite.scale.set(0.2, 0.3, 0);
            } else {
                this.sprite.material.opacity = 0;
                this.sprite.position.copy(spriteTarget);
                this.animationStartTime = null;
                this.isSpriteAnimationOver = true;
                this.triggerExplosion();
            }
        }

        if (this.particleSystems.length > 0) {
            for (let i = 0; i < this.particleSystems.length; ++i) {
                let particleSystem = this.particleSystems[i];
                const positions = particleSystem.geometry.attributes.position.array;

                for (let i = 0; i < this.particles; i++) {
                    let index = i * 3;
                    positions[index] +=
                        this.velocities[index] * this.particleVelocityControl.particleSpeed;
                    positions[index + 1] +=
                        this.velocities[index + 1] *
                        this.particleVelocityControl.particleSpeed;
                    this.velocities[index + 1] -= 0.0005;
                    particleSystem.material.opacity -= this.particleOpacity.opacity;
                }

                if (particleSystem.material.opacity <= 0) {
                    this.scene.remove(particleSystem);
                    particleSystem.geometry.dispose();
                    particleSystem.material.dispose();
                    this.particleSystems.splice(i, 1);
                    i -= 1;
                    particleSystem = null;
                    this.callback.removeParticle(this);
                } else {
                    particleSystem.geometry.attributes.position.needsUpdate = true;
                }
            }
        }
    }
}
