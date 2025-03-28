import * as React from "react";

export function RetryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={40}
      height={40}
      fill="none"
      {...props}
    >
      <circle cx={20} cy={20} r={20} fill="#FFB110" />
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3.333}
        d="M27.64 16.667A8.335 8.335 0 0 0 11.667 20a8.333 8.333 0 0 0 15.973 3.333"
      />
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3.333}
        d="M28.333 10.833v5.834H22.5"
      />
    </svg>
  );
}
