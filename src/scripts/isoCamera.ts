import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { IScript, visibleAsNumber } from "babylonjs-editor-tools";

export default class IsoCameraScript implements IScript {
    @visibleAsNumber("Distance", { min: 1, max: 50 })
    private _distance: number = 12;

    @visibleAsNumber("Smoothing", { min: 0, max: 1 })
    private _smoothing: number = 0.08;

    private _camera: UniversalCamera | null = null;

    public constructor(public owner: any) {}

    public onStart(): void {
        const scene = this.owner?.getScene ? this.owner.getScene() : (this.owner?.scene ? this.owner.scene : null);
        if (!scene) return;

        this._camera = new UniversalCamera("isoCamera", new Vector3(0, this._distance * 0.6, -this._distance), scene);
        this._camera.rotation = new Vector3(-Math.PI / 6, Math.PI / 4, 0);
        this._camera.fov = 0.8;
        this._camera.minZ = 0.1;

        // Disable default inputs so the camera stays fixed in rotation
        try { this._camera.inputs.clear(); } catch (e) {}

        scene.activeCamera = this._camera;
    }

    public onUpdate(): void {
        if (!this._camera) return;
        const scene = this._camera.getScene();
        const target = scene.getMeshByName("player");
        if (!target) return;

        const yaw = Math.PI / 4; // 45deg
        const desired = new Vector3(
            target.position.x - this._distance * Math.cos(yaw),
            target.position.y + this._distance * 0.6,
            target.position.z - this._distance * Math.sin(yaw)
        );

        this._camera.position = Vector3.Lerp(this._camera.position, desired, this._smoothing);
        this._camera.setTarget(target.position);
    }

    public onStop(): void {
        if (this._camera) {
            try { this._camera.inputs.clear(); } catch (e) {}
        }
    }
}
