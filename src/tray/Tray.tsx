import { TrayMesh } from "../meshes/TrayMesh";
import { ThreeElements } from "@react-three/fiber";
import { TrayMaterial } from "../materials/tray/TrayMaterial";

export function Tray(props: ThreeElements["group"]) {
  return (
    <TrayMesh {...props}>
      <TrayMaterial />
    </TrayMesh>
  );
}
