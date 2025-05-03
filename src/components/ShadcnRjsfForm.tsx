"use client"

import React, { useState, ChangeEvent, FocusEvent } from "react"
import { v4 as uuidv4 } from "uuid"
import { withTheme } from "@rjsf/core"
import { 
  ariaDescribedByIds, 
  descriptionId, 
  getTemplate, 
  labelValue, 
  schemaRequiresTrueValue, 
  enumOptionsIsSelected, 
  enumOptionsSelectValue, 
  enumOptionsDeselectValue, 
  enumOptionsIndexForValue, 
  enumOptionsValueForIndex, 
  optionId 
} from "@rjsf/utils"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { FancyMultiSelect } from "@/components/ui/fancy-multi-select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { 
  Select, 
  SelectTrigger, 
  SelectContent, 
  SelectItem, 
  SelectValue, 
  SelectGroup 
} from "@/components/ui/select"

import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card"

import { ArrowUp, ArrowDown, Trash2 } from "lucide-react"



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

export const FieldTemplate = ({
  id,
  label,
  description,
  errors,
  help,
  required,
  hidden,
  children,
  onFocusPath,
}: any) => {
  if (hidden) return null;

  const path = id.replace(/^root_/, "").split("_");
  const handleFocus = () => onFocusPath?.(path);

  // Wrap everything in a single <div> that carries the id
  return (
    <div
      id={id}
      onFocusCapture={handleFocus}
      style={{ outline: "none" }}
    >
      {label && (
        <Label htmlFor={id} id={`${id}__title`} className="text-sm font-medium mb-1">
          {label} {required && "*"}
        </Label>
      )}

      {children}

      {description && (
        <p id={`${id}__description`} className="text-sm text-muted-foreground mt-1">
          <Description>{description}</Description>
        </p>
      )}
      {errors && errors.length > 0 && (
        <p id={`${id}__error`} className="text-sm text-red-500 mt-1">
          <ErrorMessage>{errors}</ErrorMessage>
        </p>
      )}
      {help && (
        <p id={`${id}__help`} className="text-sm text-muted-foreground mt-1">
          <Description>{help}</Description>
        </p>
      )}
    </div>
  );
};

/* DescriptionField */
const DescriptionField = ({ description }: any) =>
  description ? <Description>{description}</Description> : null

