/**
 * Architecture-canvas scene definitions, fed to Excalidraw via
 * `convertToExcalidrawElements`. Scene keys are referenced from the project
 * frontmatter's `canvas` field.
 */

type SkeletonInput = Parameters<
  // Pulled from @excalidraw/excalidraw — imported lazily in the island.
  // Re-declared here as `any[]` to keep this file free of DOM-dependent types.
  (input: any[]) => any
>[0];

export const archScenes: Record<string, SkeletonInput> = {
  'mpc-3party': [
    {
      type: 'rectangle',
      x: 340,
      y: 40,
      width: 240,
      height: 90,
      strokeColor: '#98cbff',
      backgroundColor: '#0b1326',
      fillStyle: 'solid',
      roughness: 1,
      label: { text: 'Mobile  (P3)\nFlutter + KMP SDK' },
    },
    {
      type: 'rectangle',
      x: 60,
      y: 280,
      width: 240,
      height: 90,
      strokeColor: '#3cddc7',
      backgroundColor: '#0b1326',
      fillStyle: 'solid',
      roughness: 1,
      label: { text: 'Active Card  (P1)\nRust  on  Cortex-M' },
    },
    {
      type: 'rectangle',
      x: 620,
      y: 280,
      width: 240,
      height: 90,
      strokeColor: '#ffb6c1',
      backgroundColor: '#0b1326',
      fillStyle: 'solid',
      roughness: 1,
      label: { text: 'Cloud  (P2)\ngRPC  API' },
    },
    {
      type: 'arrow',
      x: 380,
      y: 140,
      width: 0,
      height: 130,
      strokeColor: '#98cbff',
      start: { id: 'rect-0' },
      end: { id: 'rect-1' },
      label: { text: 'BLE' },
    },
    {
      type: 'arrow',
      x: 540,
      y: 140,
      width: 0,
      height: 130,
      strokeColor: '#98cbff',
      start: { id: 'rect-0' },
      end: { id: 'rect-2' },
      label: { text: 'HTTPS' },
    },
    {
      type: 'text',
      x: 60,
      y: 410,
      text: 'presign / sign  (2-party over BLE)',
      fontSize: 14,
      strokeColor: '#7a8aa8',
    },
    {
      type: 'text',
      x: 620,
      y: 410,
      text: 'resharing / recovery  (TLS)',
      fontSize: 14,
      strokeColor: '#7a8aa8',
    },
    {
      type: 'rectangle',
      x: 340,
      y: 500,
      width: 240,
      height: 60,
      strokeColor: '#7a8aa8',
      backgroundColor: 'transparent',
      fillStyle: 'hachure',
      roughness: 2,
      label: { text: 'mpc-core  (shared Rust)' },
    },
    {
      type: 'arrow',
      x: 380,
      y: 140,
      width: 0,
      height: 360,
      strokeColor: '#7a8aa8',
      strokeStyle: 'dashed',
      start: { id: 'rect-0' },
      end: { id: 'rect-3' },
    },
    {
      type: 'arrow',
      x: 180,
      y: 370,
      width: 300,
      height: 130,
      strokeColor: '#7a8aa8',
      strokeStyle: 'dashed',
      start: { id: 'rect-1' },
      end: { id: 'rect-3' },
    },
  ],
};

export type SceneKey = keyof typeof archScenes;
