import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, Clock } from "lucide-react";

interface LinkScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: {
    id: string;
    title: string;
    active_from: string | null;
    active_until: string | null;
  };
  onSave: (linkId: string, activeFrom: string | null, activeUntil: string | null) => Promise<void>;
}

export function LinkScheduleDialog({ open, onOpenChange, link, onSave }: LinkScheduleDialogProps) {
  const [activeFrom, setActiveFrom] = useState(
    link.active_from ? new Date(link.active_from).toISOString().slice(0, 16) : ""
  );
  const [activeUntil, setActiveUntil] = useState(
    link.active_until ? new Date(link.active_until).toISOString().slice(0, 16) : ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(
      link.id,
      activeFrom ? new Date(activeFrom).toISOString() : null,
      activeUntil ? new Date(activeUntil).toISOString() : null
    );
    setIsSaving(false);
    onOpenChange(false);
  };

  const handleClear = async () => {
    setIsSaving(true);
    await onSave(link.id, null, null);
    setActiveFrom("");
    setActiveUntil("");
    setIsSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Link</DialogTitle>
          <DialogDescription>
            Set when "{link.title}" should be active
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="active-from" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Active From (optional)
            </Label>
            <Input
              id="active-from"
              type="datetime-local"
              value={activeFrom}
              onChange={(e) => setActiveFrom(e.target.value)}
              placeholder="Leave empty for immediate activation"
            />
            <p className="text-xs text-muted-foreground">
              Link becomes active at this time. Leave empty to activate immediately.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="active-until" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Active Until (optional)
            </Label>
            <Input
              id="active-until"
              type="datetime-local"
              value={activeUntil}
              onChange={(e) => setActiveUntil(e.target.value)}
              placeholder="Leave empty for no expiration"
            />
            <p className="text-xs text-muted-foreground">
              Link becomes inactive after this time. Leave empty for no expiration.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={isSaving}
            className="sm:mr-auto"
          >
            Clear Schedule
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
