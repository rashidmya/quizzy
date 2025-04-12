// sections/dashboard/quiz/view/components/quiz-share-dialog.tsx
import { useState } from "react";
import { Copy, Check, Share2, Link as LinkIcon, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface QuizShareDialogProps {
  quizUrl: string;
}

export default function QuizShareDialog({ quizUrl }: QuizShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(quizUrl);
    setCopied(true);
    toast.success("Quiz link copied to clipboard!");

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleEmailShare = () => {
    const subject = "Take my quiz";
    const body = `I've created a quiz I'd like to share with you. You can take it here: ${quizUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>Share quiz with others</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Quiz</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="link" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link" className="flex items-center gap-1">
              <LinkIcon className="h-4 w-4" />
              Link
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <Input value={quizUrl} readOnly className="flex-1" />
              <Button
                variant={copied ? "default" : "outline"}
                size="icon"
                className="flex-shrink-0"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Share this link with anyone you want to take the quiz. They won&apos;t
              need to create an account.
            </div>
          </TabsContent>

          <TabsContent value="email" className="mt-4 space-y-4">
            <Button
              variant="outline"
              className="w-full justify-center gap-2"
              onClick={handleEmailShare}
            >
              <Mail className="h-4 w-4" />
              Share via Email
            </Button>

            <div className="text-sm text-muted-foreground">
              This will open your default email client with a pre-filled message
              containing the quiz link.
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
