import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";

const distributeNoticeAtom = atomWithStorage(
  "ui:distributeNotice",
  true,
  undefined,
  { getOnInit: true }
);

export function useDistributeNotice() {
  const [distributeNotice, setDistributeNotice] = useAtom(distributeNoticeAtom);

  return {
    distributeNotice,
    setDistributeNotice,
  };
}
