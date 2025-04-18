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
        return null; // Handled by main navigation
      }

      if (Array.isArray(value) && value.some(item => typeof item === 'object')) {
        return null; // Handled by main navigation
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

  const Breadcrumb: FC<{ path: string[] }> = ({ path }) => (
    <div className="flex items-center gap-2 text-sm mb-4 flex-wrap">
      <button
        onClick={() => handleBreadcrumbClick(-1)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Root
      </button>
      {path.map((segment, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <button
            onClick={() => handleBreadcrumbClick(index)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {segment}
          </button>
        </React.Fragment>
      ))}
    </div>
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

  return (
    <Card className="min-w-[250px] mx-auto border-0">
      <CardHeader>
        <CardTitle className="text-xl">UI Schema Editor</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Configure your form UI schema with drag-and-drop ordering
        </CardDescription>
        <Breadcrumb path={currentPath} />
      </CardHeader>
      <CardContent className="space-y-6">
        {currentNode.hasOwnProperty('ui:order') && (
          <div className="space-y-4">
            <Label className="text-sm font-medium">Field Order</Label>
            <SortableList
              items={currentNode['ui:order']}
              onReorder={(newOrder) => updateSchema([...currentPath, 'ui:order'], newOrder)}
            />
          </div>
        )}

        {sortedKeys.map((key) => {
          const value = currentNode[key];
          const fullPath = [...currentPath, key];
          
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return (
              <Card
                key={key}
                className="bg-muted/50 min-w-[250px] cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setCurrentPath(fullPath)}
              >
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{key}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            );
          }

          if (Array.isArray(value) && value.every(item => typeof item === 'object')) {
            return value.map((item, index) => (
              <Card
                key={index}
                className="bg-muted/50 min-w-[250px] cursor-pointer hover:bg-muted transition-colors mb-2"
                onClick={() => setCurrentPath([...fullPath, index.toString()])}
              >
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{key} [{index}]</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            ));
          }

          return renderField(key, value, currentPath, 0);
        })}
      </CardContent>
    </Card>
  );
};

export default memo(UISchemaEditorForm);