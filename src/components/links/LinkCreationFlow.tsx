import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, Link as LinkIcon, AlertTriangle, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { validateURL, sanitizeURL, isURLSafe } from "@/lib/url-utils";
import { LinkHealthChecker } from "./LinkHealthChecker";

interface LinkCreationFlowProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LinkCreationFlow({ onSuccess, onCancel }: LinkCreationFlowProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'input' | 'preview' | 'saving'>('input');
  const [link, setLink] = useState({ title: "", dest_url: "" });
  const [validation, setValidation] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async () => {
    if (!link.dest_url) {
      toast.error('Please enter a destination URL');
      return;
    }

    setIsValidating(true);
    
    // Validate URL
    const result = validateURL(link.dest_url);
    setValidation(result);

    if (result.isValid) {
      // Check if URL is safe
      const safetyCheck = isURLSafe(result.sanitized || link.dest_url);
      if (!safetyCheck.safe) {
        setValidation({
          ...result,
          warnings: [...result.warnings, `Security Warning: ${safetyCheck.reason}`]
        });
      }
      
      setStep('preview');
    } else {
      toast.error(result.issues[0] || 'Invalid URL');
    }

    setIsValidating(false);
  };

  const handleSave = async () => {
    setStep('saving');

    const sanitizedUrl = sanitizeURL(link.dest_url);
    
    const { error } = await supabase
      .from('links')
      .insert({
        user_id: user?.id,
        title: link.title || 'Untitled Link',
        dest_url: link.dest_url,
        sanitized_dest_url: sanitizedUrl,
        position: 0,
      });

    if (error) {
      console.error('Error creating link:', error);
      toast.error('Failed to create link', {
        description: 'Please check your input and try again'
      });
      setStep('preview');
      return;
    }

    toast.success('Link created successfully!', {
      description: 'Your tracking link is ready to share'
    });
    if (onSuccess) onSuccess();
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          {step === 'input' ? 'Create New Link' : step === 'preview' ? 'Link Preview' : 'Saving...'}
        </CardTitle>
        <CardDescription>
          {step === 'input' && 'Add a destination URL to track clicks and engagement'}
          {step === 'preview' && 'Review your link before saving'}
          {step === 'saving' && 'Creating your link...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'input' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">Link Title</Label>
              <Input
                id="title"
                placeholder="My Website"
                value={link.title}
                onChange={(e) => setLink({ ...link, title: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">Optional: Give your link a memorable name</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url" className="text-base">Destination URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/your-content"
                value={link.dest_url}
                onChange={(e) => setLink({ ...link, dest_url: e.target.value })}
                required
              />
              <p className="text-sm text-muted-foreground leading-relaxed">
                We automatically <strong>clean UTMs</strong>, <strong>unwrap social wrappers</strong>, and <strong>repair broken redirects</strong> for you.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button 
                onClick={handleValidate} 
                disabled={!link.dest_url || isValidating}
                size="lg"
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Preview Link
              </Button>
            </div>
          </>
        )}

        {step === 'preview' && validation && (
          <>
            {/* Validation Summary */}
            {validation.isValid && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-900 dark:text-green-100">
                  URL looks good! Ready to track clicks.
                </AlertDescription>
              </Alert>
            )}

            {validation.warnings.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-900 dark:text-yellow-100">
                  <div className="space-y-1">
                    <p className="font-medium">Warnings detected:</p>
                    {validation.warnings.map((warning: string, i: number) => (
                      <p key={i} className="text-sm">• {warning}</p>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Link Health Check */}
            <LinkHealthChecker url={validation.sanitized || link.dest_url} />

            {/* Link Preview */}
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Link Preview</p>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Title</p>
                <p className="font-medium">{link.title || 'Untitled Link'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="text-sm font-mono break-all">{validation.sanitized || link.dest_url}</p>
              </div>
              {validation.estimatedHops > 1 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Estimated Redirects</p>
                  <p className="text-sm">{validation.estimatedHops} hops</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setStep('input')}>
                Back
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Create Link
              </Button>
            </div>
          </>
        )}

        {step === 'saving' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-base text-muted-foreground">Creating your tracking link...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
