'use client';

import {
  FileText,
  Sparkles,
  CheckCircle2,
  User,
  MapPin,
  Youtube,
  ThumbsUp,
  Tags,
  FileSignature,
  Hash,
  Globe,
  Link,
  ClipboardCopy,
  UploadCloud,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { type OutputData } from '@/app/page';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { postToWebsiteAction } from '@/app/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';


interface ScriptOutputProps {
  output: OutputData | null;
  isLoading: boolean;
}

interface PostResult {
    success: boolean;
    message: string;
    url?: string;
    details?: string;
}


export function ScriptOutput({ output, isLoading }: ScriptOutputProps) {
  const { toast } = useToast();
  const [isPosting, setIsPosting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [postResult, setPostResult] = useState<PostResult | null>(null);

  const handleCopy = (textToCopy: string, type: string) => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast({
          title: 'कॉपी केले!',
          description: `${type} यशस्वीरित्या कॉपी केले आहे.`,
        });
      })
      .catch((err) => {
        toast({
          variant: 'destructive',
          title: 'त्रुटी',
          description: 'कॉपी करण्यात अयशस्वी.',
        });
        console.error('Failed to copy text: ', err);
      });
  };

  const handlePostToWebsite = async () => {
    if (!output) return;
    setShowConfirmation(false);
    setIsPosting(true);
    setPostResult(null);

    try {
      const result = await postToWebsiteAction(output.website);
      if (result.data) {
        setPostResult(result.data);
         if (result.data.success) {
           toast({
             title: 'यशस्वीरित्या पोस्ट केले!',
             description: result.data.message,
           });
         } else {
            // Even if data is present, success might be false
            setPostResult({
                success: false,
                message: result.data.message || 'An error occurred.',
                details: result.data.details
            });
         }
      } else if (result.error) {
         setPostResult({
           success: false, 
           message: result.error, 
           details: (result as any).details || 'No additional details.'
          });
      } else {
         setPostResult({success: false, message: 'An unexpected error occurred.', details: 'The server action returned an empty response.'});
      }
    } catch (e: any) {
      setPostResult({success: false, message: 'Failed to call the server action.', details: e.message || 'An unknown client-side error occurred.'});
      console.error(e);
    } finally {
      setIsPosting(false);
    }
  };

  const createCopyText = {
    script: (output: OutputData) =>
      `प्रतिनिधी: ${output.reporterName}\n` +
      `ठिकाण: ${output.location}\n\n` +
      `ठळक बातम्या (Headline Ticker):\n${output.headlines.join('\n')}\n\n` +
      `पुन्हा लिहिलेली स्क्रिप्ट:\n${output.rewrittenScript}`,
    youtube: (output: OutputData) =>
      `YouTube Title: ${output.youtube.youtubeTitle}\n\n` +
      `Thumbnail साठी वाक्य: ${output.youtube.thumbnailText}\n\n` +
      `Description:\n${output.youtube.description}\n\n` +
      `Tags: ${output.youtube.tags.join(', ')}\n\n` +
      `Hashtags: ${output.youtube.hashtags.join(' ')}`,
    website: (output: OutputData) =>
      `Title: ${output.website.title}\n\n` +
      `Permalink: ${output.website.permalink}\n\n` +
      `Tags: ${output.website.tags.join(', ')}\n\n` +
      `Category: ${output.website.category}\n\n` +
      `Article:\n${output.website.article}`,
  };

  if (isLoading) {
    return <OutputSkeleton />;
  }

  if (!output) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-xl h-full min-h-[400px]">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-headline font-semibold text-foreground">
          आउटपुट
        </h3>
        <p className="text-muted-foreground">तुमचा निकाल येथे दिसेल.</p>
      </div>
    );
  }

  return (
    <Card className="shadow-lg border-2 border-border/60">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>आउटपुट</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="script">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="script">
              <FileText className="mr-2 h-4 w-4" /> स्क्रिप्ट
            </TabsTrigger>
            <TabsTrigger value="youtube">
              <Youtube className="mr-2 h-4 w-4" /> YouTube
            </TabsTrigger>
            <TabsTrigger value="website">
              <Globe className="mr-2 h-4 w-4" /> Website
            </TabsTrigger>
          </TabsList>
          <TabsContent value="script" className="pt-4 space-y-4">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 py-1 px-3"
                >
                  <User className="h-4 w-4" />
                  <span>
                    प्रतिनिधी: <strong>{output.reporterName}</strong>
                  </span>
                </Badge>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2 py-1 px-3"
                >
                  <MapPin className="h-4 w-4" />
                  <span>
                    ठिकाण: <strong>{output.location}</strong>
                  </span>
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
             <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => handleCopy(createCopyText.script(output), 'स्क्रिप्ट माहिती')}
            >
              <ClipboardCopy className="mr-2 h-4 w-4" />
              सर्व स्क्रिप्ट माहिती कॉपी करा
            </Button>
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
                <p className="text-base pl-4">
                  {output.youtube.tags.join(', ')}
                </p>
              </div>
              <div>
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mb-2">
                  <Hash className="h-5 w-5 text-primary" />
                  <span>Hashtags</span>
                </h4>
                <p className="text-base pl-4">
                  {output.youtube.hashtags.join(' ')}
                </p>
              </div>
            </div>
             <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => handleCopy(createCopyText.youtube(output), 'YouTube माहिती')}
            >
              <ClipboardCopy className="mr-2 h-4 w-4" />
              सर्व YouTube माहिती कॉपी करा
            </Button>
          </TabsContent>
          <TabsContent value="website" className="pt-4">
             <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will publish the article directly to your website. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handlePostToWebsite}>Post to Website</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="space-y-4">
              <div>
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mb-2">
                  <FileSignature className="h-5 w-5 text-primary" />
                  <span>Title</span>
                </h4>
                <p className="text-base border-l-4 border-primary/50 pl-4">
                  {output.website.title}
                </p>
              </div>
              <div>
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mb-2">
                  <Link className="h-5 w-5 text-primary" />
                  <span>Permalink</span>
                </h4>
                <p className="text-base border-l-4 border-primary/50 pl-4">
                  {output.website.permalink}
                </p>
              </div>
               <div>
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mb-2">
                  <Tags className="h-5 w-5 text-primary" />
                  <span>Tags</span>
                </h4>
                <p className="text-base pl-4">
                  {output.website.tags.join(', ')}
                </p>
              </div>
               <div>
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mb-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>Category</span>
                </h4>
                <p className="text-base pl-4">
                  {output.website.category}
                </p>
              </div>
              <div>
                <h4 className="font-headline text-lg font-semibold flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Article</span>
                </h4>
                <div className="text-base whitespace-pre-wrap border-l-4 border-primary/50 pl-4" dangerouslySetInnerHTML={{ __html: output.website.article }} />
                <p className="text-right text-sm text-muted-foreground mt-2">
                  Word Count: {output.website.wordCount}
                </p>
              </div>
            </div>
             <div className="mt-6 flex flex-col gap-4">
                 <Button
                    onClick={() => setShowConfirmation(true)}
                    disabled={isPosting}
                    className="w-full text-lg py-6"
                >
                    {isPosting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Posting...
                        </>
                    ) : (
                        <>
                            <UploadCloud className="mr-2 h-5 w-5" />
                            Post to Website
                        </>
                    )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleCopy(createCopyText.website(output), 'वेबसाइट माहिती')}
                >
                  <ClipboardCopy className="mr-2 h-4 w-4" />
                  सर्व वेबसाइट माहिती कॉपी करा
                </Button>
              </div>
               {postResult && (
                  <div className={`mt-4 p-4 rounded-md text-sm ${postResult.success ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'}`}>
                    <p className="font-bold">{postResult.message}</p>
                    {postResult.details && (
                        <pre className="mt-2 text-xs whitespace-pre-wrap bg-black/10 dark:bg-black/20 p-2 rounded">
                          <code>{postResult.details}</code>
                        </pre>
                    )}
                    {postResult.success && postResult.url && (
                        <a href={postResult.url} target="_blank" rel="noopener noreferrer" className="underline mt-2 inline-block font-bold">
                            View Post
                        </a>
                    )}
                  </div>
              )}
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
          <div className="grid w-full grid-cols-3 gap-2">
            <Skeleton className="h-10 w-full" />
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
  );
}
