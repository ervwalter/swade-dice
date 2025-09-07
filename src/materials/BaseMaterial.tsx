import { useTexture } from "@react-three/drei";
import { gltfTexture } from "../helpers/gltfTexture";
import { MATERIAL_CONFIGS, MATERIAL_TEXTURES } from "./MaterialConfig";

interface BaseMaterialProps {
  materialKey: string;
  props?: Record<string, unknown>; // Material properties
}

export function BaseMaterial({ materialKey, props = {} }: BaseMaterialProps) {
  const config = MATERIAL_CONFIGS[materialKey];
  const textures = MATERIAL_TEXTURES[materialKey];
  
  if (!config || !textures) {
    throw Error(`Material ${materialKey} error: not implemented`);
  }

  const [albedoMap, ormMap, normalMap] = useTexture(
    [textures.albedo, textures.orm, textures.normal],
    (loadedTextures) => gltfTexture(loadedTextures, ["SRGB", "LINEAR", "LINEAR"])
  );

  const baseProps = {
    map: albedoMap,
    aoMap: ormMap,
    roughnessMap: ormMap,
    metalnessMap: ormMap,
    normalMap: normalMap,
    ...props,
  };

  if (config.type === 'physical') {
    return (
      <meshPhysicalMaterial
        {...baseProps}
        clearcoat={config.clearcoat}
        clearcoatRoughness={config.clearcoatRoughness}
      />
    );
  }

  // Standard material
  return (
    <meshStandardMaterial
      {...baseProps}
      metalness={config.metalness ?? 0}
    />
  );
}