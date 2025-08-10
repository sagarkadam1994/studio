"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  script: z
    .string()
    .min(50, { message: "कृपया किमान ५० अक्षरांची स्क्रिप्ट टाका." }),
});

export type ScriptFormData = z.infer<typeof formSchema>;

interface ScriptFormProps {
  onSubmit: (data: ScriptFormData) => void;
  isLoading: boolean;
}

export function ScriptForm({ onSubmit, isLoading }: ScriptFormProps) {
  const form = useForm<ScriptFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      script: "",
    },
  });

  return (
    <Card className="w-full shadow-lg border-2 border-border/60">
      <CardHeader>
        <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
                <Edit className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
                <CardTitle className="font-headline text-2xl">इनपुट स्क्रिप्ट</CardTitle>
                <CardDescription>तुमची बातमी स्क्रिप्ट टाका.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="script"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">स्क्रिप्ट</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="तुमची मूळ स्क्रिप्ट येथे पेस्ट करा..."
                      className="resize-y min-h-[200px] text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  जनरेट करत आहे...
                </>
              ) : (
                "पुन्हा लिहा आणि हेडलाइन मिळवा"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
