import * as React from "react";
import { Slider } from "./slider"; // Import your existing Slider component

interface ExponentialSliderProps {
  minValue: number;
  maxValue: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

/**
 * ExponentialSlider that doubles values at each step
 * e.g., 4000, 8000, 16000, 32000
 */
export const ExponentialSlider: React.FC<ExponentialSliderProps> = ({
  minValue,
  maxValue,
  value,
  onChange,
  className,
}) => {
  // Calculate how many steps we need (for powers of 2)
  const stepCount = Math.log2(maxValue / minValue);
  
  // Convert the actual value to a linear slider position (0 to stepCount)
  const valueToPosition = (val: number): number => {
    return Math.log2(val / minValue);
  };
  
  // Convert linear slider position back to exponential value
  const positionToValue = (pos: number): number => {
    return minValue * Math.pow(2, pos);
  };
  
  // Current position for the slider (linear scale)
  const position = valueToPosition(value);
  
  // Generate marks for the ticks
  const marks = React.useMemo(() => {
    const result: { value: number; label: string }[] = [];
    for (let i = 0; i <= stepCount; i++) {
      const val = minValue * Math.pow(2, i);
      result.push({
        value: i,
        label: val.toLocaleString(),
      });
    }
    return result;
  }, [minValue, stepCount]);

  return (
    <div className={className}>
      <Slider
        min={0}
        max={stepCount}
        step={1}
        value={[position]}
        onValueChange={([pos]) => {
          // Convert slider position back to exponential value
          const newValue = positionToValue(pos);
          onChange(newValue);
        }}
      />
      
      {/* Optional: Display tick marks */}
      <div className="flex justify-between mt-1 px-1 text-xs text-gray-500">
        {marks.map((mark) => (
          <div key={mark.value}>{mark.label}</div>
        ))}
      </div>
    </div>
  );
};