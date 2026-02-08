
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import AnimatedElement from "@/components/animated-element";
import { User, Copy, RefreshCw } from "lucide-react";
import { faker } from "@faker-js/faker";

const RandomNameGenerator = () => {
    const [numNames, setNumNames] = useState(1);
    const [gender, setGender] = useState("all");
    const [style, setStyle] = useState("full");
    const [generatedNames, setGeneratedNames] = useState<string[]>([]);

    const generateNames = () => {
        const names = [];
        for (let i = 0; i < numNames; i++) {
            let name = "";
            let firstName = "";
            let lastName = "";

            if (gender === "male") firstName = faker.person.firstName("male");
            else if (gender === "female") firstName = faker.person.firstName("female");
            else firstName = faker.person.firstName();

            lastName = faker.person.lastName();

            if (style === "full") name = `${firstName} ${lastName}`;
            else if (style === "firstName") name = firstName;
            else if (style === "lastName") name = lastName;
            else if (style === "username") name = faker.internet.username({ firstName, lastName });
            else if (style === "email") name = faker.internet.email({ firstName, lastName });

            names.push(name);
        }
        setGeneratedNames(names);
        toast.success(`Generated ${numNames} names!`);
    };

    const copyToClipboard = () => {
        if (generatedNames.length === 0) return;
        navigator.clipboard.writeText(generatedNames.join("\n"));
        toast.success("Copied to clipboard!");
    };

    return (
        <AnimatedElement>
            <div className="max-w-md mx-auto space-y-6">
                <Card>
                    <CardHeader className="bg-primary text-primary-foreground p-4">
                        <CardTitle className="flex items-center">
                            <User className="mr-2" size={20} />
                            Random Name Generator
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="numNames">Number of Names</Label>
                            <Input
                                id="numNames"
                                type="number"
                                min="1"
                                max="100"
                                value={numNames}
                                onChange={(e) => setNumNames(parseInt(e.target.value))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select value={gender} onValueChange={setGender}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Style</Label>
                            <Select value={style} onValueChange={setStyle}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Style" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full">Full Name</SelectItem>
                                    <SelectItem value="firstName">First Name</SelectItem>
                                    <SelectItem value="lastName">Last Name</SelectItem>
                                    <SelectItem value="username">Username</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={generateNames} className="w-full" size="lg">
                            <RefreshCw className="mr-2 h-4 w-4" /> Generate
                        </Button>

                        {generatedNames.length > 0 && (
                            <div className="mt-6 border rounded-lg bg-secondary/30 relative">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2"
                                    onClick={copyToClipboard}
                                >
                                    <Copy size={16} />
                                </Button>
                                <div className="p-4 max-h-[300px] overflow-y-auto">
                                    <ul className="space-y-1">
                                        {generatedNames.map((name, index) => (
                                            <li key={index} className="font-medium text-lg">{name}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AnimatedElement>
    );
};

export default RandomNameGenerator;
