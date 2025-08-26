// Import texture files
import gemstoneAlbedo from './gemstone/albedo.jpg';
import gemstoneOrm from './gemstone/orm.jpg';
import gemstoneNormal from './gemstone/normal.jpg';
import nebulaAlbedo from './nebula/albedo.jpg';
import nebulaOrm from './nebula/orm.jpg';
import nebulaNormal from './nebula/normal.jpg';
import sunriseAlbedo from './sunrise/albedo.jpg';
import sunriseOrm from './sunrise/orm.jpg';
import sunriseNormal from './sunrise/normal.jpg';
import sunsetAlbedo from './sunset/albedo.jpg';
import sunsetOrm from './sunset/orm.jpg';
import sunsetNormal from './sunset/normal.jpg';
import walnutAlbedo from './walnut/albedo.jpg';
import walnutOrm from './walnut/orm.jpg';
import walnutNormal from './walnut/normal.jpg';
import ironAlbedo from './iron/albedo.jpg';
import ironOrm from './iron/orm.jpg';
import ironNormal from './iron/normal.jpg';
import galaxyAlbedo from './galaxy/albedo.jpg';
import galaxyOrm from './galaxy/orm.jpg';
import galaxyNormal from './galaxy/normal.jpg';

// Material configuration types
export type MaterialType = 'standard' | 'physical';

export interface StandardMaterialConfig {
  type: 'standard';
  metalness?: number;
}

export interface PhysicalMaterialConfig {
  type: 'physical';
  clearcoat?: number;
  clearcoatRoughness?: number;
}

export type MaterialConfig = StandardMaterialConfig | PhysicalMaterialConfig;

// Material configurations for each dice style
export const MATERIAL_CONFIGS: Record<string, MaterialConfig> = {
  GEMSTONE: { type: 'standard' },
  NEBULA: { type: 'standard' },
  SUNRISE: { type: 'standard' },
  SUNSET: { type: 'standard' },
  WALNUT: { type: 'standard' },
  IRON: { type: 'standard', metalness: 1 },
  GALAXY: { type: 'physical', clearcoat: 1, clearcoatRoughness: 0.3 },
};

// Texture paths for each material
export const MATERIAL_TEXTURES: Record<string, { albedo: string; orm: string; normal: string }> = {
  GEMSTONE: {
    albedo: gemstoneAlbedo,
    orm: gemstoneOrm,
    normal: gemstoneNormal,
  },
  NEBULA: {
    albedo: nebulaAlbedo,
    orm: nebulaOrm,
    normal: nebulaNormal,
  },
  SUNRISE: {
    albedo: sunriseAlbedo,
    orm: sunriseOrm,
    normal: sunriseNormal,
  },
  SUNSET: {
    albedo: sunsetAlbedo,
    orm: sunsetOrm,
    normal: sunsetNormal,
  },
  WALNUT: {
    albedo: walnutAlbedo,
    orm: walnutOrm,
    normal: walnutNormal,
  },
  IRON: {
    albedo: ironAlbedo,
    orm: ironOrm,
    normal: ironNormal,
  },
  GALAXY: {
    albedo: galaxyAlbedo,
    orm: galaxyOrm,
    normal: galaxyNormal,
  },
};