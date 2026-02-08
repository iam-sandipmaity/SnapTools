
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { FileSpreadsheet, Upload, X, ZoomIn, ZoomOut, Save, Download, Pencil, Trash2, Undo2, Search, ArrowUp, ArrowDown } from "lucide-react";
import * as XLSX from "xlsx";
import { Switch } from "@/components/ui/switch";

const ExcelViewer = () => {
    // Data States
    const [excelData, setExcelData] = useState<any[][]>([]);
    const [originalData, setOriginalData] = useState<any[][]>([]);
    const [fileName, setFileName] = useState<string | null>(null);

    // View States
    const [zoom, setZoom] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
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

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                if (parsedData.length > 0) {
                    setExcelData(parsedData as any[][]);
                    setOriginalData(parsedData as any[][]);
                    toast.success("Excel file loaded successfully!");
                } else {
                    toast.error("Excel file is empty.");
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to parse Excel file.");
            }
        };
        reader.readAsBinaryString(file);
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
        excelData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (String(cell).toLowerCase().includes(searchQuery.toLowerCase())) {
                    results.push({ rowIndex, colIndex });
                }
            });
        });

        setSearchResults(results);
        if (results.length > 0) {
            setCurrentResultIndex(0);
            scrollToCell(results[0].rowIndex, results[0].colIndex);
        } else {
            setCurrentResultIndex(-1);
        }

    }, [searchQuery, excelData]);

    const scrollToCell = (rowIndex: number, colIndex: number) => {
        // We rely on useEffect with currentResultIndex to trigger the scroll
    };

    // Scroll to the current result whenever it changes
    useEffect(() => {
        if (currentResultIndex >= 0 && searchResults.length > 0) {
            const activeCell = document.getElementById(`cell-${searchResults[currentResultIndex].rowIndex}-${searchResults[currentResultIndex].colIndex}`);
            if (activeCell) {
                activeCell.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        }
    }, [currentResultIndex, searchResults]);


    const nextSearchResult = () => {
        if (searchResults.length === 0) return;
        const nextIndex = (currentResultIndex + 1) % searchResults.length;
        setCurrentResultIndex(nextIndex);
        scrollToCell(searchResults[nextIndex].rowIndex, searchResults[nextIndex].colIndex);
    };

    const prevSearchResult = () => {
        if (searchResults.length === 0) return;
        const prevIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
        setCurrentResultIndex(prevIndex);
        scrollToCell(searchResults[prevIndex].rowIndex, searchResults[prevIndex].colIndex);
    };


    // Editing Logic
    const handleCellClick = (rowIndex: number, colIndex: number, value: any) => {
        if (!isEditing) return;
        setEditMode({ rowIndex, colIndex });
        setEditValue(value === undefined ? "" : String(value));
    };

    const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
    };

    const handleCellSave = () => {
        if (editMode) {
            const newData = [...excelData];
            // Ensure the row exists
            if (!newData[editMode.rowIndex]) {
                newData[editMode.rowIndex] = [];
            }
            newData[editMode.rowIndex][editMode.colIndex] = editValue;
            setExcelData(newData);
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
    const exportData = (format: 'xlsx' | 'csv' | 'json') => {
        if (excelData.length === 0) return;

        if (format === 'json') {
            // Convert to array of objects for better JSON structure
            // Assuming first row is header
            const headers = excelData[0];
            const rows = excelData.slice(1);
            const jsonData = rows.map(row => {
                const obj: any = {};
                headers.forEach((header: string, index: number) => {
                    obj[header] = row[index];
                });
                return obj;
            });

            const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
            downloadBlob(blob, `exported_data.json`);
        } else {
            const ws = XLSX.utils.aoa_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            if (format === 'csv') {
                XLSX.writeFile(wb, `exported_data.csv`, { bookType: 'csv' });
            } else {
                XLSX.writeFile(wb, `exported_data.xlsx`);
            }
        }
        toast.success(`Exported as ${format.toUpperCase()}`);
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
        setExcelData([...originalData]);
        toast.info("Changes reverted to original.");
    };

    const clearFile = () => {
        setExcelData([]);
        setOriginalData([]);
        setFileName(null);
        setZoom(1);
        setIsEditing(false);
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
                                Excel Viewer & Editor
                            </div>

                            {excelData.length > 0 && (
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
                        {!excelData.length ? (
                            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                                <Upload size={48} className="text-muted-foreground mb-4" />
                                <Label htmlFor="excel-upload" className="cursor-pointer mb-2 flex flex-col items-center">
                                    <span className="text-xl font-semibold text-primary hover:underline mb-1">Click to upload Excel file</span>
                                    <span className="text-sm text-muted-foreground">or drag and drop here</span>
                                </Label>
                                <Input
                                    id="excel-upload"
                                    type="file"
                                    accept=".xlsx, .xls"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                <div className="mt-4 text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                    Supported formats: .xlsx, .xls
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Toolbar */}
                                <div className="flex flex-wrap justify-between items-center bg-secondary p-3 rounded-md gap-4">
                                    <span className="font-medium flex items-center text-sm md:text-base truncate max-w-[200px]">
                                        <FileSpreadsheet className="mr-2" size={16} /> {fileName}
                                    </span>

                                    <div className="flex items-center gap-2 flex-wrap flex-1 justify-end">
                                        {/* Search Input */}
                                        <div className="flex items-center bg-background rounded-md border px-2 py-1 mr-2 w-full max-w-[250px]">
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

                                        <Button variant="outline" size="sm" onClick={resetData} disabled={!isEditing}>
                                            <Undo2 size={14} className="mr-1" /> Reset
                                        </Button>

                                        <Select onValueChange={(val: any) => exportData(val)}>
                                            <SelectTrigger className="w-[130px] h-8 text-xs">
                                                <Download className="mr-2 h-3 w-3" />
                                                <SelectValue placeholder="Export As" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                                                <SelectItem value="csv">CSV (.csv)</SelectItem>
                                                <SelectItem value="json">JSON (.json)</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Button variant="ghost" size="sm" onClick={clearFile} className="text-destructive hover:text-destructive h-8 w-8 p-0">
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Table Container */}
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
                                            <tbody>
                                                {excelData.map((row, rowIndex) => (
                                                    <tr key={rowIndex} className="border-b last:border-b-0">
                                                        {/* Row number */}
                                                        <td className="w-10 bg-muted/50 text-muted-foreground text-center text-xs select-none border-r sticky left-0 z-10">
                                                            {rowIndex + 1}
                                                        </td>
                                                        {row.map((cell: any, cellIndex: number) => {
                                                            const isMatch = searchResults[currentResultIndex]?.rowIndex === rowIndex && searchResults[currentResultIndex]?.colIndex === cellIndex;
                                                            const isResult = searchResults.some(r => r.rowIndex === rowIndex && r.colIndex === cellIndex);

                                                            return (
                                                                <td
                                                                    key={cellIndex}
                                                                    id={`cell-${rowIndex}-${cellIndex}`}
                                                                    className={`px-4 py-2 border-r min-w-[100px] max-w-[300px] truncate relative group 
                                                                        ${isEditing ? 'hover:bg-muted/20 cursor-text' : ''}
                                                                        ${isMatch ? 'bg-yellow-200 text-black' : isResult ? 'bg-yellow-100/50 text-foreground' : ''}
                                                                    `}
                                                                    onClick={() => handleCellClick(rowIndex, cellIndex, cell)}
                                                                    title={String(cell)}
                                                                >
                                                                    {editMode?.rowIndex === rowIndex && editMode?.colIndex === cellIndex ? (
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
                                                                        <span className="block truncate">{cell}</span>
                                                                    )}
                                                                </td>
                                                            )
                                                        })}
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
                                        {excelData.length} rows • {excelData[0]?.length || 0} columns
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

export default ExcelViewer;
