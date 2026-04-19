import { useEffect, useState } from 'react';
import { archScenes, type SceneKey } from '~/data/arch-scenes';

type Mod = {
  Excalidraw: React.ComponentType<any>;
  convertToExcalidrawElements: (input: any[]) => any[];
};

export default function ArchCanvas({ scene }: { scene: SceneKey }) {
  const [mod, setMod] = useState<Mod | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [lib] = await Promise.all([
        import('@excalidraw/excalidraw'),
        import('@excalidraw/excalidraw/index.css'),
      ]);
      if (!cancelled) {
        setMod({
          Excalidraw: lib.Excalidraw,
          convertToExcalidrawElements: lib.convertToExcalidrawElements,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!mod) {
    return (
      <div
        className="arch-canvas arch-canvas-skeleton"
        aria-label="Architecture canvas loading"
      />
    );
  }

  const input = archScenes[scene];
  if (!input) return null;
  const elements = mod.convertToExcalidrawElements(input);

  return (
    <div className="arch-canvas">
      <mod.Excalidraw
        initialData={{
          elements,
          appState: {
            viewBackgroundColor: 'transparent',
            theme: 'dark',
            zenModeEnabled: true,
            gridSize: null,
          },
          scrollToContent: true,
        }}
        viewModeEnabled
        zenModeEnabled
        gridModeEnabled={false}
        UIOptions={{
          canvasActions: {
            saveToActiveFile: false,
            loadScene: false,
            export: false,
            saveAsImage: false,
            toggleTheme: false,
            changeViewBackgroundColor: false,
            clearCanvas: false,
          },
          tools: { image: false },
        }}
      />
    </div>
  );
}
