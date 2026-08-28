import React from "react";


export const Box: React.FC<{ children: React.ReactNode | React.ReactNode[] }> = (props) => {
  return (
    <div
      className="w-full mt-5 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
    >
      {props.children}
    </div>

  );
}
