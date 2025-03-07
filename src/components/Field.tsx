import { FC, memo, useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { FieldProps } from '../types';

export const Field: FC<FieldProps> = memo(({ label, value, path, onFieldChange, fieldType, options = [] , placeholder }) => {
    const [localValue, setLocalValue] = useState(value || '');
    const debouncedChange = useDebouncedCallback(
      (newVal) => {
        onFieldChange(path, newVal);
      },
      300
    );
  
    useEffect(() => {
      setLocalValue(value || '');
    }, [value]);
  
    // Separate handlers for different input types
    const handleCheckboxChange = useCallback(
      (checked : boolean) => {
        setLocalValue(checked);
        debouncedChange(checked);
      },
      [debouncedChange]
    );
  
    const handleSelectChange = useCallback(
      (newValue : any) => {
        setLocalValue(newValue);
        debouncedChange(newValue);
      },
      [debouncedChange]
    );
  
    const handleInputChange = useCallback(
      (e:React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        debouncedChange(newValue);
      },
      [debouncedChange]
    );
  
    if (fieldType === 'select') {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{label}</Label>
          <Select value={localValue} onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    } else if (fieldType === 'checkbox') {
      return (
        <div className="flex items-center gap-3">
          <Checkbox 
            checked={!!localValue}
            onCheckedChange={handleCheckboxChange}
          />
          <Label className="text-sm font-medium">{label}</Label>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <Input
          value={localValue}
          onChange={handleInputChange}
          placeholder={placeholder || `Enter ${label}`}
        />
      </div>
    );
  });