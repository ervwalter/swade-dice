import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}']
  },
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        JSX: 'readonly'
      }
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  {
    plugins: {
      'react-hooks': pluginReactHooks,
      'react-refresh': pluginReactRefresh,
    },
    settings: {
      react: {
        version: '18.2',
      },
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      
      // React specific
      'react/prop-types': 'off',
      'react/no-unknown-property': ['error', { 
        ignore: [
          // Three.js/React Three Fiber props
          'args', 'attach', 'position', 'rotation', 'scale', 'material', 'geometry',
          'intensity', 'color', 'distance', 'decay', 'shadow', 'castShadow', 'receiveShadow',
          'transparent', 'opacity', 'roughness', 'metalness', 'map', 'normalMap', 
          'roughnessMap', 'metalnessMap', 'envMap', 'aoMap', 'emissive', 'emissiveMap',
          'displacementMap', 'alphaMap', 'lightMap', 'bumpMap', 'clearcoat', 'clearcoatMap',
          'clearcoatNormalMap', 'clearcoatRoughness', 'ior', 'reflectivity', 'sheen',
          'sheenColor', 'sheenRoughness', 'transmission', 'thickness', 'attenuationDistance',
          'attenuationColor', 'specularIntensity', 'specularColor',
          // Rapier physics props
          'type', 'colliders', 'gravityScale', 'lockRotations', 'lockTranslations',
          'mass', 'density', 'friction', 'restitution', 'sensor',
          // Common Three.js object props
          'visible', 'frustumCulled', 'renderOrder', 'layers', 'up', 'userData',
          'matrix', 'matrixAutoUpdate', 'matrixWorld', 'matrixWorldNeedsUpdate'
        ] 
      }],
      'react-refresh/only-export-components': 'warn',
      
      // TypeScript specific
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      
      // General
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  }
];