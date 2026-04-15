import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { IScript, visibleAsNumber } from "babylonjs-editor-tools";

export default class PlayerScript implements IScript {
    @visibleAsNumber("Speed", {
        min: 0,
        max: 20,
    })
    private _speed: number = 5;

    public mesh: Mesh | null = null;
    private _keys: Record<string, boolean> = {};

    private _onKeyDown = (e: KeyboardEvent) => {
        this._keys[e.key.toLowerCase()] = true;
    };

    private _onKeyUp = (e: KeyboardEvent) => {
        this._keys[e.key.toLowerCase()] = false;
    };

    public constructor(public owner: any) {}

    public onStart(): void {
        const scene = this.owner?.getScene ? this.owner.getScene() : (this.owner?.scene ? this.owner.scene : null);
        if (!scene) return;

        this.mesh = MeshBuilder.CreateCylinder("player", { height: 1.6, diameter: 0.6 }, scene);
        this.mesh.position = (this.owner?.position && this.owner.position.clone) ? this.owner.position.clone() : new Vector3(0, 0.8, 0);
        this.mesh.name = "player";
        this.mesh.checkCollisions = true;

        window.addEventListener("keydown", this._onKeyDown);
        window.addEventListener("keyup", this._onKeyUp);
    }

    public onUpdate(): void {
        if (!this.mesh) return;
        const scene = this.mesh.getScene();
        const delta = scene.getEngine().getDeltaTime() / 1000; // seconds

        const dir = new Vector3(0, 0, 0);
        if (this._keys["w"]) dir.z -= 1;
        if (this._keys["s"]) dir.z += 1;
        if (this._keys["a"]) dir.x -= 1;
        if (this._keys["d"]) dir.x += 1;

        if (dir.lengthSquared() > 0) {
            dir.normalize();
            const move = dir.scale(this._speed * delta);
            try {
                // Prefer collisions-aware movement when available
                (this.mesh as any).moveWithCollisions(move);
            } catch (e) {
                this.mesh.position.addInPlace(move);
            }
        }
    }

    public onStop(): void {
        if (this.mesh) {
            this.mesh.dispose();
            this.mesh = null;
        }
        window.removeEventListener("keydown", this._onKeyDown);
        window.removeEventListener("keyup", this._onKeyUp);
    }
}
