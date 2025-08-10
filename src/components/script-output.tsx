"use client";

import { FileText, Sparkles, CheckCircle2, User, MapPin, Youtube, ThumbsUp, Tags, FileSignature, Hash } from "lucide-react";
import { type OutputData } from "@/app/page";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScriptOutputProps {
  output: OutputData | null;
  isLoading: boolean;
}

export function ScriptOutput({
  output,
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
    <Card className="shadow-lg border-2 border-border/60">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span>आउटपुट</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="script">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="script">
              <FileText className="mr-2 h-4 w-4" /> स्क्रिप्ट
            </TabsTrigger>
            <TabsTrigger value="youtube">
              <Youtube className="mr-2 h-4 w-4" /> YouTube
            </TabsTrigger>
          </TabsList>
          <TabsContent value="script" className="pt-4">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm">
                  <Badge variant="secondary" className="flex items-center gap-2 py-1 px-3">
                      <User className="h-4 w-4" />
                      <span>प्रतिनिधी: <strong>{output.reporterName}</strong></span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-2 py-1 px-3">
                      <MapPin className="h-4 w-4" />
                      <span>ठिकाण: <strong>{output.location}</strong></span>
                  </Badge>
              </div>
              <div>
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mt-4 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>ठळक बातम्या (Headline Ticker)</span>
                </h4>
                <ul className="space-y-2 pl-2">
                  {output.headlines.map((headline, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0"></div>
                      <span className="text-base">{headline}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mt-4 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>पुन्हा लिहिलेली स्क्रिप्ट</span>
                </h4>
                <p className="text-lg leading-relaxed whitespace-pre-wrap border-l-4 border-primary/50 pl-4">
                  {output.rewrittenScript}
                </p>
                <p className="text-right text-sm text-muted-foreground mt-2">
                  Word Count: {output.wordCount}
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="youtube" className="pt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mb-2">
                  <Youtube className="h-5 w-5 text-primary" />
                  <span>YouTube Title</span>
                </h4>
                <p className="text-base border-l-4 border-primary/50 pl-4">
                  {output.youtube.youtubeTitle}
                </p>
              </div>
               <div>
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mb-2">
                  <ThumbsUp className="h-5 w-5 text-primary" />
                  <span>Thumbnail साठी वाक्य</span>
                </h4>
                <p className="text-base border-l-4 border-primary/50 pl-4">
                  {output.youtube.thumbnailText}
                </p>
              </div>
              <div>
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mb-2">
                  <FileSignature className="h-5 w-5 text-primary" />
                  <span>Description</span>
                </h4>
                <p className="text-base whitespace-pre-wrap border-l-4 border-primary/50 pl-4">
                  {output.youtube.description}
                </p>
              </div>
              <div>
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mb-2">
                  <Tags className="h-5 w-5 text-primary" />
                  <span>Tags</span>
                </h4>
                <div className="flex flex-wrap gap-2 pl-4">
                  {output.youtube.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mb-2">
                  <Hash className="h-5 w-5 text-primary" />
                  <span>Hashtags</span>
                </h4>
                <div className="flex flex-wrap gap-2 pl-4">
                  {output.youtube.hashtags.map((tag, index) => (
                    <Badge key={index} variant="outline">#{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function OutputSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <Card className="shadow-lg">
                <CardHeader>
                    <Skeleton className="h-7 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="grid w-full grid-cols-2 gap-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="pt-4 space-y-4">
                      <div className="flex gap-4">
                          <Skeleton className="h-8 w-1/3" />
                          <Skeleton className="h-8 w-1/3" />
                      </div>
                      <Skeleton className="h-7 w-1/3 mt-4" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-5/6" />

                      <Skeleton className="h-7 w-1/3 mt-4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
            </Card>
        </div>
    )
}
