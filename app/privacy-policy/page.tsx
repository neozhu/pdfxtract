import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Scan, 
  Shield, 
  ArrowLeft, 
  Check, 
  FileText, 
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPolicy() {
  // Last updated date for the policy
  const lastUpdated = "June 4, 2025";
  
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <Link href="/" className="flex items-center gap-2 transition-colors hover:text-primary">
            <Scan className="h-8 w-8" />
            <h2 className="text-2xl font-bold">PDFXtract</h2>
          </Link>
          <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>

        {/* Hero section */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="inline-block mb-4 p-3 rounded-full bg-primary/10">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">Last Updated: {lastUpdated}</Badge>
          </div>
          <p className="text-muted-foreground max-w-md">
            PDFXtract is built with your privacy in mind
          </p>
        </div>
        
        {/* Policy highlights */}
        <Card className="mb-6 border shadow-sm">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold text-primary">Key Points</h2>
          </CardHeader>
          <CardContent className="pt-2">
            <ul className="grid gap-3 sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <div className="rounded-full p-1 bg-green-100 shrink-0">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm">No storage of uploaded documents</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full p-1 bg-green-100 shrink-0">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm">In-memory processing only</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full p-1 bg-green-100 shrink-0">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm">No tracking of individual users</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full p-1 bg-green-100 shrink-0">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm">No selling of personal data</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      
        {/* Main content */}
        <Card className="mb-6 border shadow-sm">
          <CardContent className="p-6">
            <div className="prose prose-slate max-w-none">
              <h2 className="text-xl font-medium mb-4">Privacy Summary</h2>
              
              <p className="mb-4">PDFXtract is an open-source demonstration project that processes PDF files in-memory without storing your documents.</p>
              
              <h3 className="text-lg font-medium mt-6 mb-2">How We Handle Your Files</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Your PDF files are processed temporarily in-memory and never stored permanently</li>
                <li>After processing is complete, files are automatically deleted from memory</li>
                <li>All processing happens directly in your browser when possible</li>
              </ul>
              
              <h3 className="text-lg font-medium mt-6 mb-2">Technical Information</h3>
              <p className="mb-1">We may collect minimal technical information:</p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Basic device information (browser type, operating system)</li>
                <li>Anonymous usage statistics</li>
              </ul>
              
              <h3 className="text-lg font-medium mt-6 mb-2">Open Source Project</h3>
              <p className="mb-4">PDFXtract is an open-source demonstration project. You can review the source code on our GitHub repository to verify our privacy practices.</p>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-6 pt-4 border-t">
                <FileText className="h-4 w-4" />
                <span>This is a simplified privacy policy for demonstration purposes.</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Bottom navigation */}
        <div className="flex justify-between items-center">
          <Link href="/terms-and-conditions">
            <Button variant="outline" size="sm" className="gap-1">
              <ExternalLink className="h-4 w-4" /> Terms &amp; Conditions
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="default" size="sm">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
