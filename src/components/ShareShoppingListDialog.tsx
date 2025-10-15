import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Share2 } from "lucide-react";

interface ShareShoppingListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export function ShareShoppingListDialog({ isOpen, onClose, shareUrl }: ShareShoppingListDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy link to clipboard");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-emerald-600" />
            Share Shopping List
          </DialogTitle>
          <DialogDescription>Share your consolidated shopping list with anyone using this link</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {shareUrl ? (
            <>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1 font-mono text-sm" onClick={(e) => e.currentTarget.select()} />
                <Button onClick={handleCopy} variant="outline" className="flex-shrink-0">
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  <strong>✓ Link created!</strong>
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">Anyone with this link can view the consolidated ingredients, even without logging in. Individual recipes are not shared.</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={onClose} className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600">
                  Done
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-red-600">
              <p>Failed to generate share link. Please try again.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
