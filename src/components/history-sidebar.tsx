"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { History, Trash2 } from "lucide-react";
import { type HistoryEntry } from "@/app/page";

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export function HistorySidebar({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
}: HistorySidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-6 w-6" />
            Generation History
          </SheetTitle>
          <SheetDescription>
            Here you can see the history of your generated scripts.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {history.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {history.map((entry) => (
                  <AccordionItem value={entry.id} key={entry.id}>
                    <AccordionTrigger>
                      <div className="flex flex-col text-left">
                        <span className="font-semibold truncate">
                           {entry.output.youtube.youtubeTitle || "Untitled"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entry.timestamp}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-1">Original Script</h4>
                        <p className="text-sm text-muted-foreground bg-secondary p-2 rounded-md max-h-24 overflow-y-auto">
                           {entry.input.script}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => onSelect(entry)}
                      >
                        View this Output
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center text-muted-foreground py-10">
                <p>No history yet.</p>
                <p>Generate a script to see it here.</p>
              </div>
            )}
          </ScrollArea>
        </div>
        {history.length > 0 && (
          <SheetFooter>
            <Button
              variant="destructive"
              className="w-full"
              onClick={onClear}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear All History
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
