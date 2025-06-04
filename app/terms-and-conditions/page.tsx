import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Scan, 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Code2, 
  ExternalLink,
  Check,
  X,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TermsAndConditions() {
  // Last updated date for the terms
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
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">Last Updated: {lastUpdated}</Badge>
          </div>
          <p className="text-muted-foreground max-w-md">
            Terms of use for PDFXtract demonstration project
          </p>
        </div>
        
        {/* Open Source Notice */}
        <Card className="mb-6 border shadow-sm">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Code2 className="h-5 w-5" /> Open Source Project
            </h2>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-start gap-3">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  PDFXtract is an open source demonstration project available on GitHub under the MIT license. 
                  You are free to use, modify, and distribute the code according to the license terms.
                </p>
                <Link 
                  href="https://github.com/neozhu/pdfxtract" 
                  target="_blank" 
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                  View source code <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main content */}
        <Card className="mb-6 border shadow-sm">
          <CardContent className="p-6">
            <div className="prose prose-slate max-w-none">
              <h2 className="text-xl font-medium mb-4">Terms Summary</h2>
              
              <p className="mb-4">
                PDFXtract is a demonstration project for PDF processing. By using this service, you agree to these simplified terms.
              </p>
              
              {/* Key MIT License Points */}
              <div className="bg-muted/30 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-3">MIT License Key Points:</h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  <li className="flex items-start gap-2">
                    <div className="rounded-full p-1 bg-green-100 shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm">Permission to use, copy, modify</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full p-1 bg-green-100 shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm">Freedom to distribute the software</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full p-1 bg-green-100 shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm">License notice must be included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="rounded-full p-1 bg-green-100 shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm">Provided "as is" without warranty</span>
                  </li>
                </ul>
              </div>
                            
              {/* Usage Guidelines */}
              <div className="space-y-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" /> 
                    Permitted Uses
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Personal and commercial use</li>
                    <li>PDF conversion and extraction</li>
                    <li>Integration with your own systems</li>
                    <li>Code modification and redistribution</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <X className="h-5 w-5 text-red-500" /> 
                    Prohibited Uses
                  </h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Uploading content that infringes on IP rights</li>
                    <li>Using the service for illegal purposes</li>
                    <li>Attempting to compromise system security</li>
                  </ul>
                </div>
              </div>

              {/* Data Processing */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Data Processing</h3>
                <p className="mb-2">When you use PDFXtract:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Your documents are processed in-memory only</li>
                  <li>Uploaded files are not permanently stored</li>
                  <li>You retain all rights to your content</li>
                </ul>
              </div>
              
              {/* Disclaimer */}
              <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-yellow-800 mb-1">Disclaimer</h3>
                    <p className="text-sm text-yellow-700">
                      PDFXtract is provided "as is" without warranty of any kind. 
                      We are not liable for any damages resulting from your use of this service.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-6 pt-4 border-t">
                <FileText className="h-4 w-4" />
                <span>This is a simplified terms document for demonstration purposes.</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Bottom navigation */}
        <div className="flex justify-between items-center">
          <Link href="/privacy-policy">
            <Button variant="outline" size="sm" className="gap-1">
              <ExternalLink className="h-4 w-4" /> Privacy Policy
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
