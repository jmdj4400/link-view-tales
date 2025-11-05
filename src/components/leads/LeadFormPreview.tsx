import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LeadFormPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formConfig: {
    title: string;
    description: string;
    collect_name: boolean;
    collect_phone: boolean;
    collect_message: boolean;
    button_text: string;
  };
}

export function LeadFormPreview({ open, onOpenChange, formConfig }: LeadFormPreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Form Preview</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">{formConfig.title}</h3>
            <p className="text-sm text-muted-foreground">{formConfig.description}</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="preview-email">Email *</Label>
              <Input id="preview-email" type="email" placeholder="your@email.com" disabled />
            </div>

            {formConfig.collect_name && (
              <div>
                <Label htmlFor="preview-name">Name</Label>
                <Input id="preview-name" placeholder="Your name" disabled />
              </div>
            )}

            {formConfig.collect_phone && (
              <div>
                <Label htmlFor="preview-phone">Phone</Label>
                <Input id="preview-phone" type="tel" placeholder="Your phone number" disabled />
              </div>
            )}

            {formConfig.collect_message && (
              <div>
                <Label htmlFor="preview-message">Message</Label>
                <Textarea id="preview-message" placeholder="Your message..." rows={4} disabled />
              </div>
            )}

            <Button className="w-full" disabled>
              {formConfig.button_text}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
