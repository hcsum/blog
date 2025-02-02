declare module "troika-three-text" {
  import { Object3D } from "three";

  export class Text extends Object3D {
    text: string;
    fontSize: number;
    color: string;
    anchorX: string;
    anchorY: string;
    textAlign: string;
    maxWidth: number;
    overflowWrap: string;
    lineHeight: number;
    sync(): void;
  }
}
