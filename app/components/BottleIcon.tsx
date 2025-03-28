import * as React from "react";

const BottleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={18}
    fill="none"
    {...props}
  >
    <path
      fill="#01E35C"
      d="M11.434 3.692c1.216 2.229 2.066 4.091 2.066 6.64V13.5c0 2.482-.565 3-3.273 3H7.773c-2.708 0-3.273-.518-3.273-3v-3.167c0-2.55.83-4.419 2.045-6.647"
    />
    <path
      fill="#01E35C"
      d="M12.273 2.625c0 .621-.55 1.125-1.227 1.125H6.955c-.678 0-1.228-.504-1.228-1.125S6.277 1.5 6.955 1.5h4.09c.678 0 1.228.504 1.228 1.125Z"
    />
  </svg>
);

export default BottleIcon;
