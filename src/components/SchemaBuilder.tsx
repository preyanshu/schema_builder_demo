"use client"
import React, { useState, useRef } from "react"
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import ThemedForm from "./ShadcnRjsfForm"
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8"
import UISchemaEditor from "./UISchemaEditorForm"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea"
import ErrorBoundary from "./ErrorBoundary"
import { defaultJsonSchema ,UISchema} from "@/constants";

import {
  generateUISchema,
  deepMerge,
  normalizeSchema,
  resolveSchema,
  cleanUiSchema
} from "@/utils/uiSchemaHelpers" 




export default function UISchemaEditorDemo() {
  // JSON schema used by RJSF
  const [jsonSchema, setJsonSchema] = useState<any>(defaultJsonSchema)
  // UI schema used by your custom UI editor + form
  const [schema, setSchema] = useState<any>(UISchema)
  const [showCleaned, setShowCleaned] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>("form")

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [pastedJSON, setPastedJSON] = useState<string>("")
  const [importError, setImportError] = useState<string>("")


  const fileInputRef = useRef<HTMLInputElement>(null)


  const handleExportClick = () => {
    // Build the structure: { schema, "ui-schema" }
    const data = {
      "schema": jsonSchema,
      "ui-schema": schema,
    }
    const fileName = "mySchema.json"
    const fileContent = JSON.stringify(data, null, 2)
    const blob = new Blob([fileContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const openImportModal = () => {
    setPastedJSON("")
    setImportError("")
    setIsModalOpen(true)
  }

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPastedJSON(e.target.value)
  }

  const handleFilePickerClick = () => {
    setImportError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string)
        processImportedData(data)
      } catch (err) {
        setImportError("Invalid JSON file." + err)
      }
    }
    reader.readAsText(file)
  }

  const handleImportConfirm = () => {
    if (!pastedJSON.trim()) {
      setImportError("Please paste valid JSON or upload a file.")
      return
    }
    try {
      const data = JSON.parse(pastedJSON)
      processImportedData(data)
    } catch (err) {
      setImportError("Invalid JSON in the text area. " + err)
    }
  }

  const processImportedData = (data: any): void => {
    if (data?.schema && data["ui-schema"]) {
      try {
        // 1) Generate a fresh UI schema from the imported JSON schema

        let resolvedSchema = data?.schema

        if (data?.schema?.definitions) {
          resolvedSchema = resolveSchema(data.schema)
        }

        const generatedUiSchema = generateUISchema(resolvedSchema)
  
        // 2) Normalize the existing "ui-schema" if you want to canonicalize keys
        const normalizedExistingUiSchema = normalizeSchema(data["ui-schema"])
  
        // 3) Deep merge the existing ui-schema into the newly generated one
        const finalUiSchema = deepMerge(normalizedExistingUiSchema, generatedUiSchema)
  
        // 4) Store results in state
        setJsonSchema(data.schema)
        setSchema(finalUiSchema)
  
        setIsModalOpen(false)
      } catch (err) {
        setImportError(`Error merging UI schema: ${err}`)
      }
    } else {
      setImportError("JSON must have top-level 'schema' and 'ui-schema' fields.")
    }
  }



  return (<>

    <div className=" min-h-screen p-8 overflow-y-hidden ">
      {/* Top Right Buttons (Import/Export) */}
      <div className="flex justify-end mb-4 gap-2">
        <Button onClick={openImportModal}>
          Import
        </Button>
        <Button variant="outline" onClick={handleExportClick}>
          Export
        </Button>
      </div>

      <div className="flex flex-wrap md:flex-nowrap gap-4 w-full">
 
  <div className="w-full md:w-1/2 border rounded p-4 h-[82vh] overflow-x-auto">
    <UISchemaEditor uiSchema={schema} onChange={setSchema} />
  </div>


  <div className="w-full md:w-1/2 border rounded p-4 h-[82vh] overflow-y-auto   ">
    <Tabs value={activeTab} className="space-y-4" onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="form">Form View</TabsTrigger>
        <TabsTrigger value="json">JSON View</TabsTrigger>
      </TabsList>

      <TabsContent value="form" className="overflow-x-auto pb-3">
        <ErrorBoundary fallback={<p className="text-red-500">An error occurred.</p>} resetKey={schema}>

          <ThemedForm
            schema={jsonSchema}
            uiSchema={cleanUiSchema(schema)}
            formData={{}}
            validator={validator}
            onChange={(e: any) => console.log("Form changed", e.formData)}
            onError={(errors: any) => alert(`Validation errors: ${JSON.stringify(errors)}`)}
            onSubmit={(e: any) => alert("formData " + JSON.stringify(e.formData))}
            showErrorList="top"
          />

           
         


          
        
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="json">
        <div className="p-4 rounded shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">UI Schema View</h2>
            <div className="flex items-center gap-2">
              <Switch
                checked={!showCleaned}
                onCheckedChange={(checked) => setShowCleaned(!checked)}
                id="schema-view-mode"
              />
              <span className="text-sm">Extended</span>
            </div>
          </div>
          <JsonView
            src={showCleaned ? cleanUiSchema(schema) : schema}
            theme="atom"
            enableClipboard={true}
            style={{ padding: 20, borderRadius: 8 }}
          />
        </div>
      </TabsContent>
    </Tabs>
  </div>
</div>





      {/* Modal for Import */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import JSON</DialogTitle>
            <DialogDescription>
              Paste valid JSON or upload a file with <code>schema</code> and <code>ui-schema</code> fields.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste JSON here..."
              value={pastedJSON}
              onChange={handlePasteChange}
            />
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleFilePickerClick}>
                Upload .json File
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".json"
                onChange={handleFileChange}
              />
            </div>
            {importError && <p className="text-red-500">{importError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportConfirm}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>)
}
