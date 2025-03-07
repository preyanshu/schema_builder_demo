export function determineFieldType(schema : any) {
    if (schema.anyOf) return 'anyOf';
    if (schema.allOf) return 'allOf';
    if (schema.oneOf) return 'oneOf';
    if (schema.enum) return 'enum';
  
    const type = Array.isArray(schema.type) 
      ? schema.type.find((t:string) => t !== 'null') 
      : schema.type;
  
    switch (type) {
      case 'integer':
      case 'number':
        return 'number';
      case 'boolean':
        return 'bool';
      case 'string':
        return 'string';
      default:
        return type || 'unknown';
    }
  }
  
  //removes extra fields from UISchema
  export function cleanUiSchema(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(cleanUiSchema).filter((v) => v !== undefined);
    } else if (obj && typeof obj === "object") {
      const result: any = {};
      Object.entries(obj).forEach(([key, value]) => {

        if (key === 'ui:fieldType') return;
        
        const cleaned = cleanUiSchema(value);

        if (cleaned === "" || cleaned === false || cleaned === "off" || cleaned === "false") {
          return;
        }

        if (typeof cleaned === "object" && cleaned !== null && Object.keys(cleaned).length === 0) {
          return;
        }
        result[key] = cleaned;
      });
      return result;
    }
    return obj;
  }
  
  export function applyWidgetDefaults(uiSchema: any, widget:string) {
    switch (widget) {
      case 'textarea':
        if (uiSchema['ui:rows'] === undefined) uiSchema['ui:rows'] = 5;
        if (uiSchema['ui:autocomplete'] === undefined) uiSchema['ui:autocomplete'] = 'off';
        break;
      case 'file':
        if (uiSchema['ui:filePreview'] === undefined) uiSchema['ui:filePreview'] = false;
        if (uiSchema['ui:accept'] === undefined) uiSchema['ui:accept'] = '';
        break;
  
      case 'text':
        if (uiSchema['ui:inputType'] === undefined) uiSchema['ui:inputType'] = '';  
  
      default:
        break;
    }
  }
  
  //generate template UI schema
  export function generateUISchema(jsonSchema: any, options: any = {}): any {
    const defaultOptions = {
      useUiOptionsWrapper: true,
      defaultWidgets: {
        string: 'text',
        number: 'updown',
        boolean: 'checkbox',
        
      },
      globalOptions: {},
      ...options
    };
  
    // Recursively process the schema
    function processSchema(schema: any, path: string[] = [], isRoot = false): any {
      const uiSchema:any= {};
  
      // Root-level directives
      if (isRoot) {
        if (defaultOptions.globalOptions.copyable) {
          uiSchema['ui:globalOptions'] = { copyable: true };
        }
        if (defaultOptions.rootFieldId) {
          uiSchema['ui:rootFieldId'] = defaultOptions.rootFieldId;
        }
        if (defaultOptions.submitButtonOptions) {
          uiSchema['ui:submitButtonOptions'] = defaultOptions.submitButtonOptions;
        }
      }
  
      // Decide type
      const type = Array.isArray(schema.type)
        ? schema.type.find((t:string) => t !== 'null')
        : schema.type;
  
      // We apply various handling based on type
      switch (type) {
        case 'string':
          handleStringType(schema, uiSchema);
          break;
        case 'number':
        case 'integer':
          handleNumberType(schema, uiSchema);
          break;
        case 'boolean':
          handleBooleanType(schema, uiSchema);
          break;
        case 'array':
          handleArrayType(schema, uiSchema, path);
          break;
        case 'object':
          handleObjectType(schema, uiSchema, path);
          break;
        default:
          // Handle anyOf, oneOf, allOf if present
          if (schema.anyOf || schema.oneOf || schema.allOf) {
            uiSchema['ui:widget'] = 'select';
            applyWidgetDefaults(uiSchema, 'select');
          }
          break;
      }
  
      // Common properties (title, description, etc.)
      applyCommonProperties(schema, uiSchema, isRoot);
  
      // If we have an enum
      if (schema.enum) {
        handleEnumProperties(schema, uiSchema);
      }
  
      // If the schema says hidden
      if (schema.hidden) {
        uiSchema['ui:widget'] = 'hidden';
      }
  
      // anyOf, oneOf, allOf
      if (schema.anyOf) {
        uiSchema.anyOf = schema.anyOf.map((sub: any, idx: number) => {
          const subUi = processSchema(sub,  [...path, 'anyOf', idx.toString()], false);
          if (!subUi['ui:title']) subUi['ui:title'] = sub.title || "";
          if (!subUi['ui:description']) subUi['ui:description'] = sub.description || "";
          return subUi;
        });
      }
      if (schema.oneOf) {
        uiSchema.oneOf = schema.oneOf.map((sub: any, idx: number) => {
          const subUi = processSchema(sub,  [...path, 'anyOf', idx.toString()], false);
          if (!subUi['ui:title']) subUi['ui:title'] = sub.title || "";
          if (!subUi['ui:description']) subUi['ui:description'] = sub.description || "";
          return subUi;
        });
      }
      if (schema.allOf) {
        uiSchema.allOf = schema.allOf.map((sub: any, idx: number) => {
          const subUi = processSchema(sub,  [...path, 'anyOf', idx.toString()], false);
          if (!subUi['ui:title']) subUi['ui:title'] = sub.title || "";
          if (!subUi['ui:description']) subUi['ui:description'] = sub.description || "";
          return subUi;
        });
      }
  
      // If there's a widget, store ui:fieldType
      if (uiSchema['ui:widget']) {
        uiSchema['ui:fieldType'] = determineFieldType(schema);
        uiSchema['ui:emptyValue'] = schema.default || "";
      }
  
      return uiSchema;
    }
  
    // Common field properties
    function applyCommonProperties(schema: any, uiSchema: any, isRoot: boolean): void {
      if (schema.title) {
        if (defaultOptions.useUiOptionsWrapper) {
          uiSchema['ui:options'] = {
            ...(uiSchema['ui:options'] || {}),
            title: schema.title
          };
        } else {
          uiSchema['ui:title'] = schema.title;
        }
      }
      if (schema.description) {
        uiSchema['ui:description'] = schema.description;
      }
      if (!isRoot) {
        uiSchema['ui:readonly'] = schema.readOnly || false;
        uiSchema['ui:disabled'] = schema.disabled || false;
      }
      if (schema.help) {
        uiSchema['ui:help'] = schema.help;
      }
    }
  
    function handleStringType(schema: any, uiSchema: any): void{
      const widget = schema.format
        ? defaultOptions.defaultWidgets[schema.format] || defaultOptions.defaultWidgets.string
        : defaultOptions.defaultWidgets.string;
      uiSchema['ui:widget'] = widget;
  
      if (schema.format === "data-url") {
        uiSchema["ui:widget"] = "file";
        applyWidgetDefaults(uiSchema, 'file');
      }
      
  
      applyWidgetDefaults(uiSchema, uiSchema['ui:widget']);
  
      if (widget === 'textarea') {
        handleTextareaOptions(schema, uiSchema);
      }
  
      if (schema.inputType) {
        addToUIOptions(uiSchema, 'inputType', schema.inputType);
      }
  
      // Placeholder
      const placeholder = `Enter ${schema.title?.toLowerCase() || 'value'}`;
      addToUIOptions(uiSchema, 'placeholder', placeholder);
  
      uiSchema['ui:autofocus'] = schema.autofocus || false;
    }
  
    function handleNumberType(schema: any, uiSchema: any): void{
      uiSchema['ui:widget'] = defaultOptions.defaultWidgets.number;
      applyWidgetDefaults(uiSchema, uiSchema['ui:widget']);
    }
  
    function handleBooleanType(schema: any, uiSchema: any): void{
      uiSchema['ui:widget'] = defaultOptions.defaultWidgets.boolean;
    }
  
  function handleArrayType(schema: any, uiSchema: any, path: string[]): void {
    const arrayOptions = {
      addable: true,
      orderable: true,
      removable: true
    };
    addToUIOptions(uiSchema, 'arrayOptions', arrayOptions);
  
    if (schema.items) {
      const itemsUi = processSchema(schema.items, [...path, 'items']);
      // If the items schema is an enum, merge its UI properties directly
      // instead of nesting them under the "items" key.
      if (schema.items.enum) {
        Object.assign(uiSchema, itemsUi);
      } else {
        uiSchema.items = itemsUi;
      }
    }
    if (schema.filePreview) {
      addToUIOptions(uiSchema, 'filePreview', true);
    }
  }
  
  
    function handleObjectType(schema: any, uiSchema: any, path: string[]): void {
      if (schema.properties) {
        uiSchema['ui:order'] = Object.keys(schema.properties);
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          uiSchema[key] = processSchema(propSchema, [...path, key]);
        }
      }
      if (schema.additionalProperties) {
        addToUIOptions(uiSchema, 'duplicateKeySuffixSeparator', schema.duplicateKeySuffixSeparator || '-');
      }
    }
  
    function handleEnumProperties(schema: any, uiSchema: any): void {
      if (schema.enumNames && Array.isArray(schema.enumNames)) {
          console.log(uiSchema)
        uiSchema['ui:enumNames'] = schema.enumNames;
      } else {
        uiSchema['ui:enumNames'] = schema.enum.map((val: any, idx: number) => {
          return (typeof val === 'string')
            ? val.charAt(0).toUpperCase() + val.slice(1)
            : `Enum ${idx + 1}`;
        });
      }
      uiSchema['ui:widget'] = 'select';
      applyWidgetDefaults(uiSchema, 'select');
      if (schema.enumDisabled) {
        uiSchema['ui:enumDisabled'] = schema.enumDisabled;
      }
    }
  
    function handleTextareaOptions(schema: any, uiSchema: any): void {
      const textareaOptions = {
        widget: 'textarea',
        autocomplete: 'on',
        rows: schema.rows || 5
      };
      if (schema.minLength || schema.maxLength) {
        // example logic
        textareaOptions.rows = Math.min(Math.max(schema.minLength || 3, 3), 10);
      }
      Object.entries(textareaOptions).forEach(([key, val]) => {
        addToUIOptions(uiSchema, key, val);
      });
    }
  
    function addToUIOptions(uiSchema: any, key: string, value: any): void {
      if (defaultOptions.useUiOptionsWrapper) {
        uiSchema['ui:options'] = {
          ...(uiSchema['ui:options'] || {}),
          [key]: value
        };
      } else {
        uiSchema[`ui:${key}`] = value;
      }
    }
  
    return processSchema(jsonSchema, [], true);
  }
  
  // Deep merge for objects
  export function deepMerge(target: any, source: any): any {
    Object.keys(source).forEach((key) => {
      if (Array.isArray(source[key])) {
        // Overwrite arrays
        target[key] = source[key];
      } else if (source[key] && typeof source[key] === "object") {
        if (!target[key] || typeof target[key] !== "object") {
          target[key] = {};
        }
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });
    return target;
  }
  
  // Canonicalize and normalize UI keys
  export function canonicalize(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(canonicalize);
    } else if (obj && typeof obj === "object") {
      const keysToCanonicalize = ["description", "help", "title", "placeholder", "readonly", "disabled"];
      const newObj:any = {};
      for (const key in obj) {
        if (key === "ui:options" && typeof obj[key] === "object") {
          // Move recognized keys from ui:options to top-level "ui:key"
          for (const optKey in obj[key]) {
            if (keysToCanonicalize.includes(optKey)) {
              newObj[`ui:${optKey}`] = obj[key][optKey];
            } else {
              newObj[optKey] = canonicalize(obj[key][optKey]);
            }
          }
        } else {
          newObj[key] = canonicalize(obj[key]);
        }
      }
      return newObj;
    }
    return obj;
  }
  
  export function normalizeSchema(schema: any): any{
    return canonicalize(schema);
  }
  //resolves refs from jsonschema
  export function resolveSchema(schema: any): any{
    if (!schema.definitions) return schema;
    
    const resolvedSchema = JSON.parse(JSON.stringify(schema)); // Deep clone
    const definitions = resolvedSchema.definitions;
    delete resolvedSchema.definitions; // Remove definitions
    
    function resolveRefs(obj: any): any {
      if (typeof obj !== "object" || obj === null) return obj;
      
      if (obj.$ref) {
        const refKey = obj.$ref.replace("#/definitions/", "");
        if (definitions[refKey]) {
          return { ...resolveRefs(definitions[refKey]) }; // Replace with resolved definition
        }
      }
      
      if (Array.isArray(obj)) {
        return obj.map(resolveRefs);
      }
      
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, resolveRefs(value)])
      );
    }
    
    return resolveRefs(resolvedSchema);
  }
  
  export function resolveRefs(schema:any) {
    // Internal recursive function that takes an object and the root schema.
    function resolve(obj: any, root: any) {
      if (obj && typeof obj === 'object') {
        // Check if this object has a $ref.
        if ('$ref' in obj) {
          // Extract the ref path (assumes the format "#/definitions/SomeDef")
          const refPath = obj.$ref;
          const parts = refPath.split('/').slice(1); // remove '#' and split path
  
          // Traverse the root schema to find the referenced definition.
          let refDefinition = root;
          for (const part of parts) {
            if (refDefinition && part in refDefinition) {
              refDefinition = refDefinition[part];
            } else {
              throw new Error(`Unable to resolve reference: ${refPath}`);
            }
          }
  
          // Clone the referenced definition to avoid modifying the original.
          let resolved = JSON.parse(JSON.stringify(refDefinition));
  
          // Merge any additional properties from the original object (except $ref)
          for (const key in obj) {
            if (key !== '$ref') {
              // If the key exists in both, we merge objects recursively;
              // otherwise, the original property overwrites.
              if (typeof obj[key] === 'object' && obj[key] !== null && key in resolved) {
                resolved[key] = Object.assign({}, resolved[key], resolve(obj[key], root));
              } else {
                resolved[key] = obj[key];
              }
            }
          }
          // Continue to resolve any $ref within the merged object.
          return resolve(resolved, root);
        } else {
          // Recursively check for $ref in all properties of the current object.
          for (const key in obj) {
            obj[key] = resolve(obj[key], root);
          }
        }
      }
      return obj;
    }
  
    // Begin resolution using the full schema as the root.
    return resolve(schema, schema);
  }
  