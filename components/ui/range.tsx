import React from "react";

export interface RangeSliderProps {
  id?: string;
  name?: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  className?: string;
  showValue?: boolean;
}

const RangeSlider = React.forwardRef<HTMLInputElement, RangeSliderProps>(
  (
    {
      id,
      name,
      min = 0,
      max = 100,
      step = 1,
      value,
      onChange,
      disabled = false,
      className = "",
      showValue = true,
    },
    ref
  ) => {
    // make sure value is clamped between min and max
    const safeValue = Math.max(min, Math.min(max, Number(value ?? min)));
    const pct = max === min ? 0 : ((safeValue - min) / (max - min)) * 100;

    return (
      <div className={`w-full ${className}`}>
        {name && <label htmlFor={id ?? name} className="sr-only">{name}</label>}

        <div className="relative h-8">
          {/* Track background (underneath) */}
          <div className="absolute inset-0 flex items-center pointer-events-none">
            <div className="h-2 w-full rounded-full bg-gray-200" />
          </div>

          {/* Filled progress (left -> right) */}
          <div
            aria-hidden
            className="absolute left-0 top-1/2 -translate-y-1/2 h-2 rounded-full transition-all duration-150 ease-linear"
            style={{
              width: `${pct}%`,
              background: disabled ? "#94a3b8" : "#3b82f6",
              zIndex: 0,
            }}
          />

          {/* The real input: must be on top (zIndex > 0) */}
          <input
            ref={ref}
            id={id ?? name}
            name={name}
            type="range"
            min={min}
            max={max}
            step={step}
            value={safeValue}
            disabled={disabled}
            onChange={(e) => onChange(Number(e.target.value))}
            className="relative w-full appearance-none bg-transparent m-0 p-0 h-8 cursor-pointer"
            style={{ zIndex: 1 }}
          />
        </div>

        {showValue && (
          <div className="mt-2 text-sm text-gray-700">
            {disabled ? "Disabled" : `${safeValue}`}
          </div>
        )}
      </div>
    );
  }
);

RangeSlider.displayName = "RangeSlider";
export default RangeSlider;
