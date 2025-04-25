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

export const UISchema = {"g":[
  ["kernel_address",{"ui:widget":"text","ui:options":{"label":"Kernel address","placeholder":"Enter kernel address"}}],
  "lol"
]}