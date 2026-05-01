import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import {
  Excalidraw,
  exportToBlob,
  serializeAsJSON,
  type ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Eraser, FileJson, PencilRuler } from "lucide-react";
import { ToolMetricGrid, ToolPanel, ToolTagList, ToolWorkbench } from "./tool-workbench";

const STORAGE_KEY = "snaptools.ai.excalidraw.scene";

function downloadFile(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

const AiExcalidraw = () => {
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [elementCount, setElementCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const sceneNameRef = useRef(`snaptools-whiteboard-${new Date().toISOString().slice(0, 10)}`);
  const { theme } = useTheme();

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as Window & { EXCALIDRAW_ASSET_PATH?: string }).EXCALIDRAW_ASSET_PATH = "/excalidraw-assets/";
    }
  }, []);

  useEffect(() => {
    if (!api) return;

    const unsubscribe = api.onChange((elements, _appState, files) => {
      setElementCount(elements.filter((element) => !element.isDeleted).length);

      try {
        const serialized = serializeAsJSON({
          elements,
          appState: api.getAppState(),
          files,
        });
        window.localStorage.setItem(STORAGE_KEY, serialized);
      } catch {
        // Ignore storage errors so the board keeps working.
      }
    });

    return unsubscribe;
  }, [api]);

  const loadInitialScene = async () => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fall back to starter scene
    }

    return {
      appState: {
        viewBackgroundColor: "#f8fafc",
      },
    };
  };

  const exportPng = async () => {
    if (!api) return;
    setIsExporting(true);

    try {
      const blob = await exportToBlob({
        elements: api.getSceneElements(),
        appState: api.getAppState(),
        files: api.getFiles(),
        mimeType: "image/png",
      });
      downloadFile(`${sceneNameRef.current}.png`, blob);
      toast.success("PNG exported.");
    } catch {
      toast.error("PNG export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportJson = () => {
    if (!api) return;

    try {
      const serialized = serializeAsJSON({
        elements: api.getSceneElementsIncludingDeleted(),
        appState: api.getAppState(),
        files: api.getFiles(),
      });
      downloadFile(`${sceneNameRef.current}.excalidraw`, new Blob([serialized], { type: "application/json" }));
      toast.success("Scene JSON exported.");
    } catch {
      toast.error("Scene export failed.");
    }
  };

  const clearBoard = () => {
    if (!api) return;
    api.resetScene({ resetLoadingState: true });
    window.localStorage.removeItem(STORAGE_KEY);
    setElementCount(0);
    toast.success("Board cleared.");
  };

  return (
    <div className="space-y-6">
      <ToolWorkbench
        icon={PencilRuler}
        eyebrow="Excalidraw"
        title="Sketch ideas, flows, and rough diagrams right inside SnapTools."
        description="A fully embedded Excalidraw board for fast whiteboarding, system maps, UI flows, and visual notes. Scenes autosave locally in your browser."
        badges={["Official Excalidraw package", "Local autosave", "PNG and scene export"]}
        metrics={[
          { label: "Objects", value: elementCount, hint: "Live count of visible elements on the canvas." },
          { label: "Storage", value: "Local", hint: "Scene data stays in browser storage unless you export it." },
          { label: "License", value: "MIT", hint: "Embedded via the official Excalidraw package." },
        ]}
        aside={
          <ToolPanel title="Board actions" description="Keep the right side minimal and focused on the actions you actually need.">
            <div className="space-y-3">
              <Button onClick={exportPng} disabled={!api || isExporting} className="w-full rounded-2xl">
                <Download className="mr-2 h-4 w-4" />
                Export PNG
              </Button>
              <Button variant="outline" onClick={exportJson} disabled={!api} className="w-full rounded-2xl">
                <FileJson className="mr-2 h-4 w-4" />
                Export Scene
              </Button>
              <Button variant="outline" onClick={clearBoard} disabled={!api} className="w-full rounded-2xl">
                <Eraser className="mr-2 h-4 w-4" />
                Clear Board
              </Button>
            </div>
          </ToolPanel>
        }
      >
        <ToolPanel
          title="Whiteboard"
          description="The board uses the official Excalidraw React package with self-hosted assets and local autosave."
        >
          <div className="space-y-4">
            <div className="rounded-3xl border border-black/5 bg-white/70 p-4 text-xs leading-6 text-muted-foreground dark:border-white/10 dark:bg-white/[0.03]">
              Scenes autosave in this browser. Export `.png` for sharing or `.excalidraw` to move the board elsewhere.
            </div>
            <div className="h-[72vh] min-h-[620px] overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-inner dark:border-white/10">
              <Excalidraw
                excalidrawAPI={setApi}
                initialData={loadInitialScene}
                theme={theme === "dark" ? "dark" : "light"}
                name={sceneNameRef.current}
                UIOptions={{
                  canvasActions: {
                    saveAsImage: false,
                    export: false,
                    loadScene: true,
                    saveToActiveFile: false,
                    toggleTheme: true,
                    clearCanvas: false,
                  },
                }}
              />
            </div>
          </div>
        </ToolPanel>
      </ToolWorkbench>

      <ToolPanel
        title="Attribution"
        description="This tool embeds the official Excalidraw package rather than copying upstream source into SnapTools."
      >
        <ToolTagList tags={["Powered by Excalidraw", "Official package", "MIT licensed", "Self-hosted fonts"]} />
      </ToolPanel>
    </div>
  );
};

export default AiExcalidraw;
