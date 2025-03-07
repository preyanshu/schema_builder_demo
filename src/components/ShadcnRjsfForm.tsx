"use client"
import React from "react"
import { withTheme } from "@rjsf/core"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { ChangeEvent, FocusEvent } from "react"

//
interface ErrorListProps {
  errors: {
    stack: string;
  }[];
}


/* Description & Error Message */
const Description = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground ">{children}</p>
)

const ErrorMessage = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-red-500 ">{children}</p>
)

/* FieldTemplate - Grid layout for form fields */
const FieldTemplate = ({
  id,
  label,
  help,
  required,
  description,
  errors,
  children,
  hidden
}: any) => {
  if (hidden) return null;
  return (
    <div >
      {label && (
        <Label htmlFor={id} className="text-sm font-medium  my-[10px] mr-3 ">
          {label} {required && "*"} 
        </Label>
      )}
      {children}
      {description && <div className="my-3 "><Description>{description}</Description></div>}
      {errors && errors.length > 0 && <ErrorMessage> {errors}</ErrorMessage>}
      {help && <div className="my-3 "><Description  >{help}</Description></div>}
    </div>
  )
}

/* DescriptionField */
const DescriptionField = ({ description }: any) =>
  description ? <Description>{description}</Description> : null

/* ObjectFieldTemplate - Wraps objects in a grid card */
const ObjectFieldTemplate = ({ title, description, properties }: any) => (
  <Card className="  my-3 ">
    {(title || description) && (
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
    )}
    <CardContent className="grid gap-4">{properties.map((prop: any) => prop.content)}</CardContent>
  </Card>
)

/* ArrayFieldTemplate - Displays arrays in a structured grid */
const ArrayFieldTemplate = ({ title, description, items, canAdd, onAddClick , options, uiSchema }: any) =>{ 
  

  const {
    addable = false ,
    orderable = false,
    removable = false
  } = uiSchema["ui:arrayOptions"] || uiSchema["ui:options"]?.["arrayOptions"] || {};


  return(


  <Card className=" my-3 ">
    {(title || description) && (
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
      </CardHeader>
    )}
   {items.length!==0 && <>

    <CardContent >
      {items.map((element: any) => (
        <Card key={element.index} className="shadow-sm">
          <CardContent className="pt-3">
            {element.children}
            <div className="flex gap-2 ">
            {element.hasMoveUp && (
  <Button
    size="sm"
    variant="outline"
    onClick={element.onReorderClick(element.index, element.index - 1)}
    disabled={!orderable}
  >
    <ArrowUp className="w-4 h-4" />
  </Button>
)}
{element.hasMoveDown && (
  <Button
    size="sm"
    variant="outline"
    onClick={element.onReorderClick(element.index, element.index + 1)}
    disabled={!orderable}
  >
    <ArrowDown className="w-4 h-4" />
  </Button>
)}
{element.hasRemove && (
  <Button
    size="sm"
    variant="destructive"
    onClick={element.onDropIndexClick(element.index)}
    disabled={!removable}
  >
    <Trash2 className="w-4 h-4" />
  </Button>
)}
            </div>
          </CardContent>
        </Card>
      ))}
    </CardContent>
   </>}
    {canAdd && (
      <CardFooter className="">
        <Button onClick={onAddClick} disabled={!addable}>Add Item</Button>
      </CardFooter>
    )}
  </Card>
)}

