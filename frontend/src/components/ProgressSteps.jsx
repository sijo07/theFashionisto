const ProgressSteps = ({ step1, step2, step3, step4 }) => {
  return (
    <div className="flex items-center justify-center space-x-4">
      {/* Step 1: Bag */}
      <div className={`flex items-center ${step1 ? "text-red-500" : "text-zinc-600"}`}>
        <span className={`text-xs font-black uppercase tracking-widest ${step1 ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : ""}`}>01. Bag</span>
      </div>

      <div className={`h-[2px] w-8 md:w-12 ${step1 && step2 ? "bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-zinc-800"}`}></div>

      {/* Step 2: Address */}
      <div className={`flex items-center ${step2 ? "text-red-500" : "text-zinc-600"}`}>
        <span className={`text-xs font-black uppercase tracking-widest ${step2 ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : ""}`}>02. Address</span>
      </div>

      <div className={`h-[2px] w-8 md:w-12 ${step2 && step3 ? "bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-zinc-800"}`}></div>

      {/* Step 3: Payment */}
      <div className={`flex items-center ${step3 ? "text-red-500" : "text-zinc-600"}`}>
        <span className={`text-xs font-black uppercase tracking-widest ${step3 ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : ""}`}>03. Payment</span>
      </div>

      <div className={`h-[2px] w-8 md:w-12 ${step3 && step4 ? "bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-zinc-800"}`}></div>

      {/* Step 4: Confirm */}
      <div className={`flex items-center ${step4 ? "text-red-500" : "text-zinc-600"}`}>
        <span className={`text-xs font-black uppercase tracking-widest ${step4 ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : ""}`}>04. Confirm</span>
      </div>
    </div>
  );
};

export default ProgressSteps;
