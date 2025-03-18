import { FC, useState, useEffect, useCallback, memo } from 'react';
import { produce } from 'immer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UISchemaEditorProps } from '@/types';
import {Field} from '@/components/Field';
import {SortableList} from '@/components/SortableList';
import {EmptyValueField} from '@/components/EmptyValueField';
import { getNodeByPath } from '@/utils/pathHelpers';
import { allowedWidgetsMapping,widgetOptions} from '@/constants';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const UISchemaEditorForm: FC<UISchemaEditorProps> = ({ uiSchema, onChange }) => {
  const [localSchema, setLocalSchema] = useState<any>(uiSchema);

  useEffect(() => {
    setLocalSchema(uiSchema);
  }, [uiSchema]);

const updateSchema = useCallback((path:any, value:any) => {
  setLocalSchema((currentSchema:any) =>
    produce(currentSchema, (draft:any) => {
      let cur = draft;
      for (let i = 0; i < path.length; i++) {
        const seg = path[i];
        if (i === path.length - 1) {
          if (value === undefined) {
            delete cur[seg];
          } else {
            cur[seg] = value;
          }
        } else {
          if (cur[seg] === undefined) {
            cur[seg] = typeof path[i + 1] === 'number' ? [] : {};
          }
          cur = cur[seg];
        }
      }
    })
  );
}, []);

  const handleWidgetChange = useCallback(
    (fullPath: string[], newWidgetValue: string) => {
      updateSchema(fullPath, newWidgetValue);
      const parentPath = fullPath.slice(0, -1);
      const keysToRemove = [
        'ui:rows',
        'ui:autocomplete',
        'ui:accept',
        'ui:filePreview',
        'ui:inputType'
      ];
      keysToRemove.forEach((key) => {
        updateSchema([...parentPath, key], undefined);
      });
      if (newWidgetValue === 'textarea') {
        updateSchema([...parentPath, 'ui:rows'], 5);
        updateSchema([...parentPath, 'ui:autocomplete'], 'off');
      } else if (newWidgetValue === 'file') {
        updateSchema([...parentPath, 'ui:filePreview'], false);
        updateSchema([...parentPath, 'ui:accept'], '');
      }
      else if(newWidgetValue === 'text'){
        updateSchema([...parentPath, 'ui:inputType'], "");
      }
    },
    [updateSchema, localSchema]
  );

  useEffect(() => {
    if (onChange) onChange(localSchema);
  }, [localSchema, onChange]);

  const renderField = useCallback(
    (key: string, value: any, path: string[] = [], depth = 0) => {
      const fullPath = [...path, key];
      const fieldKey = fullPath.join('-');

      //check fieldType

      if(key == "ui:fieldType"){
        return null;
      }

      if (key === 'ui:emptyValue') {
        return (
          <EmptyValueField
            key={fieldKey}
            value={value}
            path={fullPath}
            onFieldChange={updateSchema}
          />
        );
      }

      if (['anyOf', 'allOf', 'oneOf'].includes(key)) {
        const typeLabels = {
          anyOf: 'Any Of',
          allOf: 'All Of',
          oneOf: 'One Of',
        };

        const typedKey = key as 'anyOf' | 'allOf' | 'oneOf';
        return (
          <Card className="ml-4 bg-muted/50 min-w-[250px]">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold">
              {typeLabels[typedKey]} Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.isArray(value) &&
                value.map((condition, index) => (
                  <div key={`${fieldKey}-cond-${index}-${depth}`} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium">
                        Condition {index + 1}
                      </span>
                    </div>
                    <div className="space-y-4 ml-4">
                      {typeof condition === 'object' &&
                        Object.entries(condition).map(([subKey, subValue]) =>
                          renderField(
                            subKey,
                            subValue,
                            [...fullPath, index.toString()],
                            depth + 1
                          )
                        )}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        );
      }

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const allKeys = Object.keys(value);
        let sortedKeys = allKeys;
        if (value.hasOwnProperty('ui:order') && Array.isArray(value['ui:order'])) {
          const order = value['ui:order'];
          const unorderedKeys = allKeys.filter(
            (k) => k !== 'ui:order' && !order.includes(k)
          );
          sortedKeys = [...order, ...unorderedKeys];
        }
  
        const basicKeys = ['ui:title', 'ui:description', 'ui:order'];
        const advancedKeys = sortedKeys.filter((subKey) => !basicKeys.includes(subKey));

        return (
          <Card className="ml-4 min-w-[250px]">
            <CardContent className="pt-4 space-y-4">
              <fieldset className="space-y-4" key={`${fieldKey}-cond-${depth}`}>
                <legend className="flex justify-between items-center text-sm font-medium mb-2 w-full">
                  <span>{key.replace(/^ui:/, '')}</span>
                  {value["ui:fieldType"] ? (
                    <Badge variant="secondary">{value["ui:fieldType"]}</Badge>
                  ) : value["ui:arrayOptions"] ? (
                    <Badge variant="secondary">Array</Badge>
                  ) : null}
                </legend>
  
                {/* Render basic fields */}
                {sortedKeys
                  .filter((subKey) => basicKeys.includes(subKey))
                  .map((subKey) => (
                    <div key={`${fieldKey}-basic-${subKey}`}>
                      {subKey === 'ui:order' ? (
                        <div className={`ml-${(depth + 1) * 4} mb-4`}>
                          <Label className="block text-sm font-medium mb-1">
                            Order
                          </Label>
                          <SortableList
                            items={value[subKey]}
                            onReorder={(newOrder) =>
                              updateSchema([...fullPath, subKey], newOrder)
                            }
                          />
                        </div>
                      ) : (
                        renderField(subKey, value[subKey], fullPath, depth + 1)
                      )}
                    </div>
                  ))}
  
                {/* Render Advanced Accordion if there are advanced keys */}
                {advancedKeys.length > 0 && (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="advanced">
                      <AccordionTrigger className="text-sm py-2">
                        Options
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 space-y-4">
                        {advancedKeys.map((subKey) => (
                          <div key={`${fieldKey}-advanced-${subKey}`}>
                            {renderField(subKey, value[subKey], fullPath, depth + 1)}
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </fieldset>
            </CardContent>
          </Card>
        );
      }

      if (Array.isArray(value)) {
        if (key === 'ui:order') {
          return (
            <div key={fieldKey} className={`ml-${depth * 4} space-y-2`}>
              <Label className="flex items-center gap-3 group">
                <span className="w-48 text-sm font-medium">
                  {key.replace(/^ui:/, '')}
                </span>
                <div className="flex-1">
                  <SortableList
                    items={value || []}
                    onReorder={(newOrder) =>
                      updateSchema(fullPath, newOrder)
                    }
                  />
                </div>
              </Label>
            </div>
          );
        }

       const isArrayOfObjects =
       value.length > 0 &&
       value.every((item) => typeof item === 'object' && item !== null && !Array.isArray(item));

     if (isArrayOfObjects) {
       return (
         <div key={fieldKey} className={`ml-${depth * 4} space-y-2`}>
           <Label className="block text-sm font-medium">
             {key.replace(/^ui:/, '')}
           </Label>
           <div className="flex flex-col gap-2">
             {value.map((item, index) => (
               <div key={`${fieldKey}-item-${index}-${depth}`} className="border p-2">
                 {Object.entries(item).map(([subKey, subValue]) =>
                   renderField(
                     subKey,
                     subValue,
                     [...fullPath, index.toString()],
                     depth + 1
                   )
                 )}
               </div>
             ))}
           </div>
         </div>
       );
     }
          return (
            <div key={fieldKey} className={`ml-${depth * 4} space-y-2`}>
              <Label className="block text-sm font-medium">
                {key.replace(/^ui:/, '')}
              </Label>
              <div className="flex flex-col gap-2">
                {value.map((item, index) => (
                  <Field
                    key={`${fieldKey}-${index}`}
                    label={`Item ${index + 1}`}
                    value={item}
                    path={[...fullPath, index.toString()]}
                    onFieldChange={updateSchema}
                    fieldType="text"
                  />
                ))}
              </div>
            </div>
          );
        
      }

      if (key === 'ui:widget') {

        type AllowedWidgetType = 'string' | 'number' | 'bool' | 'enum' | 'array' | 'oneOf' | 'anyOf' | 'allOf';

        const parentNode = getNodeByPath(localSchema, fullPath.slice(0, -1));
        const underlyingType =
          parentNode && parentNode['ui:fieldType']
            ? parentNode['ui:fieldType']
            : 'string';

        const allowed = allowedWidgetsMapping[underlyingType as AllowedWidgetType] || widgetOptions;

        return (
          <Field
            key={fieldKey}
            label={key.replace(/^ui:/, '')}
            value={value}
            path={fullPath}
            onFieldChange={handleWidgetChange}
            fieldType="select"
            options={allowed}
          />
        );
      }
 
      const derivedFieldType = typeof value === 'boolean' ? 'checkbox' : 'text';
      return (
        <Field
          key={fieldKey}
          label={key.replace(/^ui:/, '')}
          value={value}
          path={fullPath}
          onFieldChange={updateSchema}
          fieldType={derivedFieldType}
          options={(derivedFieldType as "text" | "checkbox" | "select") === "select" ? widgetOptions : []}
        />
      );
    },
    [updateSchema, localSchema, handleWidgetChange]
  );

  const sortedRootKeys = (
    localSchema.hasOwnProperty('ui:order') && Array.isArray(localSchema['ui:order'])
      ? [
          ...localSchema['ui:order'],
          ...Object.keys(localSchema).filter(
            (key) => key !== 'ui:order' && !localSchema['ui:order'].includes(key)
          ),
        ]
      : Object.keys(localSchema)
  ).filter(key => key !== 'ui:order');

  return (
    <Card className="min-w-[250px] mx-auto border-0">
      <CardHeader>
        <CardTitle className="text-xl">UI Schema Editor</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Configure your form UI schema with drag-and-drop ordering
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {localSchema.hasOwnProperty('ui:order') && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">Field Order</Label>
            <SortableList
              items={localSchema['ui:order']}
              onReorder={(newOrder) => updateSchema(['ui:order'], newOrder)}
            />
          </div>
        )}
  
        {sortedRootKeys.map((key, index) => (
          <Card key={`${key}-${index}`} className="bg-muted/50 min-w-[250px]">
            <CardContent className="pt-4 space-y-4">
              {renderField(key, localSchema[key], [], 0)}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default UISchemaEditorForm;