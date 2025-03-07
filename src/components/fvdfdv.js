export function determineFieldType(schema) {
    if (schema.anyOf) return 'anyOf';
    if (schema.allOf) return 'allOf';
    if (schema.oneOf) return 'oneOf';
    if (schema.enum) return 'enum';
  
    const type = Array.isArray(schema.type) 
      ? schema.type.find((t) => t !== 'null') 
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

  function applyWidgetDefaults(uiSchema, widget) {
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
  
  export function generateUISchema(jsonSchema, options = {}) {
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
    function processSchema(schema, path = [], isRoot = false) {
      const uiSchema = {};
  
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
        ? schema.type.find((t) => t !== 'null')
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
        uiSchema.anyOf = schema.anyOf.map((sub, idx) => {
          const subUi = processSchema(sub, [...path, 'anyOf', idx], false);
          if (!subUi['ui:title']) subUi['ui:title'] = sub.title || "";
          if (!subUi['ui:description']) subUi['ui:description'] = sub.description || "";
          return subUi;
        });
      }
      if (schema.oneOf) {
        uiSchema.oneOf = schema.oneOf.map((sub, idx) => {
          const subUi = processSchema(sub, [...path, 'oneOf', idx], false);
          if (!subUi['ui:title']) subUi['ui:title'] = sub.title || "";
          if (!subUi['ui:description']) subUi['ui:description'] = sub.description || "";
          return subUi;
        });
      }
      if (schema.allOf) {
        uiSchema.allOf = schema.allOf.map((sub, idx) => {
          const subUi = processSchema(sub, [...path, 'allOf', idx], false);
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
    function applyCommonProperties(schema, uiSchema, isRoot) {
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
  
    function handleStringType(schema, uiSchema) {
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
  
    function handleNumberType(schema, uiSchema) {
      uiSchema['ui:widget'] = defaultOptions.defaultWidgets.number;
      applyWidgetDefaults(uiSchema, uiSchema['ui:widget']);
    }
  
    function handleBooleanType(schema, uiSchema) {
      uiSchema['ui:widget'] = defaultOptions.defaultWidgets.boolean;
    }
  
  function handleArrayType(schema, uiSchema, path) {
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
  
  
    function handleObjectType(schema, uiSchema, path) {
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
  
    function handleEnumProperties(schema, uiSchema) {
      if (schema.enumNames && Array.isArray(schema.enumNames)) {
          console.log(uiSchema)
        uiSchema['ui:enumNames'] = schema.enumNames;
      } else {
        uiSchema['ui:enumNames'] = schema.enum.map((val, idx) => {
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
  
    function handleTextareaOptions(schema, uiSchema) {
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
  
    function addToUIOptions(uiSchema, key, value) {
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
  
  
  const schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Example JSON Schema",
    "type": "object",
    "required": [
      "kernel_address"
    ],
    "properties": {
      "authorized_cw20_addresses": {
        "type": [
          "array",
          "null"
        ],
        "items": {
          "description": "A raw address (andr1....), a valid vfs path (~username/app/component), app component (./component) or ibc protocol path (ibc://cosmoshub-4/user/app/component)",
          "type": "string",
          "pattern": "(^((([A-Za-z0-9]+://)?([A-Za-z0-9.\\-_]{2,80}/)))?((~[a-z0-9]{2,}|(lib|home))(/[A-Za-z0-9.\\-_]{2,80}?)*(/)?)$)|(^(~[a-z0-9]{2,}|/(lib|home))(/[A-Za-z0-9.\\-_]{2,80}?)*(/)?$)|(^[a-z0-9]{2,}$)|(^\\.(/[A-Za-z0-9.\\-_]{2,40}?)*(/)?$)",
          "$original_type": "AndrAddr"
        },
        "title": "Authorized cw20 addresses"
      },
      "authorized_token_addresses": {
        "type": [
          "array",
          "null"
        ],
        "items": {
          "description": "A raw address (andr1....), a valid vfs path (~username/app/component), app component (./component) or ibc protocol path (ibc://cosmoshub-4/user/app/component)",
          "type": "string",
          "pattern": "(^((([A-Za-z0-9]+://)?([A-Za-z0-9.\\-_]{2,80}/)))?((~[a-z0-9]{2,}|(lib|home))(/[A-Za-z0-9.\\-_]{2,80}?)*(/)?)$)|(^(~[a-z0-9]{2,}|/(lib|home))(/[A-Za-z0-9.\\-_]{2,80}?)*(/)?$)|(^[a-z0-9]{2,}$)|(^\\.(/[A-Za-z0-9.\\-_]{2,40}?)*(/)?$)",
          "$original_type": "AndrAddr"
        },
        "title": "Authorized token addresses"
      },
      "kernel_address": {
        "type": "string",
        "title": "Kernel address",
        "default": ""
      },
      "owner": {
        "type": [
          "string",
          "null"
        ],
        "title": "Owner"
      }
    },
    "additionalProperties": false,
    "$id": "auction",
    "adoType": "auction",
    "version": "2.2.5",
    "classifier": "sale",
    "class": "baseADO",
    "description": "This is a example form to demonstrate the working for UISchema builder."
  }
  // Example usage with all supported properties
  const uiSchema = generateUISchema(schema,  {
    useUiOptionsWrapper: false,
    globalOptions: {
      copyable: true,
      label: false
    },
    submitButtonOptions: {
      props: { className: 'btn-primary' },
      submitText: 'Save'
    },
     defaultWidgets: {
        string: 'text',
        number: 'updown',
        boolean: 'checkbox',
        date: 'date',
        "date-time": 'datetime',
        time : "time"

      }
  });
  
  console.log(JSON.stringify(uiSchema))