import { useRef, useState } from "react";

/**
 * Reusable 6-digit OTP input component
 * Props:
 *   value: string (6-char string)
 *   onChange: (val: string) => void
 *   disabled: boolean
 */
const OtpInput = ({ value = "", onChange, disabled = false }) => {
  const inputs = useRef([]);

  const vals = Array.from({ length: 6 }, (_, i) => value[i] || "");

  const handleChange = (index, e) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const newVals = [...vals];
    newVals[index] = char;
    onChange(newVals.join(""));
    if (char && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!vals[index] && index > 0) {
        const newVals = [...vals];
        newVals[index - 1] = "";
        onChange(newVals.join(""));
        inputs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted.padEnd(6, "").slice(0, 6));
      const focusIndex = Math.min(pasted.length, 5);
      inputs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {vals.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`
            w-11 h-13 text-center text-xl font-bold border-2 rounded-xl
            focus:outline-none transition-all
            ${digit
              ? "border-indigo-500 bg-indigo-50 text-indigo-800"
              : "border-gray-200 bg-gray-50 text-gray-800"
            }
            focus:border-indigo-500 focus:bg-indigo-50
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          style={{ width: "44px", height: "52px" }}
        />
      ))}
    </div>
  );
};

export default OtpInput;