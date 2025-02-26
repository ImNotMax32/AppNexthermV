import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface PersistentTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const CompactTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
      const textarea = (ref as React.RefObject<HTMLTextAreaElement>)?.current || textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    useEffect(() => {
      adjustHeight();
    }, [props.value]);

    return (
      <Textarea
        ref={ref || textareaRef}
        className={`py-0.5 px-1.5 min-h-[1.75rem] text-xs border-[1px] resize-none overflow-hidden ${className}`}
        rows={1}
        onInput={adjustHeight}
        {...props}
      />
    );
  }
);

CompactTextarea.displayName = 'CompactTextarea';

export const PersistentTextarea = React.memo(({
  value,
  onChange,
  ...props
}: PersistentTextareaProps) => {
  const [localValue, setLocalValue] = useState<string>(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value.toString());
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <CompactTextarea
      {...props}
      value={localValue}
      onChange={handleChange}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        setLocalValue(value.toString());
      }}
    />
  );
});

PersistentTextarea.displayName = 'PersistentTextarea';