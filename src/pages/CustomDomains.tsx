import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Globe, Plus, Trash2, RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle, ArrowLeft, Copy } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CustomDomain {
  id: string;
  domain: string;
  status: string;
  verification_token: string;
  verified_at: string | null;
  ssl_status: string;
  error_message: string | null;
  is_primary: boolean;
  created_at: string;
}

const statusConfig = {
  verifying: { label: 'Verifying', color: 'bg-yellow-500', icon: Clock },
  active: { label: 'Active', color: 'bg-green-500', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'bg-red-500', icon: XCircle },
  offline: { label: 'Offline', color: 'bg-gray-500', icon: AlertCircle },
  action_required: { label: 'Action Required', color: 'bg-orange-500', icon: AlertCircle },
};

export default function CustomDomains() {
  const { user, subscriptionStatus, loading } = useAuth();
  const navigate = useNavigate();
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    // Check if user has pro or business plan
    const hasPremiumPlan = subscriptionStatus?.subscribed && 
      (subscriptionStatus?.product_id === 'prod_TLc8xSNHXDJoLm' || subscriptionStatus?.product_id === 'prod_TLc9WRMahXD66M');
    
    if (!loading && !hasPremiumPlan) {
      toast.error('Custom domains are only available on Pro and Business plans');
      navigate('/billing');
      return;
    }

    if (user) {
      fetchDomains();
    }
  }, [user, loading, subscriptionStatus, navigate]);

  const fetchDomains = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_domains')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDomains(data || []);
    } catch (error) {
      console.error('Error fetching domains:', error);
      toast.error('Failed to load domains');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain) return;

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(newDomain)) {
      toast.error('Please enter a valid domain name');
      return;
    }

    setIsAdding(true);
    try {
      const verificationToken = `lovable_verify=${crypto.randomUUID()}`;
      
      const { error } = await supabase
        .from('custom_domains')
        .insert({
          user_id: user!.id,
          domain: newDomain.toLowerCase(),
          status: 'verifying',
          verification_token: verificationToken,
          dns_records: [
            { type: 'A', name: '@', value: '185.158.133.1' },
            { type: 'A', name: 'www', value: '185.158.133.1' },
            { type: 'TXT', name: '_lovable', value: verificationToken },
          ],
        });

      if (error) throw error;

      toast.success('Domain added! Please configure your DNS records.');
      setNewDomain('');
      setShowAddDialog(false);
      fetchDomains();
    } catch (error: any) {
      console.error('Error adding domain:', error);
      if (error.code === '23505') {
        toast.error('This domain is already registered');
      } else {
        toast.error('Failed to add domain');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    try {
      toast.info('Verifying domain... This may take a moment.');
      
      const { data, error } = await supabase.functions.invoke('verify-domain', {
        body: { domain_id: domainId },
      });

      if (error) throw error;

      if (data.verified) {
        toast.success('Domain verified successfully!');
      } else {
        toast.error(data.error || 'Domain verification failed');
      }

      fetchDomains();
    } catch (error) {
      console.error('Error verifying domain:', error);
      toast.error('Failed to verify domain');
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm('Are you sure you want to remove this domain?')) return;

    try {
      const { error } = await supabase
        .from('custom_domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;

      toast.success('Domain removed');
      fetchDomains();
    } catch (error) {
      console.error('Error deleting domain:', error);
      toast.error('Failed to remove domain');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Custom Domains - Linkbolt"
        description="Connect your custom domain to your Linkbolt profile"
        noindex={true}
      />
      
      <div className="container mx-auto p-6 max-w-6xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <PageHeader
          title="Custom Domains"
        />

        <div className="grid gap-6 mt-6">
          {/* Add Domain */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Domains</CardTitle>
                  <CardDescription>Manage custom domains for your profile</CardDescription>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Domain
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Custom Domain</DialogTitle>
                      <DialogDescription>
                        Connect your domain to your Linkbolt profile
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="domain">Domain Name</Label>
                        <Input
                          id="domain"
                          placeholder="yourdomain.com"
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          Enter your domain without http:// or www
                        </p>
                      </div>

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          After adding your domain, you'll need to configure DNS records at your domain registrar.
                        </AlertDescription>
                      </Alert>

                      <Button
                        onClick={handleAddDomain}
                        disabled={isAdding || !newDomain}
                        className="w-full"
                      >
                        {isAdding ? 'Adding...' : 'Add Domain'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {domains.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No custom domains added yet</p>
                  <p className="text-sm">Click "Add Domain" to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {domains.map((domain) => {
                    const config = statusConfig[domain.status as keyof typeof statusConfig];
                    const StatusIcon = config.icon;

                    return (
                      <Card key={domain.id} className="border-2">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
                                <StatusIcon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-lg">{domain.domain}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary">{config.label}</Badge>
                                  {domain.is_primary && (
                                    <Badge variant="default">Primary</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {domain.status !== 'active' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleVerifyDomain(domain.id)}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Verify
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDomain(domain.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>

                          {domain.error_message && (
                            <Alert variant="destructive" className="mb-4">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{domain.error_message}</AlertDescription>
                            </Alert>
                          )}

                          {domain.status !== 'active' && (
                            <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                              <p className="text-sm font-medium">DNS Configuration Required:</p>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 bg-background rounded border">
                                  <div className="text-sm">
                                    <span className="font-mono">A @ → 185.158.133.1</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard('185.158.133.1')}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-background rounded border">
                                  <div className="text-sm">
                                    <span className="font-mono">A www → 185.158.133.1</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard('185.158.133.1')}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-background rounded border">
                                  <div className="text-sm">
                                    <span className="font-mono">TXT _lovable → {domain.verification_token}</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(domain.verification_token)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Add these records at your domain registrar. DNS changes may take up to 72 hours to propagate.
                              </p>
                            </div>
                          )}

                          {domain.verified_at && (
                            <p className="text-sm text-muted-foreground mt-4">
                              Verified on {new Date(domain.verified_at).toLocaleDateString()}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>• DNS changes can take up to 72 hours to propagate globally</p>
                <p>• Make sure to add both root (@) and www subdomains</p>
                <p>• Use the verify button to check your DNS configuration</p>
                <p>• Contact support if you need assistance with domain setup</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}