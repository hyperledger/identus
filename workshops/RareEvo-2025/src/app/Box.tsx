import React from "react";


export const Box: React.FC<{ children: React.ReactNode | React.ReactNode[] }> = (props) => {
  return (
    <div
      className="w-full mt-3 md:mt-4 lg:mt-5 xl:mt-6 p-4 md:p-5 lg:p-6 xl:p-8 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
    >
      {props.children}
    </div>

  );
}
