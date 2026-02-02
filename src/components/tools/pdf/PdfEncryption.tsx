import { Shield, ArrowRight, Lock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedElement from "@/components/animated-element";
import { useNavigate } from "react-router-dom";

const PdfEncryption = () => {
  const navigate = useNavigate();

  return (
    <AnimatedElement className="space-y-6">
      <div className="border rounded-lg p-6 bg-gradient-to-br from-muted/40 to-muted/20 space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold">PDF Encryption</h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            PDF encryption feature is now integrated into our comprehensive PDF Viewer tool. 
            You can encrypt your PDFs with password protection directly from the viewer.
          </p>
        </div>

        <div className="bg-background/60 backdrop-blur border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            How to Encrypt a PDF:
          </h3>
          
          <ol className="space-y-3 text-sm text-muted-foreground ml-7">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-foreground min-w-[24px]">1.</span>
              <span>Go to the <strong className="text-foreground">PDF Viewer</strong> tool</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-foreground min-w-[24px]">2.</span>
              <span>Upload your PDF file using the Browse button</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-foreground min-w-[24px]">3.</span>
              <span>Click the <strong className="text-foreground">Shield icon (🛡️)</strong> in the action buttons</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-foreground min-w-[24px]">4.</span>
              <span>Select <strong className="text-foreground">"Add Password Protection"</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-foreground min-w-[24px]">5.</span>
              <span>Enter your desired password and click <strong className="text-foreground">"Export PDF"</strong></span>
            </li>
          </ol>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Note: Browser-based encryption is experimental. For production use, consider server-side encryption.</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate("/tools/pdf/pdf-viewer")}
            className="gap-2"
          >
            <FileText className="h-5 w-5" />
            Go to PDF Viewer
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-xs p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 flex items-start gap-3 shadow-sm">
          <span className="text-lg">🔒</span>
          <div>
            <p className="font-semibold mb-1 text-foreground">Privacy & Security</p>
            <p className="text-muted-foreground leading-relaxed">
              All encryption happens locally in your browser. Your PDF files never leave your device and are not uploaded to any server.
            </p>
          </div>
        </div>
      </div>
    </AnimatedElement>
  );
};

export default PdfEncryption;