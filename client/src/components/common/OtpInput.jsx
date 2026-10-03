import { useRef } from "react";

const OtpInput = ({ value = "", onChange, disabled = false }) => {
  const inputs = useRef([]);

  const values = Array.from({ length: 6 }, (_, index) => value[index] || "");

  const handleChange = (index, event) => {
    const digit = event.target.value.replace(/\D/g, "").slice(-1);
    const nextValues = [...values];

    nextValues[index] = digit;
    onChange(nextValues.join(""));

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !values[index] && index > 0) {
      const nextValues = [...values];

      nextValues[index - 1] = "";
      onChange(nextValues.join(""));
      inputs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedValue) return;

    onChange(pastedValue);

    const focusIndex = Math.min(pastedValue.length, 5);
    inputs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {values.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          aria-label={`Verification code digit ${index + 1}`}
          className={`h-12 w-10 rounded-xl border-2 text-center text-lg font-black outline-none transition sm:h-14 sm:w-11 sm:text-xl ${
            digit
              ? "border-violet-500 bg-violet-50 text-violet-800"
              : "border-slate-200 bg-slate-50 text-slate-900"
          } focus:border-violet-500 focus:bg-violet-50 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50`}
        />
      ))}
    </div>
  );
};

export default OtpInput;