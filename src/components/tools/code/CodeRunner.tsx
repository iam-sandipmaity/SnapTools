import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Code2, ExternalLink } from 'lucide-react';

const CodeRunner: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleRedirect = () => {
    window.open('https://runr.vercel.app/#code-runner', '_blank');
  };

  return (
    <Card
      className="p-8 text-center bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-center mb-6">
        <div className={`p-4 rounded-full bg-primary/10 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
          <Code2 className="w-8 h-8 text-primary" />
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
        Online Code Runner
      </h2>
      <p className="mb-8 text-muted-foreground text-lg">
        Execute your code instantly in our dedicated cloud environment for optimal performance and security
      </p>
      <Button
        onClick={handleRedirect}
        size="lg"
        className={`group transition-all duration-300 ${isHovered ? 'scale-105' : ''}`}
      >
        <span>Launch Code Runner</span>
        <ExternalLink className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
      </Button>
    </Card>
  );
};

export default CodeRunner;