import React from 'react';

export function Header() {
  return (
    <div className="flex justify-between items-center p-2.5">
      <button className="w-10 h-10 flex items-center justify-center text-[#00c48c] text-2xl">
        -
      </button>
      <span className="text-xl font-bold">Claudia</span>
      <button className="w-10 h-10 flex items-center justify-center text-[#00c48c] text-2xl">
        +
      </button>
    </div>
  );
}