
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { MapPin, Copy, RefreshCw } from "lucide-react";
import { faker } from "@faker-js/faker";

interface Address {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

const RandomAddressGenerator = () => {
    const [numAddresses, setNumAddresses] = useState(1);
    const [country, setCountry] = useState("US");
    const [addresses, setAddresses] = useState<Address[]>([]);

    const generateAddresses = () => {
        const generated = [];
        for (let i = 0; i < numAddresses; i++) {
            let addr: Address = {
                street: faker.location.streetAddress(),
                city: faker.location.city(),
                state: faker.location.state(),
                zip: faker.location.zipCode(),
                country: faker.location.country(),
            };
            generated.push(addr);
        }
        setAddresses(generated);
        toast.success(`Generated ${numAddresses} addresses!`);
    };

    const copyToClipboard = () => {
        if (addresses.length === 0) return;
        const text = addresses.map(a => `${a.street}, ${a.city}, ${a.state} ${a.zip}, ${a.country}`).join("\n");
        navigator.clipboard.writeText(text);
        toast.success("Copied!");
    };

    return (
        <AnimatedElement>
            <div className="max-w-md mx-auto space-y-6">
                <Card>
                    <CardHeader className="bg-primary text-primary-foreground p-4">
                        <CardTitle className="flex items-center">
                            <MapPin className="mr-2" size={20} />
                            Random Address Generator
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="numAddresses">Number of Addresses</Label>
                            <Input
                                id="numAddresses"
                                type="number"
                                min="1"
                                max="50"
                                value={numAddresses}
                                onChange={(e) => setNumAddresses(parseInt(e.target.value))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Country (Format Only)</Label>
                            <Select value={country} onValueChange={setCountry}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="US">United States</SelectItem>
                                    <SelectItem value="UK">United Kingdom</SelectItem>
                                    <SelectItem value="DE">Germany</SelectItem>
                                    <SelectItem value="FR">France</SelectItem>
                                    <SelectItem value="JP">Japan</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Note: Faker.js generates random data, country specific formats might vary.</p>
                        </div>

                        <Button onClick={generateAddresses} className="w-full" size="lg">
                            <RefreshCw className="mr-2 h-4 w-4" /> Generate
                        </Button>

                        {addresses.length > 0 && (
                            <div className="mt-6 border rounded-lg bg-secondary/30 relative">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2"
                                    onClick={copyToClipboard}
                                >
                                    <Copy size={16} />
                                </Button>
                                <div className="p-4 max-h-[400px] overflow-y-auto space-y-4">
                                    {addresses.map((addr, index) => (
                                        <div key={index} className="p-3 bg-background rounded-md shadow-sm border">
                                            <div className="font-semibold">{addr.street}</div>
                                            <div>{addr.city}, {addr.state} {addr.zip}</div>
                                            <div className="text-sm text-muted-foreground">{addr.country}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AnimatedElement>
    );
};

export default RandomAddressGenerator;
