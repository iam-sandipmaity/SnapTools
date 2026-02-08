
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { ArrowLeftRight, Copy, FileJson, FileText, Download } from "lucide-react";
import Papa from "papaparse";

const CsvJsonConverter = () => {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [mode, setMode] = useState<"csv2json" | "json2csv">("csv2json");

    const convert = () => {
        if (!input.trim()) {
            toast.error("Please enter some input data.");
            return;
        }

        try {
            if (mode === "csv2json") {
                const results = Papa.parse(input, { header: true, skipEmptyLines: true });
                if (results.errors.length > 0) {
                    toast.error("Error parsing CSV: " + results.errors[0].message);
                    return;
                }
                setOutput(JSON.stringify(results.data, null, 2));
                toast.success("Converted CSV to JSON!");
            } else {
                // JSON to CSV
                const jsonData = JSON.parse(input);
                if (!Array.isArray(jsonData)) {
                    // Try to wrap in array if it's a single object
                    if (typeof jsonData === 'object') {
                        const csv = Papa.unparse([jsonData]);
                        setOutput(csv);
                        toast.success("Converted JSON Object to CSV!");
                        return;
                    }
                    toast.error("Input JSON must be an array of objects or a single object.");
                    return;
                }
                const csv = Papa.unparse(jsonData);
                setOutput(csv);
                toast.success("Converted JSON to CSV!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Conversion failed. Check your input format.");
        }
    };

    const swapMode = () => {
        setMode(mode === "csv2json" ? "json2csv" : "csv2json");
        setInput(output);
        setOutput("");
    };

    const copyOutput = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        toast.success("Copied to clipboard!");
    };

    const downloadOutput = () => {
        if (!output) return;
        const extension = mode === "csv2json" ? "json" : "csv";
        const mimeType = mode === "csv2json" ? "application/json" : "text/csv";

        const blob = new Blob([output], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `converted.${extension}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <AnimatedElement>
            <div className="max-w-4xl mx-auto space-y-6">
                <Card>
                    <CardHeader className="bg-primary text-primary-foreground p-4">
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center">
                                {mode === "csv2json" ? <FileText className="mr-2" size={20} /> : <FileJson className="mr-2" size={20} />}
                                {mode === "csv2json" ? "CSV to JSON Converter" : "JSON to CSV Converter"}
                            </span>
                            <Button variant="secondary" size="sm" onClick={swapMode}>
                                <ArrowLeftRight className="mr-2" size={16} /> Swap Mode
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="input">{mode === "csv2json" ? "CSV Input" : "JSON Input"}</Label>
                            <Textarea
                                id="input"
                                placeholder={mode === "csv2json" ? "Paste CSV here..." : "Paste JSON here..."}
                                className="h-[400px] font-mono text-xs"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="output">Output</Label>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={downloadOutput} disabled={!output}>
                                        <Download size={14} className="mr-1" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={copyOutput} disabled={!output}>
                                        <Copy size={14} className="mr-1" />
                                    </Button>
                                </div>
                            </div>
                            <Textarea
                                id="output"
                                readOnly
                                placeholder="Output will appear here..."
                                className="h-[400px] font-mono text-xs bg-muted"
                                value={output}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Button onClick={convert} className="w-full" size="lg">
                                Convert {mode === "csv2json" ? "CSV to JSON" : "JSON to CSV"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AnimatedElement>
    );
};

export default CsvJsonConverter;
