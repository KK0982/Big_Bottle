import * as React from "react";

export default function AddIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      fill="none"
      {...props}
    >
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M12 2a2 2 0 1 0-4 0v6H2a2 2 0 1 0 0 4h6v6a2 2 0 1 0 4 0v-6h6a2 2 0 1 0 0-4h-6V2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
