'use client';

import {useState, useTransition} from 'react';
import {z} from 'zod';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {generateScript} from '@/app/actions';
import {useToast} from '@/hooks/use-toast';
import {ToastAction} from './ui/toast';

const FormSchema = z.object({
  originalScript: z
    .string()
    .min(10, {message: 'कृपया किमान १० शब्द लिहा.'})
    .max(1000, {message: 'तुम्ही १००० पेक्षा जास्त शब्द लिहू शकत नाही.'}),
});

type FormValues = z.infer<typeof FormSchema>;

interface ScriptFormProps {
  onFormSubmit: (output: any) => void;
}

export function ScriptForm({onFormSubmit}: ScriptFormProps) {
  const [isPending, startTransition] = useTransition();
  const {toast} = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      originalScript: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const result = await generateScript(data.originalScript);

      if ('error' in result) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      } else {
        onFormSubmit(result.output);
      }
    });
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="p-6 space-y-4">
          <div className="flex flex-col space-y-1.5">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="originalScript"
            >
              इनपुट स्क्रिप्ट
            </label>
            <p className="text-sm text-muted-foreground">
              तुमची बातमी स्क्रिप्ट टाका.
            </p>
          </div>
          <Controller
            control={form.control}
            name="originalScript"
            render={({field}) => (
              <Textarea
                {...field}
                id="originalScript"
                placeholder="स्क्रिप्ट"
                className="resize-none"
                rows={10}
              />
            )}
          />
          {form.formState.errors.originalScript && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.originalScript.message}
            </p>
          )}
        </div>
        <div className="flex items-center p-6 pt-0">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Generating...' : 'पुन्हा लिहा आणि हेडलाईन मिळवा'}
          </Button>
        </div>
      </form>
    </div>
  );
}
