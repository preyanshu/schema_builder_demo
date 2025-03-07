import { FC, memo, useEffect, useState } from 'react';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyValueFieldProps } from '../types';

export const EmptyValueField: FC<EmptyValueFieldProps> = memo(({ value, path, onFieldChange }) => {
    const [selectedType, setSelectedType] = useState('string');
    const [inputValue, setInputValue] = useState('');
  
    useEffect(() => {
        let newType = 'string';
        if (typeof value === 'boolean') newType = 'boolean';
        else if (typeof value === 'number') newType = 'number';
        else if (Array.isArray(value)) newType = 'array';
        else if (typeof value === 'object' && value !== null) newType = 'object';
    
        setSelectedType(newType);
    
        let newInputValue;
        if (newType === 'object' || newType === 'array') {
          try {
            newInputValue = JSON.stringify(value, null, 2);
          } catch {
            newInputValue = '';
          }
        } else {
          newInputValue = value !== undefined ? value.toString() : '';
        }
    
        setInputValue(newInputValue);
      }, [value]);
    
      const handleTypeChange = (newType: string) => {
        setSelectedType(newType);
        let defaultValue;
        switch (newType) {
          case 'boolean': defaultValue = false; break;
          case 'number': defaultValue = 0; break;
          case 'string': defaultValue = ''; break;
          case 'object': defaultValue = {}; break;
          case 'array': defaultValue = []; break;
          default: defaultValue = '';
        }
    
        let newInputValue = (newType === 'object' || newType === 'array')
          ? JSON.stringify(defaultValue, null, 2)
          : defaultValue.toString();
    
        setInputValue(newInputValue);
        onFieldChange(path, defaultValue);
      };
    
      const debouncedOnFieldChange = useDebouncedCallback((newValue: any) => {
        onFieldChange(path, newValue);
      }, 300);
    
      const handleValueChange = (newInputValue: any) => {
        setInputValue(newInputValue);
        let parsedValue;
        
        try {
          switch (selectedType) {
            case 'boolean': parsedValue = newInputValue === 'true'; break;
            case 'number': 
              parsedValue = parseFloat(newInputValue);
              if (isNaN(parsedValue)) parsedValue = 0;
              break;
            case 'string': parsedValue = newInputValue; break;
            case 'object':
            case 'array': parsedValue = JSON.parse(newInputValue); break;
            default: parsedValue = newInputValue;
          }
          debouncedOnFieldChange(parsedValue);
        } catch {
          // Invalid input, don't update schema
        }
      };
  
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Empty Value Type</Label>
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['string', 'number', 'boolean', 'object', 'array'].map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
  
        <div className="space-y-2">
          <Label className="text-sm font-medium">Empty Value</Label>
          {selectedType === 'boolean' ? (
            <Select value={inputValue} onValueChange={handleValueChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select boolean" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          ) : selectedType === 'number' ? (
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => handleValueChange(e.target.value)}
            />
          ) : selectedType === 'string' ? (
            <Input
              value={inputValue}
              onChange={(e) => handleValueChange(e.target.value)}
            />
          ) : (selectedType === 'object' || selectedType === 'array') ? (
            <textarea
              className="w-full h-32 font-mono text-sm p-2 border rounded bg-background"
              value={inputValue}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={`Enter ${selectedType} as JSON`}
            />
          ) : null}
        </div>
      </div>
    );
  });