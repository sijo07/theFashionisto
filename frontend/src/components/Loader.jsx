import React from 'react';

const Loader = () => {
  return (
    <div className="flex flex-col justify-center items-center w-full min-h-[50vh] p-10 bg-black/50 backdrop-blur-sm fixed inset-0 z-50">
      <div className="relative flex flex-col items-center">
        {/* Main Logo Text */}
        <h1 className="font-cinzel text-3xl md:text-5xl text-white tracking-[0.2em] font-light animate-pulse text-center">
          THE FASHIONISTO
        </h1>

        {/* Animated Accent Line */}
        <div className="h-[2px] bg-red-600 w-0 mt-4 animate-[width_1.5s_ease-in-out_infinite] self-center"
          style={{ animationName: 'growLine' }}
        />

        {/* Subtext */}
        <p className="mt-6 font-italiana text-zinc-500 text-sm tracking-[0.3em] uppercase animate-bounce delay-75">
          Curating Style
        </p>
      </div>

      <style>{`
        @keyframes growLine {
          0% { width: 0%; opacity: 0; }
          50% { width: 100px; opacity: 1; }
          100% { width: 0%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Loader;
