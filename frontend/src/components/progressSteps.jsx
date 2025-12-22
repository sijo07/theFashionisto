const ProgressSteps = ({ step1, step2, step3 }) => {
  return (
    <div className="flex items-center justify-center space-x-8">
      {/* Step 1: Bag */}
      <div
        className={`flex flex-col items-center ${
          step1 ? "text-green-600" : "text-gray-400"
        }`}
      >
        <div
          className={`h-10 w-10 rounded-full border-4 ${
            step1 ? "border-green-600 bg-green-50" : "border-gray-400 bg-white"
          } flex items-center justify-center`}
        >
          {step1 && <span className="text-green-600">✅</span>}
        </div>
        <span
          className={`mt-2 text-sm font-semibold ${
            step1 ? "text-green-600" : "text-gray-400"
          }`}
        >
          Bag
        </span>
      </div>

      {/* Line between Step 1 and Step 2 */}
      {step1 && (
        <div
          className={`h-1 w-24 mb-5 ${step2 ? "bg-green-600" : "bg-gray-300"}`}
        ></div>
      )}

      {/* Step 2: Address */}
      <div
        className={`flex flex-col items-center ${
          step2 ? "text-green-600" : "text-gray-400"
        }`}
      >
        <div
          className={`h-10 w-10 rounded-full border-4 ${
            step2 ? "border-green-600 bg-green-50" : "border-gray-400 bg-white"
          } flex items-center justify-center`}
        >
          {step2 && <span className="text-green-600">✅</span>}
        </div>
        <span
          className={`mt-2 text-sm font-semibold ${
            step2 ? "text-green-600" : "text-gray-400"
          }`}
        >
          Address
        </span>
      </div>

      {/* Line between Step 2 and Step 3 */}
      {step1 && step2 && (
        <div
          className={`h-1 w-24 mb-5 ${step3 ? "bg-green-600" : "bg-gray-300"}`}
        ></div>
      )}

      {/* Step 3: Summary */}
      <div
        className={`flex flex-col items-center ${
          step3 ? "text-green-600" : "text-gray-400"
        }`}
      >
        <div
          className={`h-10 w-10 rounded-full border-4 ${
            step3 ? "border-green-600 bg-green-50" : "border-gray-400 bg-white"
          } flex items-center justify-center`}
        >
          {step3 && <span className="text-green-600">✅</span>}
        </div>
        <span
          className={`mt-2 text-sm font-semibold ${
            step3 ? "text-green-600" : "text-gray-400"
          }`}
        >
          Summary
        </span>
      </div>
    </div>
  );
};

export default ProgressSteps;
