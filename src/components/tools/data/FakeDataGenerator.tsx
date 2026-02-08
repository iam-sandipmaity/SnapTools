
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { Database, Download, RefreshCw, Copy } from "lucide-react";
import { faker } from "@faker-js/faker";
import Papa from "papaparse";

const FakeDataGenerator = () => {
    const [numRows, setNumRows] = useState(10);
    const [fields, setFields] = useState<{ name: string, type: string }[]>([
        { name: "First Name", type: "firstName" },
        { name: "Last Name", type: "lastName" },
        { name: "Email", type: "email" },
        { name: "Phone", type: "phoneNumber" },
    ]);
    const [generatedData, setGeneratedData] = useState<any[]>([]);
    const [format, setFormat] = useState("json");

    const addField = () => {
        setFields([...fields, { name: "", type: "firstName" }]);
    };

    const removeField = (index: number) => {
        const newFields = [...fields];
        newFields.splice(index, 1);
        setFields(newFields);
    };

    const handleFieldChange = (index: number, key: string, value: string) => {
        const newFields = [...fields];
        newFields[index][key as keyof typeof newFields[0]] = value;
        setFields(newFields);
    };

    const generateData = () => {
        const data = [];
        for (let i = 0; i < numRows; i++) {
            const row: any = {};
            fields.forEach(field => {
                if (field.type === "uuid") row[field.name] = faker.string.uuid();
                else if (field.type === "firstName") row[field.name] = faker.person.firstName();
                else if (field.type === "lastName") row[field.name] = faker.person.lastName();
                else if (field.type === "fullName") row[field.name] = faker.person.fullName();
                else if (field.type === "email") row[field.name] = faker.internet.email();
                else if (field.type === "phoneNumber") row[field.name] = faker.phone.number();
                else if (field.type === "address") row[field.name] = faker.location.streetAddress();
                else if (field.type === "city") row[field.name] = faker.location.city();
                else if (field.type === "country") row[field.name] = faker.location.country();
                else if (field.type === "company") row[field.name] = faker.company.name();
                else if (field.type === "jobTitle") row[field.name] = faker.person.jobTitle();
                else if (field.type === "date") row[field.name] = faker.date.past().toISOString().split('T')[0];
                else if (field.type === "image") row[field.name] = faker.image.avatar();
                else if (field.type === "boolean") row[field.name] = faker.datatype.boolean();
                else if (field.type === "number") row[field.name] = faker.number.int({ min: 1, max: 1000 });
                else if (field.type === "lorem") row[field.name] = faker.lorem.sentence();
            });
            data.push(row);
        }
        setGeneratedData(data);
        toast.success(`Generated ${numRows} rows of fake data!`);
    };

    const downloadData = () => {
        if (generatedData.length === 0) {
            toast.error("Generate data first!");
            return;
        }

        let content = "";
        let mimeType = "";
        let extension = "";

        if (format === "json") {
            content = JSON.stringify(generatedData, null, 2);
            mimeType = "application/json";
            extension = "json";
        } else if (format === "csv") {
            content = Papa.unparse(generatedData);
            mimeType = "text/csv";
            extension = "csv";
        } else if (format === "sql") {
            // Basic SQL Insert generator
            const tableName = "fake_data";
            const keys = Object.keys(generatedData[0]);
            const columns = keys.join(", ");
            const values = generatedData.map(row =>
                `(${keys.map(k => typeof row[k] === 'string' ? `'${row[k].replace(/'/g, "''")}'` : row[k]).join(", ")})`
            ).join(",\n");
            content = `INSERT INTO ${tableName} (${columns}) VALUES \n${values};`;
            mimeType = "application/sql";
            extension = "sql";
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `fake_data.${extension}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copyData = () => {
        if (generatedData.length === 0) return;

        let content = "";
        if (format === "json") {
            content = JSON.stringify(generatedData, null, 2);
        } else if (format === "csv") {
            content = Papa.unparse(generatedData);
        } else if (format === "sql") {
            const tableName = "fake_data";
            const keys = Object.keys(generatedData[0]);
            const columns = keys.join(", ");
            const values = generatedData.map(row =>
                `(${keys.map(k => typeof row[k] === 'string' ? `'${row[k].replace(/'/g, "''")}'` : row[k]).join(", ")})`
            ).join(",\n");
            content = `INSERT INTO ${tableName} (${columns}) VALUES \n${values};`;
        }

        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
    }

    return (
        <AnimatedElement>
            <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardHeader className="bg-primary text-primary-foreground p-4">
                        <CardTitle className="flex items-center">
                            <Database className="mr-2" size={20} />
                            Fake Data Generator
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <Label>Data Fields</Label>
                                {fields.map((field, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <Input
                                            placeholder="Field Name"
                                            value={field.name}
                                            onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                                            className="flex-1"
                                        />
                                        <Select
                                            value={field.type}
                                            onValueChange={(val) => handleFieldChange(index, "type", val)}
                                        >
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="firstName">First Name</SelectItem>
                                                <SelectItem value="lastName">Last Name</SelectItem>
                                                <SelectItem value="fullName">Full Name</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="phoneNumber">Phone</SelectItem>
                                                <SelectItem value="address">Address</SelectItem>
                                                <SelectItem value="city">City</SelectItem>
                                                <SelectItem value="country">Country</SelectItem>
                                                <SelectItem value="company">Company</SelectItem>
                                                <SelectItem value="jobTitle">Job Title</SelectItem>
                                                <SelectItem value="date">Date</SelectItem>
                                                <SelectItem value="image">Image URL</SelectItem>
                                                <SelectItem value="boolean">Boolean</SelectItem>
                                                <SelectItem value="number">Number</SelectItem>
                                                <SelectItem value="uuid">UUID</SelectItem>
                                                <SelectItem value="lorem">Text</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button variant="ghost" size="icon" onClick={() => removeField(index)} disabled={fields.length <= 1}>
                                            <span className="text-red-500">×</span>
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addField} className="w-full">
                                    + Add Field
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="rows">Number of Rows</Label>
                                    <Input
                                        id="rows"
                                        type="number"
                                        min="1"
                                        max="1000"
                                        value={numRows}
                                        onChange={(e) => setNumRows(parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Export Format</Label>
                                    <Select value={format} onValueChange={setFormat}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Format" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="json">JSON</SelectItem>
                                            <SelectItem value="csv">CSV</SelectItem>
                                            <SelectItem value="sql">SQL Insert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button onClick={generateData} className="w-full" size="lg">
                                    <RefreshCw className="mr-2 h-4 w-4" /> Generate Data
                                </Button>
                            </div>
                        </div>

                        {generatedData.length > 0 && (
                            <div className="mt-8 border rounded-lg overflow-hidden bg-muted/20">
                                <div className="flex justify-between items-center bg-secondary p-3 border-b">
                                    <h3 className="font-medium text-sm">Preview (First 5 Rows)</h3>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" onClick={copyData}>
                                            <Copy size={16} className="mr-1" /> Copy
                                        </Button>
                                        <Button size="sm" variant="default" onClick={downloadData}>
                                            <Download size={16} className="mr-1" /> Download
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4 overflow-auto max-h-[400px]">
                                    {format === 'json' ? (
                                        <pre className="text-xs font-mono">{JSON.stringify(generatedData.slice(0, 5), null, 2)}</pre>
                                    ) : format === 'csv' ? (
                                        <pre className="text-xs font-mono">{Papa.unparse(generatedData.slice(0, 5))}</pre>
                                    ) : (
                                        <pre className="text-xs font-mono whitespace-pre-wrap">{
                                            (() => {
                                                const tableName = "fake_data";
                                                const keys = Object.keys(generatedData[0]);
                                                const columns = keys.join(", ");
                                                const values = generatedData.slice(0, 5).map(row =>
                                                    `(${keys.map(k => typeof row[k] === 'string' ? `'${row[k].replace(/'/g, "''")}'` : row[k]).join(", ")})`
                                                ).join(",\n");
                                                return `INSERT INTO ${tableName} (${columns}) VALUES \n${values}...;`;
                                            })()
                                        }</pre>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AnimatedElement>
    );
};

export default FakeDataGenerator;
