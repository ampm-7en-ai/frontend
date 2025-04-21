
import React, { useState, useEffect } from "react";
import countryData from "./countryData";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
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

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedCountry.code}
        onValueChange={handleCountryChange}
        disabled={disabled}
      >
        <SelectTrigger className={`w-32 ${error ? "border-red-500" : ""}`}>
          <span className="flex">
            <span className="text-xl" style={{background:`url(${selectedCountry.flag}) no-repeat center center`,backgroundSize: 'contain',display:'inline-block',width:'20px',height:'20px'}}></span>
            <span className="text-sm">+{selectedCountry.dial_code.replace("+", "")}</span>
          </span>
        </SelectTrigger>
        <SelectContent>
          {countryData.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              <span className="flex items-center gap-2">
                <span style={{background:`url(${c.flag}) no-repeat center center`,backgroundSize: 'contain',display:'inline-block',width:'20px',height:'20px'}}></span>
                <span>{c.name}</span>
                <span className="ml-auto text-muted-foreground text-xs">+{c.dial_code.replace("+", "")}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