/* ObjectFieldTemplate - Wraps objects in a grid card */
const ObjectFieldTemplate = ({ title, description, properties,required }: any) => (
  <Card className=" pt-3 my-3 ">
    {(title || description) && (
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>  }
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



const SelectWidget = ({
  schema,
  id,
  options,
  required,
  disabled,
  readonly,
  value,
  multiple,
  autofocus,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  rawErrors = [],
}: any) => {
  const { enumOptions, enumDisabled, emptyValue: optEmptyValue } = options;
  
  const [selectedIndex, setSelectedIndex] = useState(
    enumOptionsIndexForValue(value, enumOptions, false) as unknown as string
  );

  return (
    <div className="my-3 relative">
      {!multiple ? (
        <Select 
          required={required}
          disabled={disabled}
          value={selectedIndex}
          onValueChange={(v: string) => {
            setSelectedIndex(v);
            onChange((enumOptions as any)[v].value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {(enumOptions as any).map(({ value: _value, label }: any, i: number) => {
                const disabledItem = 
                  Array.isArray(enumDisabled) && enumDisabled.indexOf(_value) !== -1;
                return (
                  <SelectItem
                    key={i}
                    id={label}
                    value={i.toString()}
                    disabled={disabledItem}
                  >
                    {label}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : (
        <FancyMultiSelect
          multiple
          items={enumOptions}
          selected={value}
          onValueChange={onChange}
        />
      )}
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


//checkbox widget

const CheckboxWidget=(props: any)=> {
  const {
    id,
    value,
    disabled,
    readonly,
    label,
    hideLabel,
    schema,
    autofocus,
    options,
    onChange,
    onBlur,
    onFocus,
    registry,
    uiSchema,
  } = props

  const required = schemaRequiresTrueValue(schema)
  const DescriptionFieldTemplate = getTemplate("DescriptionFieldTemplate", registry, options)

  const _onChange = ({target: {checked}}: FocusEvent<HTMLInputElement>) =>
    onChange(checked)
  const _onBlur = ({target: {checked}}: FocusEvent<HTMLInputElement>) =>
    onBlur(id, checked)
  const _onFocus = ({target: {checked}}: FocusEvent<HTMLInputElement>) =>
    onFocus(id, checked)

  const description = options.description || schema.description
  return (
    <div
      className={`relative mt-3 ${
        disabled || readonly ? "cursor-not-allowed opacity-50" : ""
      }`}
      aria-describedby={ariaDescribedByIds(id)}
    >
      {!hideLabel && !!description && (
        <DescriptionFieldTemplate
          id={descriptionId(id)}
          description={description}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
      <div className="flex items-center space-x-2">
        <Checkbox id={id}
                  name={id}
                  required={required}
                  disabled={disabled || readonly}
                  autoFocus={autofocus}
                  onCheckedChange={onChange}
                  defaultChecked={typeof value !== "undefined"}
        />
        <label
          htmlFor={id}
          className="form-checkbox text-primary"
        >
          {labelValue(label, hideLabel || !label)}
        </label>
      </div>
    </div>
  )
}


const RadioWidget=({
    id,
    options,
    value,
    required,
    disabled,
    readonly,
    onChange,
    onBlur,
    onFocus,
  }: any)=> {
  const {enumOptions, enumDisabled, emptyValue} = options

  const _onChange = (value: string) =>
    onChange(enumOptionsValueForIndex(value, enumOptions, emptyValue))
  const _onBlur = ({target: {value}}: FocusEvent<HTMLInputElement>) =>
    onBlur(id, enumOptionsValueForIndex(value, enumOptions, emptyValue))
  const _onFocus = ({target: {value}}: FocusEvent<HTMLInputElement>) =>
    onFocus(id, enumOptionsValueForIndex(value, enumOptions, emptyValue))

  const inline = Boolean(options && options.inline)

  return (
    <div className="mb-0 mt-3 relative">
      <RadioGroup defaultValue={value?.toString()} onValueChange={(e: string) => {
        console.log(e);
        _onChange(e);
      }} onBlur={_onBlur} onFocus={_onFocus}
                  aria-describedby={ariaDescribedByIds(id)} orientation={inline ? "horizontal" : "vertical"}>
        {Array.isArray(enumOptions) &&
          enumOptions.map((option, index) => {
            const itemDisabled =
              Array.isArray(enumDisabled) &&
              enumDisabled.indexOf(option.value) !== -1
            return (<div className="flex items-center space-x-2" key={optionId(id, index)}>
              <RadioGroupItem value={index.toString()} id={optionId(id, index)} disabled={itemDisabled}/>
              <Label>{option.label}</Label>
            </div>);
          })}
      </RadioGroup>

    </div>
  )
}

const CheckboxesWidget=({
      id,
      disabled,
      options,
      value,
      autofocus,
      readonly,
      required,
      onChange,
      onBlur,
      onFocus,
  }: any)=> {
    const {enumOptions, enumDisabled, inline, emptyValue} = options
    const checkboxesValues = Array.isArray(value) ? value : [value]

    const _onBlur = ({target: {value}}: FocusEvent<HTMLInputElement>) =>
        onBlur(id, enumOptionsValueForIndex(value, enumOptions, emptyValue))
    const _onFocus = ({target: {value}}: FocusEvent<HTMLInputElement>) =>
        onFocus(id, enumOptionsValueForIndex(value, enumOptions, emptyValue))

    return (
        <div className="space-y-4 mt-3 relative">
            {Array.isArray(enumOptions) &&
                enumOptions.map((option, index: number) => {
                    const checked = enumOptionsIsSelected(
                        option.value,
                        checkboxesValues,
                    )
                    const itemDisabled =
                        Array.isArray(enumDisabled) &&
                        enumDisabled.indexOf(option.value) !== -1

                    return (
                        <div className="flex items-center space-x-2" key={uuidv4()}>
                            <Checkbox id={id}
                                      name={id}
                                      required={required}
                                      disabled={disabled || itemDisabled || readonly}
                                      onCheckedChange={(state) => {
                                          if (state) {
                                              onChange(
                                                  enumOptionsSelectValue(index, checkboxesValues, enumOptions),
                                              )
                                          } else {
                                              onChange(
                                                  enumOptionsDeselectValue(index, checkboxesValues, enumOptions),
                                              )
                                          }
                                      }}
                                      defaultChecked={checked}
                                      autoFocus={autofocus && index === 0}
                                      aria-describedby={ariaDescribedByIds(id)}
                            />
                            <label
                                htmlFor={id}
                                className="form-checkbox text-primary"
                            >
                                {option.label}
                            </label>
                        </div>

                    )
                })}
        </div>
    )
}



/* Submit Button */
const SubmitButton = (
  {uiSchema, id}: any) => {
  const options = uiSchema["ui:options"]?.submitButtonOptions 
  console.log("options",options)
  
return(<>
{!options.norender && <>

  <Button type="submit" id="root_submitButtonOptions" disabled={options?.props?.disabled}  >
    {options.submitText || "Submit"} 
  </Button>

</>
}
 
  
  </>)}

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
    PasswordWidget,
    EmailWidget,
    URLWidget,
    RadioWidget,
    CheckboxesWidget,
    CheckboxWidget
 
  }
}

export default withTheme(Theme)


