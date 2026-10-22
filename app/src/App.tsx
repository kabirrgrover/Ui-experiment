import { lazy, Suspense } from "react";
import { usePath } from "./lib/router";
import { InkSparks } from "./components/fx/InkSparks";

const Street = lazy(() => import("./screens/street/StreetScreen"));
const Chat = lazy(() => import("./screens/chat/ChatScreen"));
const Canvas = lazy(() => import("./screens/canvas/CanvasScreen"));
const Folders = lazy(() => import("./screens/folders/FoldersScreen"));

export function App() {
  const path = usePath().split("?")[0];
  const Screen = path.startsWith("/chat") ? Chat : path.startsWith("/canvas") ? Canvas : path.startsWith("/folders") ? Folders : Street;
  return (
    <>
      <InkSparks />
      <Suspense fallback={null}>
        <Screen />
      </Suspense>
    </>
  );
}
