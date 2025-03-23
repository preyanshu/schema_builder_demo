export const widgetOptions = [
    'text', 'textarea', 'updown', 'checkbox', 'select', 'radio', 
    'date', 'datetime-local', 'hidden', 'password', 'RadioWidget', 
    'CheckboxesWidget'
  ];
  
  export const allowedWidgetsMapping = {
    string: ['text', 'textarea','password', 'hidden','file','datetime','date','time'],
    number: ['updown',"text" ,'hidden','range'],
    bool: ['checkbox','hidden'],
    enum: ['select', 'RadioWidget', 'CheckboxesWidget',  'hidden'],
    array: ['select', 'RadioWidget', 'CheckboxesWidget',  'hidden'],
    oneOf : ['select', 'RadioWidget', 'CheckboxesWidget',  'hidden'],
    anyOf :['select', 'RadioWidget', 'CheckboxesWidget',  'hidden'],
    allOf :['select', 'RadioWidget', 'CheckboxesWidget',  'hidden']
  };

  export const defaultJsonSchema = {
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

export const UISchema = {
  "ui:globalOptions": {
    "copyable": true
  },
  "ui:submitButtonOptions": {
    "props": {
      "disabled": false
    },
    "norender": false,
    "submitText": "Save"
  },
  "ui:order": [
    "authorized_cw20_addresses",
    "authorized_token_addresses",
    "kernel_address",
    "owner"
  ],
  "authorized_cw20_addresses": {
    "ui:arrayOptions": {
      "addable": true,
      "orderable": true,
      "removable": true
    },
    "items": {
      "ui:widget": "text",
      "ui:inputType": "",
      "ui:placeholder": "Enter value",
      "ui:autofocus": false,
      "ui:title": "",
      "ui:description": "A raw address (andr1....), a valid vfs path (~username/app/component), app component (./component) or ibc protocol path (ibc://cosmoshub-4/user/app/component)",
      "ui:readonly": false,
      "ui:disabled": false,
      "ui:fieldType": "string",
      "ui:emptyValue": ""
    },
    "ui:title": "Authorized cw20 addresses",
    "ui:description": "",
    "ui:readonly": false,
    "ui:disabled": false
  },
  "authorized_token_addresses": {
    "ui:arrayOptions": {
      "addable": true,
      "orderable": true,
      "removable": true
    },
    "items": {
      "ui:widget": "text",
      "ui:inputType": "",
      "ui:placeholder": "Enter value",
      "ui:autofocus": false,
      "ui:title": "",
      "ui:description": "A raw address (andr1....), a valid vfs path (~username/app/component), app component (./component) or ibc protocol path (ibc://cosmoshub-4/user/app/component)",
      "ui:readonly": false,
      "ui:disabled": false,
      "ui:fieldType": "string",
      "ui:emptyValue": ""
    },
    "ui:title": "Authorized token addresses",
    "ui:description": "",
    "ui:readonly": false,
    "ui:disabled": false
  },
  "kernel_address": {
    "ui:widget": "text",
    "ui:inputType": "",
    "ui:placeholder": "Enter kernel address",
    "ui:autofocus": false,
    "ui:title": "Kernel address",
    "ui:description": "",
    "ui:readonly": false,
    "ui:disabled": false,
    "ui:fieldType": "string",
    "ui:emptyValue": ""
  },
  "owner": {
    "ui:widget": "text",
    "ui:inputType": "",
    "ui:placeholder": "Enter owner",
    "ui:autofocus": false,
    "ui:title": "Owner",
    "ui:description": "",
    "ui:readonly": false,
    "ui:disabled": false,
    "ui:fieldType": "string",
    "ui:emptyValue": ""
  },
  "ui:title": "Example JSON Schema",
  "ui:description": "This is a example form to demonstrate the working for UISchema builder."
}