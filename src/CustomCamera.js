import * as THREE from "three";
export default class CustomCamera {
    constructor(type, sizes, frustumSize) {
        this.sizes = sizes;
        this.type = type; // Either "orthographic" or "perspective"
        this.frustumSize = frustumSize;
        this.camera = this.createCamera(this.frustumSize);

    }
    createCamera(frustumSize) {
        const aspect = this.sizes.x / this.sizes.y;
        if (this.type === "orthographic") {
            return new THREE.OrthographicCamera(
                (frustumSize * aspect) / -2,
                (frustumSize * aspect) / 2,
                frustumSize / 2,
                frustumSize / -2,
                0.5,
                1000
            );
        } else if (this.type === "perspective") {
            return new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        }
    }

    updateSize(frustrumSize) {
        if (this.type === "orthographic") {
            const aspect = this.sizes.x / this.sizes.y;
            this.camera.left = (frustrumSize * aspect) / -2;
            this.camera.right = (frustrumSize * aspect) / 2;
            this.camera.top = frustrumSize / 2;
            this.camera.bottom = frustrumSize / -2;
        } else if (this.type === "perspective") {
            this.camera.aspect = this.sizes.x / this.sizes.y;
        }
        this.camera.updateProjectionMatrix();
    }

    getCamera() {
        return this.camera;
    }
}
