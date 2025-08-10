"use client";

import { useState, useEffect } from "react";
import { Newspaper, History } from "lucide-react";

import { ScriptForm, type ScriptFormData } from "@/components/script-form";
import { ScriptOutput } from "@/components/script-output";
import { generateScriptAndHeadlinesAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { GenerateYoutubeMetadataOutput } from "@/ai/flows/generate-youtube-metadata";
import { Button } from "@/components/ui/button";
import { HistorySidebar } from "@/components/history-sidebar";

export interface OutputData {
  rewrittenScript: string;
  headlines: string[];
  reporterName: string;
  location: string;
  wordCount: number;
  youtube: GenerateYoutubeMetadataOutput;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  input: ScriptFormData;
  output: OutputData;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<OutputData | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("scriptHistory");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  const addToHistory = (input: ScriptFormData, output: OutputData) => {
    const newEntry: HistoryEntry = {
      id: new Date().toISOString(),
      timestamp: new Date().toLocaleString(),
      input,
      output,
    };
    setHistory(prevHistory => {
      const updatedHistory = [newEntry, ...prevHistory];
      try {
        localStorage.setItem("scriptHistory", JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Failed to save history to localStorage", error);
      }
      return updatedHistory;
    });
  };

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
        addToHistory(data, result.data);
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

  const handleSelectHistory = (entry: HistoryEntry) => {
    // We would need to update the form as well, which is complex without a global state manager
    // For now, just show the output.
    setOutput(entry.output);
    setIsHistoryOpen(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("scriptHistory");
    } catch (error) {
      console.error("Failed to clear history from localStorage", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <header className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
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
          </div>
          <Button variant="outline" size="lg" onClick={() => setIsHistoryOpen(true)}>
            <History className="mr-2 h-5 w-5" />
            History
          </Button>
        </header>
        
        <HistorySidebar
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={history}
          onSelect={handleSelectHistory}
          onClear={handleClearHistory}
        />

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
       <footer className="bg-background border-t border-border mt-8">
        <div className="container mx-auto py-4 px-4 text-center text-muted-foreground text-sm">
          <p>
            क्रिएटर - <strong>सागर कदम</strong> | 'माझे कोकण न्यूज चॅनेल' साठी बनवले आहे.
          </p>
        </div>
      </footer>
    </div>
  );
}
