import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ProfileQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileName: string;
  profileHandle: string;
  profileUrl: string;
}

export function ProfileQRDialog({ 
  open, 
  onOpenChange, 
  profileName, 
  profileHandle,
  profileUrl 
}: ProfileQRDialogProps) {
  const handleDownload = () => {
    const svg = document.getElementById('profile-qr-code-svg') as HTMLElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `linkpeek-${profileHandle}-qr.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("QR code downloaded successfully!");
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileName}'s LinkPeek Profile`,
          text: `Check out ${profileName}'s links on LinkPeek`,
          url: profileUrl,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error("Failed to share");
        }
      }
    } else {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile URL copied to clipboard!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Profile</DialogTitle>
          <DialogDescription>
            Download or share your QR code for @{profileHandle}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <QRCodeSVG
              id="profile-qr-code-svg"
              value={profileUrl}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <div className="flex gap-2 w-full">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">
              Scan this QR code to visit your profile
            </p>
            <p className="text-xs font-mono text-muted-foreground break-all">
              {profileUrl}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
