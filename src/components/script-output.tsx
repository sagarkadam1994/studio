"use client";

import { FileText, Sparkles, User, MapPin, CheckCircle2 } from "lucide-react";
import { type OutputData } from "@/app/page";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ScriptOutputProps {
  output: OutputData | null;
  reporter?: string;
  location?: string;
  isLoading: boolean;
}

export function ScriptOutput({
  output,
  reporter,
  location,
  isLoading,
}: ScriptOutputProps) {
  if (isLoading) {
    return <OutputSkeleton />;
  }

  if (!output) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-xl h-full min-h-[400px]">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-headline font-semibold text-foreground">आउटपुट</h3>
        <p className="text-muted-foreground">तुमचा निकाल येथे दिसेल.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <Card className="shadow-lg border-2 border-border/60">
        <CardHeader>
           <CardTitle className="font-headline text-xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>पुन्हा लिहिलेली स्क्रिप्ट</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed whitespace-pre-wrap">
            {output.rewrittenScript}
          </p>
           <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
              <Badge variant="outline" className="text-base p-2 flex items-center gap-2">
                <User className="h-4 w-4 text-accent" /> प्रतिनिधी: {reporter}
              </Badge>
              <Badge variant="outline" className="text-base p-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" /> ठिकाण: {location}
              </Badge>
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-2 border-border/60">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <span>ठळक बातम्या (Headlines)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {output.headlines.map((headline, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0"></div>
                <span className="text-base">{headline}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function OutputSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <Card className="shadow-lg">
                <CardHeader>
                    <Skeleton className="h-7 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex gap-4 mt-6 pt-4 border-t">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                </CardContent>
            </Card>
             <Card className="shadow-lg">
                <CardHeader>
                    <Skeleton className="h-7 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-3">
                   <Skeleton className="h-5 w-full" />
                   <Skeleton className="h-5 w-full" />
                   <Skeleton className="h-5 w-5/6" />
                   <Skeleton className="h-5 w-3/4" />
                </CardContent>
            </Card>
        </div>
    )
}
