import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Gauge } from "lucide-react";

interface ClickLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: {
    id: string;
    title: string;
    max_clicks: number | null;
    current_clicks: number;
  };
  onSave: (linkId: string, maxClicks: number | null) => Promise<void>;
}

export function ClickLimitDialog({ open, onOpenChange, link, onSave }: ClickLimitDialogProps) {
  const [maxClicks, setMaxClicks] = useState(link.max_clicks?.toString() || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(link.id, maxClicks ? parseInt(maxClicks) : null);
    setIsSaving(false);
    onOpenChange(false);
  };

  const remaining = link.max_clicks ? Math.max(0, link.max_clicks - link.current_clicks) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Click Limit</DialogTitle>
          <DialogDescription>
            Set maximum clicks for "{link.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="max-clicks" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Maximum Clicks
            </Label>
            <Input
              id="max-clicks"
              type="number"
              min="0"
              value={maxClicks}
              onChange={(e) => setMaxClicks(e.target.value)}
              placeholder="Leave empty for unlimited"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for unlimited clicks
            </p>
          </div>

          {link.current_clicks > 0 && (
            <div className="bg-muted rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Clicks:</span>
                <span className="font-medium">{link.current_clicks}</span>
              </div>
              {remaining !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className={`font-medium ${remaining === 0 ? 'text-destructive' : ''}`}>
                    {remaining}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
