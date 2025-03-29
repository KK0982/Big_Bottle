import * as React from "react";

export function ErrorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      {...props}
    >
      <circle cx={20} cy={20} r={20} fill="#FF4E59" />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M27.845 12.155c.651.65.651 1.706 0 2.357L14.512 27.845a1.667 1.667 0 1 1-2.357-2.357l13.333-13.333c.651-.651 1.706-.651 2.357 0Z"
        clipRule="evenodd"
      />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M27.845 27.845c-.65.651-1.706.651-2.357 0L12.155 14.512a1.667 1.667 0 0 1 2.357-2.357l13.333 13.333c.651.651.651 1.706 0 2.357Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