/* Text Field */
const TextWidget = ({
  id,
  required,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  disabled,
  readonly,
  autofocus,
  options,

}: any) => {

     const _onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
        onChange(value === "" ? options.emptyValue : value)

     const _onBlur = ({ target: { value } }: FocusEvent<HTMLInputElement>) =>
      onBlur(id, value)

    const _onFocus = ({ target: { value } }: FocusEvent<HTMLInputElement>) =>
      onFocus(id, value)
  




  return (
    <>
      <Input
        id={id}
        required={required}
        value={value}
        type={options.inputType || "text"}
        onChange={_onChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
        placeholder={placeholder}
        disabled={disabled || readonly}
        autoFocus={autofocus}
        className="my-3"
      />
    </>
  );
};



/* Textarea Widget */
const TextareaWidget = ({ id, required, value, onChange,onBlur,onFocus, placeholder, disabled, readonly, autofocus,uiSchema , options }: any) => {

const _onChange = ({ target: { value } }: ChangeEvent<HTMLTextAreaElement>) =>
    onChange(value === "" ? options.emptyValue : value)

 const _onBlur = ({ target: { value } }: ChangeEvent<HTMLTextAreaElement>) =>
  onBlur(id, value)

const _onFocus = ({ target: { value } }: ChangeEvent<HTMLTextAreaElement>) =>
  onFocus(id, value)
  
  return(<>



  <Textarea
    id={id}
    required={required}
    value={value}
    onChange={_onChange}
    onBlur={_onBlur}
    onFocus={_onFocus}
    placeholder={placeholder}
    disabled={disabled || readonly}
    rows={uiSchema['ui:rows']}
    autoFocus={autofocus}
  />
</>)}


/* Fixed Select Widget */
const SelectWidget = ({
  id,
  required,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  readonly,
  multiple,
}: any) => {
  // Normalize a value for comparison. For objects, use the "name" field.
  const normalizeValue = (val: any) => {
    if (typeof val === "object" && val !== null) {
      return val.name || val.value || "";
    }
    return val;
  };

  // SINGLE SELECT: Render a Select dropdown
  if (!multiple) {
    const normalizedValue = normalizeValue(value);
    const getLabel = (normVal: any) => {
      const found = options.enumOptions.find(
        (opt: any) => normalizeValue(opt.value) === normVal
      );
      return found
        ? found.label ||
            (typeof found.value === "object"
              ? found.value.name
              : found.value)
        : normVal;
    };

    return (
      <>
        <div className="relative">
        <Select
          value={normalizedValue}
          onValueChange={(val) => {
            const found = options.enumOptions.find(
              (opt: any) => normalizeValue(opt.value) === val
            );
            onChange(found ? found.value : val);
          }}
          disabled={disabled || readonly}
        >
          <SelectTrigger className="my-3">
            <SelectValue placeholder={placeholder||"Select"}>
            { getLabel(normalizeValue(value))
  }
        
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.enumOptions.map((option: any) => {
              const norm = normalizeValue(option.value);
              return (
                <SelectItem key={norm} value={norm}>
                  {option.label ||
                    (typeof option.value === "object"
                      ? option.value.name
                      : option.value)}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </>);
  }

  // MULTIPLE SELECT: Render a list of checkboxes
  else {
    const selectedNormalized = Array.isArray(value)
      ? value.map(normalizeValue)
      : [];

    const handleCheckboxChange = (norm: any, checked: boolean) => {
      let newSelected;
      if (checked) {
        newSelected = [...selectedNormalized, norm];
      } else {
        newSelected = selectedNormalized.filter((v) => v !== norm);
      }
      // Map normalized values back to their full option values.
      const newValues = newSelected.map((normVal: any) => {
        const found = options.enumOptions.find(
          (opt: any) => normalizeValue(opt.value) === normVal
        );
        return found ? found.value : normVal;
      });
      onChange(newValues);
    };

    return (
      <div className="space-y-2 relative">
        {options.enumOptions.map((option: any) => {
          const norm = normalizeValue(option.value);
          const checked = selectedNormalized.includes(norm);
          return (
            <div key={norm} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`${id}-${norm}`}
                disabled={disabled || readonly}
                checked={checked}
                onChange={(e) =>
                  handleCheckboxChange(norm, e.target.checked)
                }
              />
              <label htmlFor={`${id}-${norm}`}>
                {option.label ||
                  (typeof option.value === "object"
                    ? option.value.name
                    : option.value)}
              </label>
            </div>
          );
        })}
      </div>
    );
  }
};





/* Checkbox Widget */
const CheckboxWidget = ({
  id,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled,
  readonly,
  options
}: any) => {


const _onChange = ({ target: { value } }: ChangeEvent<HTMLButtonElement>) =>
    onChange(value === null || value === undefined ? options.emptyValue : value
    )

const _onBlur = ({ target: { value } }: ChangeEvent<HTMLButtonElement>) =>
  onBlur(id, value)

const _onFocus = ({ target: { value } }: ChangeEvent<HTMLButtonElement>) =>
  onFocus(id, value)

  return (
    <div className="flex items-center space-x-2 relative">
      <Checkbox
        id={id}
        checked={value}
        onChange={_onChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
        disabled={disabled || readonly}
      />
      <Label htmlFor={id}></Label>
    </div>
  );
};

const PasswordWidget = ({
  id,
  required,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  disabled,
  readonly,
  autofocus,
  options
}: any) => {

  const _onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
    onChange(value === "" ? options.emptyValue : value)

  const _onBlur = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
  onBlur(id, value)

  const _onFocus = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
  onFocus(id, value)

  return (
    <Input
      id={id}
      type="password"
      required={required}
      value={value}
      onChange={_onChange}
      onBlur={_onBlur}
      onFocus={_onFocus}
      placeholder={placeholder}
      disabled={disabled || readonly}
      autoFocus={autofocus}
      className="my-3"
    />
  );
};

  


  
/* Submit Button */
const SubmitButton = (
  {uiSchema}: any) => {
  const options = uiSchema["ui:options"]?.submitButtonOptions 
  
return(<>
{!options.norender && <>

  <Button type="submit"   >
    {options.submitText || "Submit"} 
  </Button>

</>
}
 
  
  </>)}

function ErrorListTemplate(props: ErrorListProps) {
  const { errors } = props;
  return (
    <div>
    
      <div className="p-4 border border-red-500 bg-red-100 text-red-700 rounded-md my-3">
      <ul>
        {errors.map(error => (
            <li key={error.stack}>
              {error.stack}
            </li>
          ))}
      </ul>
        </div>
      
    </div>
  );
}



/* Range Widget */
const RangeWidget = ({ id, value, onChange,onBlur,onFocus, schema, disabled, readonly, options }: any) => {

  const _onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
    onChange(value === null || value === undefined ? options.emptyValue : value
    )

  const _onBlur = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
  onBlur(id, value)

  const _onFocus = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
  onFocus(id, value)

  return (
    <div className="flex items-center gap-2 relative">
      <Input
        id={id}
        type="range"
        value={value}
        min={schema.min}
        max={schema.max}
        step={schema.step}
        onChange={_onChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
        disabled={disabled || readonly}
        className="flex-1"
      />
      <span className="text-sm w-16">{value}</span>
    </div>
  );
};

/* Email Widget */
const EmailWidget = ({ id, required, value, onChange,onBlur,onFocus ,placeholder, disabled, readonly, autofocus, options }: any) => {

  const _onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
    onChange(value === "" ? options.emptyValue : value)

  const _onBlur = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
  onBlur(id, value)

  const _onFocus = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
  onFocus(id, value)

  return (
    <Input
      id={id}
      type="email"
      required={required}
      value={value}
      onChange={_onChange}
      onBlur={_onBlur}
      onFocus={_onFocus}
      placeholder={placeholder}
      disabled={disabled || readonly}
      autoFocus={autofocus}
      className="my-3"
    />
  );
};

/* URL Widget */
const URLWidget = ({ id, required, value, onChange,onBlur,onFocus, placeholder, disabled, readonly, autofocus, options }: any) => {

  const _onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
    onChange(value === "" ? options.emptyValue : value)

  const _onBlur = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
  onBlur(id, value)

  const _onFocus = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
  onFocus(id, value)

  return (
    <Input
      id={id}
      type="url"
      required={required}
      value={value}
      onChange={_onChange}
      onBlur={_onBlur}
      onFocus={_onFocus}
      placeholder={placeholder}
      disabled={disabled || readonly}
      autoFocus={autofocus}
      className="my-3"
    />
  );
};




const NumberWidget = ({
  id,
  value,
  onChange,
  onBlur,
  onFocus,
  schema,
  disabled,
  readonly,
  placeholder,
  required,
  autofocus,
  options
}: any) => {

  const step = schema.multipleOf || 1;
  const min = schema.minimum;
  const max = schema.maximum;

  const _onChange = (value: any) =>
    onChange(value === null || value === undefined ? options.emptyValue : value
    )

  const _onBlur = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
  onBlur(id, value)

  const _onFocus = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
  onFocus(id, value)

  const handleIncrement = () => {
    if (value === "" || value === undefined || value === null) {
      onChange(min !== undefined ? min : 0);
    } else {
      const newValue = max !== undefined ? Math.min(max, value + step) : value + step;
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    if (value === "" || value === undefined || value === null) {
      onChange(min !== undefined ? min : 0);
    } else {
      const newValue = min !== undefined ? Math.max(min, value - step) : value - step;
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "") {
      _onChange("");
    } else {
      const numericValue = parseFloat(inputValue);
      if (!isNaN(numericValue)) {
        let newValue = numericValue;
        if (min !== undefined) newValue = Math.max(min, newValue);
        if (max !== undefined) newValue = Math.min(max, newValue);
        _onChange(newValue);
      }
    }
  };

  return (
    <div className="flex items-center gap-1 mt-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDecrement}
        disabled={disabled || readonly || (min !== undefined && value !== "" && value <= min)}
        className="h-9"
      >
        -
      </Button>

      <Input
        id={id}
        type="number"
        value={value}
        onChange={handleInputChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        required={required}
        disabled={disabled || readonly}
        autoFocus={autofocus}
        className="text-center w-24"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleIncrement}
        disabled={disabled || readonly || (max !== undefined && value !== "" && value >= max)}
        className="h-9"
      >
        +
      </Button>
    </div>
  );
};


const Theme = {
  templates: {
    FieldTemplate,
    DescriptionField,
    ObjectFieldTemplate,
    ArrayFieldTemplate,
    ErrorListTemplate,
    ButtonTemplates: {
      SubmitButton: SubmitButton,
    }
  },
  widgets: {
    TextWidget,
    TextareaWidget,
    SelectWidget,
    CheckboxWidget,
    PasswordWidget,
    // RangeWidget,
    EmailWidget,
    URLWidget,
    UpDownWidget: NumberWidget  
  }
}

export default withTheme(Theme)


