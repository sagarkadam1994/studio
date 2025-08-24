'use client';

import {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import Confetti from 'react-confetti';
import {Button} from './ui/button';

interface ScriptOutputProps {
  output: {
    rewrittenScript: string;
    reporterName: string;
    location: string;
    headlines: string[];
    wordCount: number;
    youtube: {
      youtubeTitle: string;
      thumbnailText: string;
      description: string;
      tags: string[];
      hashtags: string[];
    };
    website: {
      title: string;
      permalink: string;
      article: string;
      tags: string[];
      category: string;
      wordCount: number;
    };
  } | null;
}

export function ScriptOutput({output}: ScriptOutputProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  if (!output) {
    return (
      <div className="flex items-center justify-center h-full p-8 border rounded-lg">
        <div className="text-center">
          <div className="mb-4 text-4xl">📄</div>
          <h3 className="text-lg font-semibold">आउटपुट</h3>
          <p className="text-sm text-muted-foreground">
            तुमचा निकाल येथे दिसेल.
          </p>
        </div>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="relative">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}
      <Tabs defaultValue="script">
        <TabsList>
          <TabsTrigger value="script">स्क्रिप्ट</TabsTrigger>
          <TabsTrigger value="youtube">यूट्यूब</TabsTrigger>
          <TabsTrigger value="website">वेबसाइट</TabsTrigger>
        </TabsList>
        <TabsContent value="script">
          <Card>
            <CardHeader>
              <CardTitle>पुन्हा लिहिलेली स्क्रिप्ट</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">स्क्रिप्ट</h4>
                  <p className="text-muted-foreground">
                    {output.rewrittenScript}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(output.rewrittenScript)}
                  >
                    Copy
                  </Button>
                </div>
                <div>
                  <h4 className="font-semibold">रिपोर्टर</h4>
                  <p className="text-muted-foreground">{output.reporterName}</p>
                </div>
                <div>
                  <h4 className="font-semibold">ठिकाण</h4>
                  <p className="text-muted-foreground">{output.location}</p>
                </div>
                <div>
                  <h4 className="font-semibold">हेडलाईन्स</h4>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {output.headlines.map((headline, index) => (
                      <li key={index}>{headline}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold">शब्द संख्या</h4>
                  <p className="text-muted-foreground">{output.wordCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="youtube">
          <Card>
            <CardHeader>
              <CardTitle>यूट्यूब मेटाडेटा</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">टाइटल</h4>
                  <p className="text-muted-foreground">
                    {output.youtube.youtubeTitle}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(output.youtube.youtubeTitle)}
                  >
                    Copy
                  </Button>
                </div>
                <div>
                  <h4 className="font-semibold">थंबनेल टेक्स्ट</h4>
                  <p className="text-muted-foreground">
                    {output.youtube.thumbnailText}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(output.youtube.thumbnailText)}
                  >
                    Copy
                  </Button>
                </div>
                <div>
                  <h4 className="font-semibold">वर्णन</h4>
                  <p className="text-muted-foreground">
                    {output.youtube.description}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(output.youtube.description)}
                  >
                    Copy
                  </Button>
                </div>
                <div>
                  <h4 className="font-semibold">टॅग्स</h4>
                  <div className="flex flex-wrap gap-2">
                    {output.youtube.tags.map((tag, index) => (
                      <Badge key={index}>{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">हॅशटॅग्स</h4>
                  <div className="flex flex-wrap gap-2">
                    {output.youtube.hashtags.map((hashtag, index) => (
                      <Badge key={index} variant="secondary">
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="website">
          <Card>
            <CardHeader>
              <CardTitle>वेबसाइट आर्टिकल</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">टाइटल</h4>
                  <p className="text-muted-foreground">{output.website.title}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(output.website.title)}
                  >
                    Copy
                  </Button>
                </div>
                <div>
                  <h4 className="font-semibold">पर्मलिंक</h4>
                  <p className="text-muted-foreground">
                    {output.website.permalink}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(output.website.permalink)}
                  >
                    Copy
                  </Button>
                </div>
                <div>
                  <h4 className="font-semibold">आर्टिकल</h4>
                  <p className="text-muted-foreground">
                    {output.website.article}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(output.website.article)}
                  >
                    Copy
                  </Button>
                </div>
                <div>
                  <h4 className="font-semibold">टॅग्स</h4>
                  <div className="flex flex-wrap gap-2">
                    {output.website.tags.map((tag, index) => (
                      <Badge key={index}>{tag}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">कॅटेगरी</h4>
                  <p className="text-muted-foreground">
                    {output.website.category}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">शब्द संख्या</h4>
                  <p className="text-muted-foreground">
                    {output.website.wordCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
