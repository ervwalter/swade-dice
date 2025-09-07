import { createRoot } from "react-dom/client";
import { PopoverApp } from "./plugin/PopoverApp";

const root = createRoot(document.getElementById("root")!);
root.render(<PopoverApp />);