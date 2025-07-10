
import React, { useState, useEffect } from "react";
import countryData from "./countryData";
import { ModernDropdown } from "@/components/ui/modern-dropdown";
import { ChevronDown } from "lucide-react";

interface Country {
  name: string;
  code: string;
  dial_code: string;
  flag: string;
}

interface CountryPhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  defaultCountryCode?: string;
  error?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const initialCountry = "US";

const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value,
  onChange,
  defaultCountryCode,
  error,
  placeholder,
  disabled,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countryData.find((c) => c.code === (defaultCountryCode || initialCountry)) || countryData[0]
  );
  const [localNumber, setLocalNumber] = useState<string>("");

  // When passed a full phone number like "+22997788842", try to parse out country code and number
  useEffect(() => {
    if (value && value.startsWith("+")) {
      const match = countryData.find(c => value.startsWith(c.dial_code));
      if (match) {
        setSelectedCountry(match);
        setLocalNumber(value.slice(match.dial_code.length));
      }
    } else {
      setLocalNumber(value || "");
    }
  // eslint-disable-next-line
  }, [value]);

  function handleCountryChange(code: string) {
    const country = countryData.find(c => c.code === code);
    if (country) {
      setSelectedCountry(country);
      onChange(country.dial_code + localNumber);
    }
  }

  function handleLocalNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const num = e.target.value.replace(/^0+/, ""); // remove leading zeros
    setLocalNumber(num);
    onChange(selectedCountry.dial_code + num);
  }

  // Convert country data to dropdown options
  const countryOptions = countryData.map(country => ({
    value: country.code,
    label: country.name,
    description: `+${country.dial_code.replace("+", "")}`,
  }));

  // Custom render for country options
  const renderCountryOption = (option: any) => (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <span style={{
          background: `url(${countryData.find(c => c.code === option.value)?.flag}) no-repeat center center`,
          backgroundSize: '100% 100%',
          display: 'inline-block',
          width: '20px',
          height: '15px'
        }}></span>
        <span>{option.label}</span>
      </div>
      <span className="text-muted-foreground text-xs">+{countryData.find(c => c.code === option.value)?.dial_code.replace("+", "")}</span>
    </div>
  );

  // Custom trigger for country dropdown
  const countryTrigger = (
    <div className={`flex items-center gap-2 px-3 py-2 h-10 rounded-md border bg-background text-sm ${error ? "border-red-500" : "border-input"} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} min-w-32`}>
      <span style={{
        background: `url(${selectedCountry.flag}) no-repeat center center`,
        backgroundSize: '100% 100%',
        display: 'inline-block',
        width: '20px',
        height: '20px'
      }}></span>
      <span className="text-sm">+{selectedCountry.dial_code.replace("+", "")}</span>
      <ChevronDown className="h-4 w-4 ml-auto opacity-50" />
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <ModernDropdown
        value={selectedCountry.code}
        onValueChange={handleCountryChange}
        options={countryOptions}
        trigger={countryTrigger}
        renderOption={renderCountryOption}
        disabled={disabled}
        className="w-auto"
      />
      <input
        type="tel"
        value={localNumber}
        onChange={handleLocalNumberChange}
        className={`flex-1 h-10 rounded-md border px-3 py-2 bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${error ? "border-red-500" : "border-input"}`}
        placeholder={placeholder || "Phone number"}
        disabled={disabled}
        maxLength={15}
        autoComplete="tel"
      />
    </div>
  );
};

export default CountryPhoneInput;
