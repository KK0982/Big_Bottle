import { useEffect, useRef } from "react";

export function EthereumAvatar({
  address,
  size = 16,
}: {
  address: string;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (address && ref.current) {
      ref.current.innerHTML = "";

      const seed = parseInt(address.slice(2, 10), 16);

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const icon = require("@metamask/jazzicon")(size, seed);
      ref.current.appendChild(icon);
    }
  }, [address, size]);

  return (
    <div ref={ref} style={{ height: size, width: size, borderRadius: "50%" }} />
  );
}
