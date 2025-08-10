"use client";

import { useState } from "react";
import { Newspaper } from "lucide-react";

import { ScriptForm, type ScriptFormData } from "@/components/script-form";
import { ScriptOutput } from "@/components/script-output";
import { generateScriptAndHeadlinesAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

export interface OutputData {
  rewrittenScript: string;
  headlines: string[];
  reporterName: string;
  location: string;
  wordCount: number;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<OutputData | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (data: ScriptFormData) => {
    setIsLoading(true);
    setOutput(null);

    try {
      const result = await generateScriptAndHeadlinesAction({
        originalScript: data.script,
      });
      if (result.error) {
        toast({
          variant: "destructive",
          title: "त्रुटी",
          description: result.error,
        });
      } else if (result.data) {
        setOutput(result.data);
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "त्रुटी",
        description: "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center gap-4 mb-8">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Newspaper className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground">
              बातमी संपादक
            </h1>
            <p className="text-lg text-muted-foreground font-headline">
              Batami Sampadak
            </p>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col gap-8">
            <ScriptForm onSubmit={handleGenerate} isLoading={isLoading} />
          </div>
          <div className="flex flex-col gap-8">
             <ScriptOutput
              output={output}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
