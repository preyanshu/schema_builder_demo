import { FC, useState, useEffect, useCallback, memo } from 'react';
import { produce } from 'immer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UISchemaEditorProps } from '@/types';
import { Field } from '@/components/Field';
import { SortableList } from '@/components/SortableList';
import { EmptyValueField } from '@/components/EmptyValueField';
import { getNodeByPath } from '@/utils/pathHelpers';
import { allowedWidgetsMapping, widgetOptions } from '@/constants';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import { boolean, late } from 'zod';

const UISchemaEditorForm: FC<UISchemaEditorProps> = ({ uiSchema, onChange }) => {
  const [localSchema, setLocalSchema] = useState<any>(uiSchema);
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  useEffect(() => {
    setLocalSchema(uiSchema);
  }, [uiSchema]);

  const updateSchema = useCallback((path: any, value: any) => {
    setLocalSchema((currentSchema: any) =>
      produce(currentSchema, (draft: any) => {
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
      else if (newWidgetValue === 'text') {
        updateSchema([...parentPath, 'ui:inputType'], "");
      }
    },
    [updateSchema]
  );

  useEffect(() => {
    if (onChange) onChange(localSchema);
  }, [localSchema, onChange]);

  const handleBreadcrumbClick = useCallback((index: number) => {
    setCurrentPath(current => index === -1 ? [] : current.slice(0, index + 1));
  }, []);

  const renderField = useCallback(
    (key: string, value: any, path: string[] = [], depth = 0) => {
      const fullPath = [...path, key];
      const fieldKey = fullPath.join('-');

      if (key === "ui:fieldType") return null;

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

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const basicKeys   = ['ui:title', 'ui:description'];
        const advancedKeys = Object.keys(value).filter(k => !basicKeys.includes(k));
      
        return (
          <Card
            key={fieldKey}
            className={`ml-${depth * 4} min-w-[250px] ${depth > 0 ? 'mt-2' : ''}`}
          >
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {key.replace(/^ui:/, '')}
                </span>
              </div>
            </CardHeader>
      
            <CardContent className="space-y-4">
              {/* 1) Render only title & description */}
              {basicKeys.map(subKey =>
                value[subKey] != null ? (
                  <div key={`${fieldKey}-${subKey}`}>
                    {renderField(subKey, value[subKey], fullPath, depth + 1)}
                  </div>
                ) : null
              )}
      
              {/* 2) Everything else under “Advanced” */}
              {advancedKeys.length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="advanced">
                    <AccordionTrigger className="text-sm py-2">
                      Advanced
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                      {advancedKeys.map(subKey => (
                        <div key={`${fieldKey}-adv-${subKey}`}>
                          {renderField(subKey, value[subKey], fullPath, depth + 1)}
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardContent>
          </Card>
        );
      }

      // if (['anyOf', 'allOf', 'oneOf'].includes(key)) {
      //   const typeLabels = {
      //     anyOf: 'Any Of',
      //     allOf: 'All Of',
      //     oneOf: 'One Of',
      //   };

      //   const typedKey = key as 'anyOf' | 'allOf' | 'oneOf';

      //   return (<>
     
      //       <CardHeader className="py-3 px-4">
      //         <div className="flex items-center gap-2">
      //           {depth > 0 && (
      //             <div className="text-xs text-muted-foreground flex items-center">
      //               {path.map((p, i) => (
      //                 <React.Fragment key={`breadcrumb-${i}`}>
      //                   {i > 0 && <ChevronRight className="h-3 w-3 mx-1" />}
      //                   <span>{p}</span>
      //                 </React.Fragment>
      //               ))}
      //             </div>
      //           )}
      //           <CardTitle className="text-sm font-semibold">
      //             {typeLabels[typedKey]} Conditions
      //           </CardTitle>
      //         </div>
      //       </CardHeader>
      //       <CardContent className="space-y-4">
      //         {Array.isArray(value) &&
      //           value.map((condition, index) => (
      //             <div key={`${fieldKey}-cond-${index}-${depth}`} className="mb-6">
      //               <div className="flex items-center gap-2 mb-3">
      //                 <span className="text-xs font-medium">
      //                   Condition {index + 1}
      //                 </span>
      //               </div>
      //               <div className="space-y-4 ml-4">
      //                 {typeof condition === 'object' &&
      //                   Object.entries(condition).map(([subKey, subValue]) =>
      //                     renderField(
      //                       subKey,
      //                       subValue,
      //                       [...fullPath, index.toString()],
      //                       depth + 1
      //                     )
      //                   )}
      //               </div>
      //             </div>
      //           ))}
      //       </CardContent>
    
      //       </>);
      // }

      // if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      //   const allKeys = Object.keys(value);
      //   let sortedKeys = allKeys;
      //   if (value.hasOwnProperty('ui:order') && Array.isArray(value['ui:order'])) {
      //     const order = value['ui:order'];
      //     const unorderedKeys = allKeys.filter(
      //       (k) => k !== 'ui:order' && !order.includes(k)
      //     );
      //     sortedKeys = [...order, ...unorderedKeys];
      //   }

      //   const basicKeys = ['ui:title', 'ui:description', 'ui:order'];
      //   const advancedKeys = sortedKeys.filter((subKey) => !basicKeys.includes(subKey));

      //   return (
      //     <Card className={`ml-4 min-w-[250px] ${depth > 0 ? 'mt-2' : ''}`}>
      //       <CardContent className="pt-4 space-y-4">
      //         <fieldset className="space-y-4" key={`${fieldKey}-cond-${depth}`}>
      //           <legend className="flex justify-between items-center text-sm font-medium mb-2 w-full">
      //             <div className="flex items-center gap-2">
      //               {depth > 0 && (
      //                 <div className="text-xs text-muted-foreground flex items-center">
      //                   {path.map((p, i) => (
      //                     <React.Fragment key={`breadcrumb-${i}`}>
      //                       {i > 0 && <ChevronRight className="h-3 w-3 mx-1" />}
      //                       <span>{p}</span>
      //                     </React.Fragment>
      //                   ))}
      //                 </div>
      //               )}
      //               <span>{key.replace(/^ui:/, '')}</span>
      //             </div>
      //             {value["ui:fieldType"] ? (
      //               <Badge variant="secondary">{value["ui:fieldType"]}</Badge>
      //             ) : value["ui:arrayOptions"] ? (
      //               <Badge variant="secondary">Array</Badge>
      //             ) : null}
      //           </legend>

      //           {sortedKeys
      //             .filter((subKey) => basicKeys.includes(subKey))
      //             .map((subKey) => (
      //               <div key={`${fieldKey}-basic-${subKey}`}>
      //                 {subKey === 'ui:order' ? (
      //                   <div className={`ml-${(depth + 1) * 4} mb-4`}>
      //                     <Label className="block text-sm font-medium mb-1">
      //                       Order
      //                     </Label>
      //                     <SortableList
      //                       items={value[subKey]}
      //                       onReorder={(newOrder) =>
      //                         updateSchema([...fullPath, subKey], newOrder)
      //                       }
      //                     />
      //                   </div>
      //                 ) : (
      //                   renderField(subKey, value[subKey], fullPath, depth + 1)
      //                 )}
      //               </div>
      //             ))}

      //           {advancedKeys.length > 0 && (
      //             <Accordion type="single" collapsible className="w-full">
      //               <AccordionItem value="advanced">
      //                 <AccordionTrigger className="text-sm py-2">
      //                   Options
      //                 </AccordionTrigger>
      //                 <AccordionContent className="pt-4 space-y-4">
      //                   {advancedKeys.map((subKey) => (
      //                     <div key={`${fieldKey}-advanced-${subKey}`}>
      //                       {renderField(subKey, value[subKey], fullPath, depth + 1)}
      //                     </div>
      //                   ))}
      //                 </AccordionContent>
      //               </AccordionItem>
      //             </Accordion>
      //           )}
      //         </fieldset>
      //       </CardContent>
      //     </Card>
      //   );
      // }

      if (Array.isArray(value)) {
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
        key={typeof fieldKey === 'number' ? `Item ${fieldKey + 1}` : fieldKey} // Dynamic key based on fieldKey
        label={!isNaN(Number(key)) ? `Item ${Number(key) + 1}` : key.replace(/^ui:/, '')}
        value={value}
        path={fullPath}
        onFieldChange={updateSchema}
        fieldType={derivedFieldType}
        options={(derivedFieldType as "text" | "checkbox" | "select") === "select" ? widgetOptions : []}
      />
      );
    },
    [updateSchema, localSchema, handleWidgetChange , currentPath]
  );

  const Breadcrumb: FC<{ path: string[] }> = ({ path }) => {
    const getDisplayName = (segment: string, index: number, segments: string[]) => {
      if (index === 0) return segment;
      const parentKey = segments[index - 1];
      
      if (['oneOf', 'allOf', 'anyOf'].includes(parentKey)) {
        return `Condition ${Number(segment) + 1}`;
      }
      
      return segment;
    };

  
    return (
      <div className="flex items-center gap-2 text-sm mb-4 flex-wrap pt-3">
        <button
          onClick={() => setCurrentPath([])}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Home
        </button>
        {path.map((segment, index) => {
          const displayName = getDisplayName(segment, index, path);
          return (
            <React.Fragment key={index}>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <button
                onClick={() => setCurrentPath(path.slice(0, index + 1))}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {!isNaN(Number(displayName))
                  ? `Item ${Number(displayName) + 1}`
                  : displayName.replace(/^ui:/, '')}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    );
    
  };

  

  function getFieldType(node: any): string | null {
    // 1. explicit
    if (typeof node['ui:fieldType'] === 'string') {
      return node['ui:fieldType'];
    }
    // 2. primitive items
    if (node.items && typeof node.items['ui:fieldType'] === 'string') {
      return node.items['ui:fieldType'];
    }
    // 3. array schema (has items but no primitive type)
    if (node.items) {
      return 'array';
    }
    // 4. complex object → count its child keys
    if (node && typeof node === 'object') {
      const childKeys = Object.keys(node);
      return `${childKeys.length} fields`;
    }
    return null;
  }
  
  // Badge stays the same—you’ll now see “3 fields” (or “array”, or “string”, etc.)
  const FieldTypeBadge = ({ type }: { type: string }) => (
    <span className="text-xs bg-muted px-2 py-0.5 rounded">{type}</span>
  );

  const currentNode = getNodeByPath(localSchema, currentPath);
  if (!currentNode) {
    setCurrentPath([]);
    return null;
  }

  const sortedKeys = (
    currentNode.hasOwnProperty('ui:order') && Array.isArray(currentNode['ui:order'])
      ? [
          ...currentNode['ui:order'],
          ...Object.keys(currentNode).filter(
            k => k !== 'ui:order' && !currentNode['ui:order'].includes(k)
          ),
        ]
      : Object.keys(currentNode)
  ).filter(k => k !== 'ui:order');

  const renderedKeys = new Set<string>();

// 1. Field Ordering (ui:order)
const fieldOrderingControls = currentNode.hasOwnProperty('ui:order') && (
  <div className="space-y-4 mb-6">
    {/* <Label className="text-sm font-medium">Field Order</Label> */}
    <SortableList
      items={currentNode['ui:order']}
      onReorder={(newOrder) =>
        updateSchema([...currentPath, 'ui:order'], newOrder)
      }
    />
  </div>
);

// 2. Clickable Cards (conditionals, nested objects, array of objects)
const clickableCards = sortedKeys.flatMap((key) => {
  const value = currentNode[key];
  const fullPath = [...currentPath, key];
  const fieldType = getFieldType(value);
  const lastPathKey = currentPath?.[currentPath.length - 1];
  const conditionalKeys = ['oneOf', 'allOf', 'anyOf'];

  if (conditionalKeys.includes(key) && key !== 'ui:emptyValue') {
    renderedKeys.add(key);
    const typeLabels: {
      oneOf: string;
      allOf: string;
      anyOf: string;
    } = {
      oneOf: "One of",
      allOf: "All of",
      anyOf: "Any of",
    };

    // {typeLabels[key] || typeLabels[lastPathKey]} Conditions

    return (
      <Card
      key={key}
      className="bg-muted/50 min-w-[250px] cursor-pointer hover:bg-muted transition-colors mb-2"
      onClick={() => setCurrentPath(fullPath)}
    >
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
            {(typeLabels as Record<string, string>)[key as string] ??
  (typeLabels as Record<string, string>)[lastPathKey as string] ??
  "Conditions"}
            </span>
            {fieldType && <FieldTypeBadge type={fieldType} />}
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
    </Card>
    );
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value) && key !== 'ui:emptyValue') {
    renderedKeys.add(key);
    const isConditional = lastPathKey && conditionalKeys.includes(lastPathKey);

    return (
      <Card
        key={key}
        className="bg-muted/50 min-w-[250px] cursor-pointer hover:bg-muted transition-colors mb-2"
        onClick={() => setCurrentPath(fullPath)}
      >
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                {/* {JSON.stringify(key)} */}
                
                {isConditional ? `Condition ${Number(key) + 1}` :  !isNaN(Number(key)) ? `Item ${Number(key) + 1}` : key.replace(/^ui:/, '')}
              </span>
              {fieldType && <FieldTypeBadge type={fieldType} />}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (Array.isArray(value)  && key !== 'ui:emptyValue') {
    renderedKeys.add(key);
    return (
      <Card
        // key={fieldKey}
        className="bg-muted/50 min-w-[250px] cursor-pointer hover:bg-muted transition-colors mb-4"
        onClick={() => setCurrentPath(fullPath)}
      >
          <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
            {!isNaN(Number(key)) ? `Item ${Number(key) + 1}` : key.replace(/^ui:/, '')}
            </span>
            {fieldType && <FieldTypeBadge type={fieldType} />}
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      </Card>
    );
  }

  return null;
});

const initialRemainingKeys = sortedKeys.filter((key) => !renderedKeys.has(key));

let basicInputFields: JSX.Element[] = [];
let remainingFieldsAccordion = null;

// Step 2: Conditional rendering
if (initialRemainingKeys.length >= 4) {
  // Title + Description only
  basicInputFields = sortedKeys
    .filter((key) => key === 'ui:title' || key === 'ui:description')
    .map((key) => {
      renderedKeys.add(key); // Now mutate safely
      return renderField(key, currentNode[key], currentPath, 0);
    }) .filter((el): el is JSX.Element => el !== null);;

  // Recalculate remaining keys after rendering title & description
  const remainingKeys = sortedKeys.filter((key) => !renderedKeys.has(key));

  remainingFieldsAccordion = (
    <Accordion type="multiple" className="w-full mt-6">
      <AccordionItem value="remaining-fields">
        <AccordionTrigger className="text-sm font-medium">Other Fields</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6">
            {remainingKeys.map((key) => {
              renderedKeys.add(key); // Add to renderedKeys *after* deciding to render
              return renderField(key, currentNode[key], currentPath, 0);
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
} else {
  // Less than 4? Just render all directly
  basicInputFields = initialRemainingKeys
  .map((key) => {
    renderedKeys.add(key);
    return renderField(key, currentNode[key], currentPath, 0);
  })
  .filter((el): el is JSX.Element => el !== null);

}


// 4. Remaining fields in accordion





  return (
<Card className="min-w-[250px] mx-auto border-0">
<CardHeader className="space-y-4">
  <CardTitle className="text-xl">UI Schema Editor</CardTitle>
  <CardDescription className="text-sm text-muted-foreground">
    Configure your form UI schema with drag-and-drop ordering
  </CardDescription>

  {/* Dynamic Title + Field-Type badge */}
  <div className="flex justify-between items-center pt-4">
    <h2 className="text-xl font-semibold">
      {currentPath.length > 0 ? currentPath[currentPath.length - 1].replace(/^ui:/, '') : 'Home'}
    </h2>
    {(() => {
      // compute current node and its type
      const node = getNodeByPath(localSchema, currentPath);
      const type = getFieldType(node);
      return type ? (
        <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded">
          {type}
        </Badge>
      ) : null;
    })()}
  </div>

  {/* Breadcrumb */}
  <Breadcrumb path={currentPath} />
</CardHeader>




  <CardContent className="space-y-6">

  <>
  {/* Field Ordering */}
  {fieldOrderingControls && (
    <section className="bg-muted/40 rounded-xl shadow-sm p-6 mb-10">
      <h2 className="text-lg font-semibold mb-2">Field Order</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Reorder how the fields are displayed in the form.
      </p>
      {fieldOrderingControls}
    </section>
  )}

  {/* Structural & Conditional Fields */}
  {clickableCards.filter(Boolean).length > 0 && (
    <section className="bg-muted/40 rounded-xl shadow-sm p-6 mb-10">
      <h2 className="text-lg font-semibold mb-2">Structure</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Click to explore nested structures and conditions.
      </p>
      <div className="space-y-4">{clickableCards}</div>
    </section>
  )}

  {/* Basic Input Fields */}
  {basicInputFields.length > 0 && (
    <section className="bg-muted/40 rounded-xl shadow-sm p-6 mb-10">
      <h2 className="text-lg font-semibold mb-2">Content</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Modify field titles, descriptions, and other basic values.
      </p>
      <div className="space-y-6">{basicInputFields}</div>
    </section>
  )}

  {/* Other Fields */}
  {remainingFieldsAccordion && (
    <section className="bg-muted/40 rounded-xl shadow-sm p-6 mb-10">
      <h2 className="text-lg font-semibold mb-2">Additional Fields</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Fields not categorized above.
      </p>
      {remainingFieldsAccordion}
    </section>
  )}
</>



    



      </CardContent>
    </Card>
  );
};



export default memo(UISchemaEditorForm);


