
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";

const BinaryConverter = () => {
  const { toolId } = useParams();
  const [binary, setBinary] = useState("");
  const [decimal, setDecimal] = useState("");
  const [hex, setHex] = useState("");
  const [activeTab, setActiveTab] = useState<"binary-decimal" | "binary-hex">(
    toolId === "binary-hex" ? "binary-hex" : "binary-decimal"
  );

  useEffect(() => {
    if (toolId === "binary-hex" || toolId === "binary-decimal") {
      setActiveTab(toolId);
    }
  }, [toolId]);

  // Validate binary input
  const validateBinary = (value: string): boolean => {
    return /^[01]*$/.test(value);
  };

  // Validate decimal input
  const validateDecimal = (value: string): boolean => {
    return /^\d*$/.test(value);
  };

  // Validate hex input
  const validateHex = (value: string): boolean => {
    return /^[0-9A-Fa-f]*$/.test(value);
  };

  // Binary to Decimal conversion
  const convertBinaryToDecimal = () => {
    if (!binary) {
      toast.error("Please enter a binary number");
      return;
    }

    if (!validateBinary(binary)) {
      toast.error("Invalid binary input. Only 0 and 1 are allowed.");
      return;
    }

    try {
      const result = parseInt(binary, 2);
      setDecimal(result.toString());
      toast.success("Conversion successful");
    } catch (error) {
      toast.error("Conversion failed");
    }
  };

  // Decimal to Binary conversion
  const convertDecimalToBinary = () => {
    if (!decimal) {
      toast.error("Please enter a decimal number");
      return;
    }

    if (!validateDecimal(decimal)) {
      toast.error("Invalid decimal input. Only digits are allowed.");
      return;
    }

    try {
      const decimalValue = parseInt(decimal, 10);
      if (decimalValue < 0) {
        toast.error("Please enter a positive number");
        return;
      }
      const result = decimalValue.toString(2);
      setBinary(result);
      toast.success("Conversion successful");
    } catch (error) {
      toast.error("Conversion failed");
    }
  };

  // Binary to Hex conversion
  const convertBinaryToHex = () => {
    if (!binary) {
      toast.error("Please enter a binary number");
      return;
    }

    if (!validateBinary(binary)) {
      toast.error("Invalid binary input. Only 0 and 1 are allowed.");
      return;
    }

    try {
      const decimal = parseInt(binary, 2);
      const result = decimal.toString(16).toUpperCase();
      setHex(result);
      toast.success("Conversion successful");
    } catch (error) {
      toast.error("Conversion failed");
    }
  };

  // Hex to Binary conversion
  const convertHexToBinary = () => {
    if (!hex) {
      toast.error("Please enter a hexadecimal number");
      return;
    }

    if (!validateHex(hex)) {
      toast.error("Invalid hex input. Only 0-9 and A-F are allowed.");
      return;
    }

    try {
      const decimal = parseInt(hex, 16);
      const result = decimal.toString(2);
      setBinary(result);
      toast.success("Conversion successful");
    } catch (error) {
      toast.error("Conversion failed");
    }
  };

  const resetFields = () => {
    setBinary("");
    setDecimal("");
    setHex("");
  };

  return (
    <AnimatedElement>
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Binary Conversion Tool</CardTitle>
          <CardDescription>
            Convert between binary, decimal and hexadecimal number systems
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs 
            defaultValue="binary-decimal" 
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "binary-decimal" | "binary-hex")}
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="binary-decimal">Binary ⇄ Decimal</TabsTrigger>
              <TabsTrigger value="binary-hex">Binary ⇄ Hexadecimal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="binary-decimal" className="mt-6">
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="binary-input">Binary</Label>
                    <Input
                      id="binary-input"
                      placeholder="Enter binary (e.g. 1010)"
                      value={binary}
                      onChange={(e) => setBinary(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="space-x-2">
                      <Button onClick={convertBinaryToDecimal} size="sm">
                        Binary to Decimal ↓
                      </Button>
                      <Button onClick={convertDecimalToBinary} size="sm">
                        ↑ Decimal to Binary
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="decimal-output">Decimal</Label>
                    <Input
                      id="decimal-output"
                      placeholder="Decimal result"
                      value={decimal}
                      onChange={(e) => setDecimal(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="binary-hex" className="mt-6">
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="binary-hex-input">Binary</Label>
                    <Input
                      id="binary-hex-input"
                      placeholder="Enter binary (e.g. 1010)"
                      value={binary}
                      onChange={(e) => setBinary(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="space-x-2">
                      <Button onClick={convertBinaryToHex} size="sm">
                        Binary to Hex ↓
                      </Button>
                      <Button onClick={convertHexToBinary} size="sm">
                        ↑ Hex to Binary
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="hex-output">Hexadecimal</Label>
                    <Input
                      id="hex-output"
                      placeholder="Hexadecimal result"
                      value={hex}
                      onChange={(e) => setHex(e.target.value.toUpperCase())}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={resetFields}>
              Reset Fields
            </Button>
          </div>
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default BinaryConverter;
