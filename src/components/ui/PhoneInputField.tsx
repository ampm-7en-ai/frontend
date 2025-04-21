
import React from "react";
import PhoneInput from "react-phone-number-input/input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

interface PhoneInputFieldProps {
  value: string | undefined;
  onChange: (value: string) => void;
  onBlur: () => void;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
}

const PhoneInputField = React.forwardRef<HTMLInputElement, PhoneInputFieldProps>(
  ({ value, onChange, onBlur, disabled, error, placeholder }, ref) => (
    <PhoneInput
      international
      defaultCountry="US"
      countryCallingCodeEditable={true}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      className={cn(
        "flex h-10 w-full rounded-md border px-3 py-2 text-base bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        {
          "border-red-500": error,
          "border-input": !error,
        }
      )}
      placeholder={placeholder || "Your business phone number"}
      ref={ref}
    />
  )
);
PhoneInputField.displayName = "PhoneInputField";

export default PhoneInputField;
