import { ReactNode } from "react";
import { Provider } from "jotai";

export function StorageProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}
