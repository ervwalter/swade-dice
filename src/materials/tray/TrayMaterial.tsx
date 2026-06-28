import { useTexture } from "@react-three/drei";
import { ThreeElements } from "@react-three/fiber";

import albedo from "./albedo.jpg";
import orm from "./orm.jpg";
import normal from "./normal.jpg";
import { gltfTexture } from "../../helpers/gltfTexture";

export function TrayMaterial(
  props: ThreeElements["meshStandardMaterial"]
) {
  const [albedoMap, ormMap, normalMap] = useTexture(
    [albedo, orm, normal],
    (textures) => gltfTexture(textures, ["SRGB", "LINEAR", "LINEAR"])
  );
  return (
    <meshStandardMaterial
      map={albedoMap}
      aoMap={ormMap}
      roughnessMap={ormMap}
      metalness={0}
      roughness={0.88}
      normalMap={normalMap}
      {...props}
      {...({
        aoMapIntensity: 0.5,
        envMapIntensity: 0.35,
      } as Record<string, unknown>)}
    />
  );
}
