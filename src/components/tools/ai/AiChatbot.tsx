import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, User, Bot, Trash2, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AiChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m SnapBot, your AI assistant. How can I help you today?',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<'general' | 'code' | 'creative' | 'analytical'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulated AI responses based on model type
  const getAiResponse = (userMessage: string, selectedModel: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Code-related responses
    if (selectedModel === 'code' || lowerMessage.includes('code') || lowerMessage.includes('function') || lowerMessage.includes('programming')) {
      if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) {
        return `Here's a JavaScript example for you:

\`\`\`javascript
// Function to calculate factorial
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log(factorial(5)); // Output: 120
\`\`\`

This is a recursive function that calculates the factorial of a number. Would you like me to explain how it works?`;
      }
      if (lowerMessage.includes('python')) {
        return `Here's a Python solution:

\`\`\`python
# Function to calculate factorial
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))  # Output: 120
\`\`\`

Python uses indentation instead of braces. Need help with any other Python concepts?`;
      }
      return `I can help with coding! I support:
• JavaScript/TypeScript
• Python
• Java, C++, C#
• And many more languages

What specific coding help do you need?`;
    }

    // Creative responses
    if (selectedModel === 'creative') {
      return `That's an interesting topic! Let me share a creative perspective:

✨ **Creative Idea**: ${userMessage.split(' ').slice(0, 3).join(' ').toUpperCase()} - A New Approach

Imagine if we could reimagine this completely. What if the solution isn't in the obvious path, but in exploring uncharted territories?

Here are some creative angles to consider:
1. **Think backwards** - Start from the desired outcome
2. **Combine unrelated concepts** - Innovation often comes from fusion
3. **Break the rules** - Sometimes constraints limit creativity

Would you like me to elaborate on any of these? 🎨`;
    }

    // Analytical responses
    if (selectedModel === 'analytical') {
      return `Let me analyze this systematically:

**Analysis of: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"**

📊 **Key Components:**
• Input factors: Multiple variables identified
• Process flow: Linear with potential optimization points
• Output expectations: Measurable results needed

📈 **Data Points:**
• Complexity: ${userMessage.length > 100 ? 'High' : userMessage.length > 50 ? 'Medium' : 'Low'}
• Scope: ${userMessage.split(' ').length} words analyzed
• Sentiment: ${lowerMessage.includes('good') || lowerMessage.includes('great') ? 'Positive' : lowerMessage.includes('bad') || lowerMessage.includes('terrible') ? 'Negative' : 'Neutral'}

**Recommendation:** Proceed with structured approach, monitoring key metrics.

Need deeper analysis on any specific aspect?`;
    }

    // General responses (default)
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi ') || lowerMessage.includes('hey')) {
      return `Hello there! 👋 Great to meet you! I'm here to help with:
      
• **General questions** - Ask me anything
• **Code help** - Switch to Code mode for programming help
• **Creative ideas** - Try Creative mode for brainstorming
• **Analysis** - Use Analytical mode for data-driven insights

What would you like to explore today?`;
    }

    if (lowerMessage.includes('help')) {
      return `I'd be happy to help! Here's what I can do:

🔧 **General Assistance**
• Answer questions on various topics
• Provide explanations and summaries
• Help with research and learning

💻 **Code Mode** (switch above)
• Generate code examples
• Debug issues
• Explain programming concepts

🎨 **Creative Mode**
• Brainstorm ideas
• Write content
• Creative problem-solving

📊 **Analytical Mode**
• Data analysis
• Structured breakdowns
• Metric-based insights

Just ask your question or switch modes above!`;
    }

    // Default response
    return `That's an interesting point about "${userMessage.substring(0, 30)}${userMessage.length > 30 ? '...' : ''}". 

Let me share my thoughts:

**Key Insights:**
1. This topic has multiple dimensions to consider
2. Context matters - could you provide more details?
3. I can offer a more targeted response with additional information

**Suggested Next Steps:**
• Ask a specific question
• Switch to a specialized mode (Code/Creative/Analytical)
• Provide more context for deeper analysis

What aspect would you like to explore further? 🤔`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      const aiResponse: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: getAiResponse(inputMessage, model),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      toast.success('Response generated!');
    } catch (error) {
      toast.error('Error generating response');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: 'Hello! I\'m SnapBot, your AI assistant. How can I help you today?',
        timestamp: new Date(),
      }
    ]);
    toast.success('Chat cleared!');
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied!');
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Chatbot - Professional Grade
            </span>
            <Badge variant="outline" className="capitalize">{model} Mode</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Model Selection */}
          <div className="space-y-2">
            <Label>Chat Mode</Label>
            <Select value={model} onValueChange={(v) => setModel(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">🔧 General - All-purpose assistant</SelectItem>
                <SelectItem value="code">💻 Code - Programming help</SelectItem>
                <SelectItem value="creative">🎨 Creative - Brainstorming</SelectItem>
                <SelectItem value="analytical">📊 Analytical - Data-driven insights</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chat Messages */}
          <div className="h-[400px] overflow-y-auto space-y-4 p-4 bg-muted rounded-lg">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.role === 'assistant' ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-6 w-6 p-0"
                      onClick={() => copyMessage(message.content)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-background border p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder={
                model === 'general' ? 'Ask me anything...' :
                model === 'code' ? 'Ask about programming...' :
                model === 'creative' ? 'Share your creative ideas...' :
                'Enter data for analysis...'
              }
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
            <Button variant="outline" onClick={clearChat}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              About AI Chatbot
            </h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>How it works:</strong> Our AI assistant provides intelligent responses 
                tailored to your selected mode - General, Code, Creative, or Analytical.
              </p>
              <p>
                <strong>Features:</strong> Multiple chat modes, conversation history, 
                copy-to-clipboard, real-time responses, and mode-specific expertise.
              </p>
              <p>
                <strong>Note:</strong> This demo uses pattern matching. In production, 
                this would connect to advanced AI models like GPT-4, Claude, or Sarvam AI 
                for human-like conversations.
              </p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Perfect for:</p>
              <div className="flex flex-wrap gap-2">
                {['Quick Questions', 'Code Help', 'Brainstorming', 'Data Analysis', 'Learning', 'Problem-Solving'].map(use => (
                  <Badge key={use} variant="outline">{use}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiChatbot;
