export type WidgetType = 
  'text' | 'textarea' | 'updown' | 'checkbox' | 'select' | 'radio' | 
  'date' | 'datetime-local' | 'hidden' | 'password' | 'RadioWidget' | 
  'CheckboxesWidget' | 'file' | 'range';

export type UpdateSchemaFn = (path: string[], value: any) => void;

export interface UISchemaEditorProps {
  uiSchema: any;
  onChange?: (schema: any) => void;
}

export interface FieldProps {
  label: string;
  value: any;
  path: string[];
  onFieldChange: UpdateSchemaFn;
  fieldType: 'text' | 'select' | 'checkbox';
  options?: string[];
  placeholder?: string;
}

export interface EmptyValueFieldProps {
  value: any;
  path: string[];
  onFieldChange: UpdateSchemaFn;
}

export interface SortableListProps {
  items: any[];
  onReorder: (newItems: any[]) => void;
}