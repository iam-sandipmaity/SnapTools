
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import AnimatedElement from "@/components/animated-element";
import { useWorkspacePreference } from "@/hooks/use-workspace-preference";

const PasswordGenerator = () => {
  const [passwordLength, setPasswordLength] = useWorkspacePreference("pwd_length", 12);
  const [includeUppercase, setIncludeUppercase] = useWorkspacePreference("pwd_upper", true);
  const [includeLowercase, setIncludeLowercase] = useWorkspacePreference("pwd_lower", true);
  const [includeNumbers, setIncludeNumbers] = useWorkspacePreference("pwd_num", true);
  const [includeSymbols, setIncludeSymbols] = useWorkspacePreference("pwd_sym", true);
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const generatePassword = () => {
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const symbolChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let availableChars = "";
    let strength = 0;

    if (includeUppercase) {
      availableChars += uppercaseChars;
      strength += 1;
    }

    if (includeLowercase) {
      availableChars += lowercaseChars;
      strength += 1;
    }

    if (includeNumbers) {
      availableChars += numberChars;
      strength += 1;
    }

    if (includeSymbols) {
      availableChars += symbolChars;
      strength += 1;
    }

    if (availableChars === "") {
      toast.error("Please select at least one character type");
      return;
    }

    let generatedPassword = "";
    const availableLength = availableChars.length;

    // Ensure at least one character from each selected type
    if (includeUppercase) {
      generatedPassword += uppercaseChars.charAt(
        Math.floor(Math.random() * uppercaseChars.length)
      );
    }

    if (includeLowercase) {
      generatedPassword += lowercaseChars.charAt(
        Math.floor(Math.random() * lowercaseChars.length)
      );
    }

    if (includeNumbers) {
      generatedPassword += numberChars.charAt(
        Math.floor(Math.random() * numberChars.length)
      );
    }

    if (includeSymbols) {
      generatedPassword += symbolChars.charAt(
        Math.floor(Math.random() * symbolChars.length)
      );
    }

    // Fill the rest randomly
    for (let i = generatedPassword.length; i < passwordLength; i++) {
      const randomChar = availableChars.charAt(
        Math.floor(Math.random() * availableLength)
      );
      generatedPassword += randomChar;
    }

    // Shuffle the password
    generatedPassword = generatedPassword
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

    setPassword(generatedPassword);

    // Calculate strength based on length and character types
    let lengthStrength = 0;
    if (passwordLength > 8) lengthStrength = 1;
    if (passwordLength > 12) lengthStrength = 2;
    if (passwordLength >= 16) lengthStrength = 3;

    setPasswordStrength(strength + lengthStrength);
    toast.success("Password generated successfully!");
  };

  const copyToClipboard = () => {
    if (!password) {
      toast.error("Generate a password first");
      return;
    }

    navigator.clipboard.writeText(password)
      .then(() => {
        toast.success("Password copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy to clipboard");
      });
  };

  const getStrengthLabel = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 4) return "Fair";
    if (passwordStrength <= 6) return "Strong";
    return "Very Strong";
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 4) return "bg-yellow-500";
    if (passwordStrength <= 6) return "bg-green-500";
    return "bg-blue-500";
  };

  return (
    <AnimatedElement>
      <Card className="max-w-xl mx-auto">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <Input
              value={password}
              readOnly
              className="flex-1 font-mono"
              placeholder="Your password will appear here"
            />
            <Button onClick={copyToClipboard} variant="outline">
              Copy
            </Button>
          </div>

          {password && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Password Strength</span>
                <span className="text-sm font-medium">{getStrengthLabel()}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStrengthColor()}`}
                  style={{ width: `${(passwordStrength / 7) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="length">Password Length: {passwordLength}</Label>
            </div>
            <Slider
              id="length"
              min={6}
              max={32}
              step={1}
              value={[passwordLength]}
              onValueChange={(values) => setPasswordLength(values[0])}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase" className="cursor-pointer">
                Include Uppercase
              </Label>
              <Switch
                id="uppercase"
                checked={includeUppercase}
                onCheckedChange={setIncludeUppercase}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lowercase" className="cursor-pointer">
                Include Lowercase
              </Label>
              <Switch
                id="lowercase"
                checked={includeLowercase}
                onCheckedChange={setIncludeLowercase}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="numbers" className="cursor-pointer">
                Include Numbers
              </Label>
              <Switch
                id="numbers"
                checked={includeNumbers}
                onCheckedChange={setIncludeNumbers}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="symbols" className="cursor-pointer">
                Include Symbols
              </Label>
              <Switch
                id="symbols"
                checked={includeSymbols}
                onCheckedChange={setIncludeSymbols}
              />
            </div>
          </div>

          <Button onClick={generatePassword} className="w-full">
            Generate Password
          </Button>
        </CardContent>
      </Card>
    </AnimatedElement>
  );
};

export default PasswordGenerator;
