import { useState, useEffect } from 'react';
import { Input } from './input';
import { Textarea } from './textarea';
import { Label } from './label';
import { Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationRule {
  validate: (value: string) => string | null; // Returns error message or null
  message?: string;
}

interface FormFieldWithValidationProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  validation?: ValidationRule;
  type?: 'text' | 'email' | 'url' | 'password' | 'textarea';
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  rows?: number;
  disabled?: boolean;
  className?: string;
  showCharCount?: boolean;
  hint?: string;
}

export function FormFieldWithValidation({
  id,
  label,
  value,
  onChange,
  validation,
  type = 'text',
  placeholder,
  required = false,
  maxLength,
  rows = 4,
  disabled = false,
  className,
  showCharCount = false,
  hint,
}: FormFieldWithValidationProps) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  // Validate on value change (real-time)
  useEffect(() => {
    if (!touched || !validation) {
      setError(null);
      setIsValid(null);
      return;
    }

    const errorMessage = validation.validate(value);
    setError(errorMessage);
    setIsValid(errorMessage === null && value.length > 0);
  }, [value, validation, touched]);

  const handleBlur = () => {
    setTouched(true);
  };

  const InputComponent = type === 'textarea' ? Textarea : Input;

  const inputProps = {
    id,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    onBlur: handleBlur,
    placeholder,
    disabled,
    maxLength,
    required,
    className: cn(
      className,
      touched && error && 'border-destructive focus-visible:ring-destructive',
      touched && isValid && 'border-green-500 focus-visible:ring-green-500'
    ),
    ...(type === 'textarea' ? { rows } : { type }),
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {touched && (
          <div className="flex items-center gap-1">
            {isValid && (
              <Check className="h-4 w-4 text-green-500" aria-label="Valid input" />
            )}
            {error && (
              <X className="h-4 w-4 text-destructive" aria-label="Invalid input" />
            )}
          </div>
        )}
      </div>

      <div className="relative">
        <InputComponent {...inputProps} />
      </div>

      <div className="flex items-start justify-between gap-2 min-h-[20px]">
        <div className="flex-1">
          {touched && error && (
            <div className="flex items-start gap-1 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {!error && hint && (
            <p className="text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        
        {showCharCount && maxLength && (
          <p className={cn(
            "text-xs text-muted-foreground whitespace-nowrap",
            value.length >= maxLength && "text-destructive"
          )}>
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
