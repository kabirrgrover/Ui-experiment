import { lazy, Suspense, useEffect } from "react";
import { usePath } from "./lib/router";
import { InkSparks } from "./components/fx/InkSparks";
import { AsciiLoader } from "./components/fx/AsciiLoader";

const TITLES: [string, string][] = [["/chat", "Chat"], ["/canvas", "Canvas"], ["/folders", "Folders"]];

const Street = lazy(() => import("./screens/street/StreetScreen"));
const Chat = lazy(() => import("./screens/chat/ChatScreen"));
const Canvas = lazy(() => import("./screens/canvas/CanvasScreen"));
const Folders = lazy(() => import("./screens/folders/FoldersScreen"));

export function App() {
  const path = usePath().split("?")[0];
  const Screen = path.startsWith("/chat") ? Chat : path.startsWith("/canvas") ? Canvas : path.startsWith("/folders") ? Folders : Street;
  useEffect(() => {
    const name = TITLES.find(([p]) => path.startsWith(p))?.[1] ?? "Spec Street";
    document.title = `${name} · AI Docbuilder`;
  }, [path]);
  return (
    <>
      <InkSparks />
      <Suspense fallback={<AsciiLoader />}>
        <Screen />
      </Suspense>
    </>
  );
}
