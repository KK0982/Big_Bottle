import * as React from "react";

export function SuccessIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      {...props}
    >
      <circle cx={20} cy={20} r={20} fill="#01E35C" />
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3.333}
        d="m12.5 20.833 5 5L28.333 15"
      />
    </svg>
  );
}
