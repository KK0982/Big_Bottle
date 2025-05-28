import { useBlacklist } from "@/app/hooks/use-blacklist";
import { BlackList } from "./BlackList";
import { Distribute } from "./Distribute";
import { useDistributeNotice } from "@/app/hooks/use-distribute-notice";

export function Notifications() {
  const { data: isBlacklisted } = useBlacklist();
  const { distributeNotice, setDistributeNotice } = useDistributeNotice();

  if (isBlacklisted) {
    return <BlackList />;
  }

  if (distributeNotice) {
    return (
      <Distribute
        onClose={() => {
          setDistributeNotice(false);
        }}
      />
    );
  }

  return null;
}
