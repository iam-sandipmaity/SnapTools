
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { FileSpreadsheet, Pencil, Save, Trash2, Undo2, ZoomIn, ZoomOut, Download, Upload, Search, ArrowUp, ArrowDown } from "lucide-react";
import Papa from "papaparse";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

const CsvEditor = () => {
    // Data States
    const [csvData, setCsvData] = useState<string[][]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [originalData, setOriginalData] = useState<string[][]>([]);
    const [fileName, setFileName] = useState<string | null>(null);

    // View States
    const [zoom, setZoom] = useState(1);
    const [isEditing, setIsEditing] = useState(true);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    // Edit States
    const [editMode, setEditMode] = useState<{ rowIndex: number, colIndex: number } | null>(null);
    const [editValue, setEditValue] = useState("");

    // Search States
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{ rowIndex: number, colIndex: number }[]>([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // File Upload Handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);

        Papa.parse(file, {
            complete: (results) => {
                if (results.data && results.data.length > 0) {
                    const parsedData = results.data as string[][];
                    // Assume first row is header if more than 1 row, otherwise just data
                    if (parsedData.length > 0) {
                        setHeaders(parsedData[0]);
                        setCsvData(parsedData.slice(1));
                        setOriginalData(parsedData.slice(1)); // Backup for undo
                        toast.success("CSV loaded successfully!");
                    }
                } else {
                    toast.error("CSV file is empty or invalid.");
                }
            },
            header: false, // We handle headers manually to keep it simple array of arrays
            skipEmptyLines: true,
        });
    };

    // Zoom Controls
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

    // Keyboard Support (Ctrl + Scroll for Zoom, Ctrl + F for Search)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY < 0) handleZoomIn();
                else handleZoomOut();
            }
        };

        const container = tableContainerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
            window.removeEventListener('keydown', handleKeyDown);
        }

    }, []);

    // Search Logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setCurrentResultIndex(-1);
            return;
        }

        const results: { rowIndex: number, colIndex: number }[] = [];
        csvData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (String(cell).toLowerCase().includes(searchQuery.toLowerCase())) {
                    results.push({ rowIndex, colIndex });
                }
            });
        });

        setSearchResults(results);
        if (results.length > 0) {
            setCurrentResultIndex(0);
        } else {
            setCurrentResultIndex(-1);
        }

    }, [searchQuery, csvData]);

    const nextSearchResult = () => {
        if (searchResults.length === 0) return;
        const nextIndex = (currentResultIndex + 1) % searchResults.length;
        setCurrentResultIndex(nextIndex);
    };

    // Scroll to the current result whenever it changes
    useEffect(() => {
        if (currentResultIndex >= 0 && searchResults.length > 0) {
            const activeCell = document.getElementById(`csv-cell-${searchResults[currentResultIndex].rowIndex}-${searchResults[currentResultIndex].colIndex}`);
            if (activeCell) {
                activeCell.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        }
    }, [currentResultIndex, searchResults]);


    const prevSearchResult = () => {
        if (searchResults.length === 0) return;
        const prevIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
        setCurrentResultIndex(prevIndex);
    };


    // Editing Logic
    const handleCellClick = (rowIndex: number, colIndex: number, value: string) => {
        if (!isEditing) return;
        setEditMode({ rowIndex, colIndex });
        setEditValue(value);
    };

    const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
    };

    const handleCellSave = () => {
        if (editMode) {
            const newData = [...csvData];
            if (!newData[editMode.rowIndex]) {
                newData[editMode.rowIndex] = [];
            }
            newData[editMode.rowIndex][editMode.colIndex] = editValue;
            setCsvData(newData);
            setEditMode(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleCellSave();
        } else if (e.key === "Escape") {
            setEditMode(null);
        }
    };

    // Export Logic
    const exportData = (format: 'csv' | 'json') => {
        if (format === 'json') {
            const jsonData = csvData.map(row => {
                const obj: any = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index];
                });
                return obj;
            });

            const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
            downloadBlob(blob, `exported_data.json`);
            toast.success("Exported as JSON");

        } else {
            const dataToExport = [headers, ...csvData];
            const csv = Papa.unparse(dataToExport);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            downloadBlob(blob, fileName || "edited_data.csv");
            toast.success("Exported as CSV");
        }
    };

    const downloadBlob = (blob: Blob, name: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const resetData = () => {
        setCsvData([...originalData]);
        toast.info("Changes reverted to original.");
    };

    const clearAll = () => {
        setCsvData([]);
        setHeaders([]);
        setFileName(null);
        setOriginalData([]);
        setZoom(1);
        setIsEditing(true);
        setSearchQuery("");
        setSearchResults([]);
    };

    return (
        <AnimatedElement>
            <div className="space-y-6">
                <Card className="w-full">
                    <CardHeader className="bg-primary text-primary-foreground p-4">
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center">
                                <FileSpreadsheet className="mr-2" size={20} />
                                CSV Editor
                            </div>

                            {csvData.length > 0 && (
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2 bg-primary-foreground/10 p-1 rounded-md">
                                        <Switch
                                            id="edit-mode"
                                            checked={isEditing}
                                            onCheckedChange={setIsEditing}
                                        />
                                        <Label htmlFor="edit-mode" className="text-sm cursor-pointer select-none text-primary-foreground">Edit Mode</Label>
                                    </div>
                                </div>
                            )}

                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {!csvData.length ? (
                            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                                <Label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
                                    <FileSpreadsheet size={48} className="text-muted-foreground mb-4" />
                                    <span className="text-xl font-semibold text-primary hover:underline mb-1">Click to upload CSV</span>
                                    <span className="text-sm text-muted-foreground">or drag and drop here</span>
                                </Label>
                                <input
                                    id="csv-upload"
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex flex-wrap justify-between items-center bg-secondary p-3 rounded-md gap-4">
                                    <span className="font-medium flex items-center text-sm md:text-base truncate max-w-[200px]">
                                        <FileSpreadsheet className="mr-2" size={16} /> {fileName}
                                    </span>
                                    <div className="flex items-center gap-2 flex-wrap flex-1 justify-end">

                                        {/* Search Input */}
                                        <div className="flex items-center bg-background rounded-md border px-2 py-1 mr-2 w-full max-w-[200px]">
                                            <Search size={14} className="text-muted-foreground mr-2" />
                                            <input
                                                ref={searchInputRef}
                                                className="bg-transparent border-none outline-none text-sm w-full h-6"
                                                placeholder="Find (Ctrl+F)"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            {searchResults.length > 0 && (
                                                <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                    <span className="mr-2">{currentResultIndex + 1}/{searchResults.length}</span>
                                                    <button onClick={prevSearchResult} className="hover:text-foreground p-0.5"><ArrowUp size={12} /></button>
                                                    <button onClick={nextSearchResult} className="hover:text-foreground p-0.5"><ArrowDown size={12} /></button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Zoom Controls */}
                                        <div className="flex items-center bg-background rounded-md border mr-2">
                                            <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8">
                                                <ZoomOut size={14} />
                                            </Button>
                                            <span className="text-xs w-12 text-center select-none">{Math.round(zoom * 100)}%</span>
                                            <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8">
                                                <ZoomIn size={14} />
                                            </Button>
                                        </div>

                                        <Button variant="outline" size="sm" onClick={resetData}>
                                            <Undo2 size={14} className="mr-1" /> Reset
                                        </Button>

                                        <Select onValueChange={(val: any) => exportData(val)}>
                                            <SelectTrigger className="w-[130px] h-8 text-xs">
                                                <Download className="mr-2 h-3 w-3" />
                                                <SelectValue placeholder="Export As" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="csv">CSV (.csv)</SelectItem>
                                                <SelectItem value="json">JSON (.json)</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive h-8 w-8 p-0">
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>

                                <div
                                    ref={tableContainerRef}
                                    className="overflow-auto border rounded-md h-[600px] w-full bg-background relative select-none"
                                    style={{ cursor: isEditing ? 'text' : 'grab' }}
                                >
                                    <div
                                        style={{
                                            transform: `scale(${zoom})`,
                                            transformOrigin: 'top left',
                                            transition: 'transform 0.1s ease-out',
                                            minWidth: '100%',
                                            width: 'fit-content'
                                        }}
                                    >
                                        <table className="w-full text-sm text-left border-collapse">
                                            <thead className="bg-muted text-muted-foreground sticky top-0 z-10">
                                                <tr>
                                                    {/* Header Index */}
                                                    <th className="px-4 py-3 border-b font-medium w-10 text-center bg-muted">#</th>
                                                    {headers.map((header, index) => (
                                                        <th key={index} className="px-4 py-3 border-b font-medium min-w-[150px] border-r">
                                                            {header}
                                                        </th>
                                                    ))}
                                                    {/* Empty header for full width feel */}
                                                    <th className="border-b border-transparent"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {csvData.map((row, rowIndex) => (
                                                    <tr key={rowIndex} className="border-b hover:bg-muted/50">
                                                        {/* Row number */}
                                                        <td className="w-10 bg-muted/50 text-muted-foreground text-center text-xs select-none border-r sticky left-0 z-10">
                                                            {rowIndex + 1}
                                                        </td>
                                                        {row.map((cell, colIndex) => {
                                                            const isMatch = searchResults[currentResultIndex]?.rowIndex === rowIndex && searchResults[currentResultIndex]?.colIndex === colIndex;
                                                            const isResult = searchResults.some(r => r.rowIndex === rowIndex && r.colIndex === colIndex);

                                                            return (
                                                                <td
                                                                    key={colIndex}
                                                                    id={`csv-cell-${rowIndex}-${colIndex}`}
                                                                    className={`px-4 py-2 border-r min-w-[150px] max-w-[400px] truncate relative group h-10 
                                                                    ${isEditing ? 'hover:bg-muted/20 cursor-text' : ''}
                                                                    ${isMatch ? 'bg-yellow-200 text-black' : isResult ? 'bg-yellow-100/50 text-foreground' : ''}
                                                                `}
                                                                    onClick={() => handleCellClick(rowIndex, colIndex, cell)}
                                                                    title={cell}
                                                                >
                                                                    {editMode?.rowIndex === rowIndex && editMode?.colIndex === colIndex ? (
                                                                        <div className="absolute inset-0 z-20">
                                                                            <input
                                                                                autoFocus
                                                                                className="w-full h-full px-4 py-2 bg-background text-foreground outline-none ring-2 ring-primary"
                                                                                value={editValue}
                                                                                onChange={handleCellChange}
                                                                                onBlur={handleCellSave}
                                                                                onKeyDown={handleKeyDown}
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center justify-between group h-full">
                                                                            <span className="truncate w-full block">{cell}</span>
                                                                            {isEditing && <Pencil className="opacity-0 group-hover:opacity-100 h-3 w-3 text-muted-foreground flex-shrink-0 ml-1" />}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            )
                                                        })}
                                                        {/* Fill empty cells if row is shorter than header */}
                                                        {Array.from({ length: Math.max(0, headers.length - row.length) }).map((_, i) => (
                                                            <td key={`empty-${i}`} className="px-4 py-2 border-r last:border-r-0"></td>
                                                        ))}
                                                        {/* Empty spacer for full width feel */}
                                                        <td className="w-full border-b border-transparent"></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground px-1">
                                    <div>{isEditing ? 'Values are editable. Press Enter to save.' : 'Read-only mode.'}</div>
                                    <div>
                                        {csvData.length} rows • {headers.length} columns
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AnimatedElement>
    );
};

export default CsvEditor;
