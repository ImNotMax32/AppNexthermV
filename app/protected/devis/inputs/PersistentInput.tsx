import React, { useState, useEffect } from 'react';
import { CompactInput } from './CompactInput';

interface PersistentInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PersistentInput = React.memo(({ 
  value, 
  onChange,
  ...props 
}: PersistentInputProps) => {
  const [localValue, setLocalValue] = useState<string | number>(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value);
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(e);
  };

  return (
    <CompactInput
      {...props}
      value={localValue}
      onChange={handleChange}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        setLocalValue(value);
      }}
    />
  );
});

PersistentInput.displayName = 'PersistentInput';