import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Key, Plus, Trash2, Copy, Eye, EyeOff, ArrowLeft, ExternalLink } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  usage_count: number;
  rate_limit: number;
  is_active: boolean;
  created_at: string;
}

export default function APIKeys() {
  const { user, subscriptionStatus, loading } = useAuth();
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRateLimit, setNewKeyRateLimit] = useState('1000');
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    // Check if user has business plan
    if (!loading && subscriptionStatus?.product_id !== 'prod_TLc9WRMahXD66M') {
      toast.error('API access is only available on the Business plan');
      navigate('/billing');
      return;
    }

    if (user) {
      fetchAPIKeys();
    }
  }, [user, loading, subscriptionStatus, navigate]);

  const fetchAPIKeys = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName) {
      toast.error('Please enter a name for your API key');
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-api-key', {
        body: {
          name: newKeyName,
          rate_limit: parseInt(newKeyRateLimit) || 1000,
        },
      });

      if (error) throw error;

      setNewlyCreatedKey(data.api_key);
      setShowKey(true);
      toast.success('API key created successfully');
      setNewKeyName('');
      setNewKeyRateLimit('1000');
      fetchAPIKeys();
    } catch (error: any) {
      console.error('Error creating API key:', error);
      toast.error(error.message || 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      toast.success('API key deleted');
      fetchAPIKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const handleToggleActive = async (keyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: !currentStatus })
        .eq('id', keyId);

      if (error) throw error;

      toast.success(currentStatus ? 'API key deactivated' : 'API key activated');
      fetchAPIKeys();
    } catch (error) {
      console.error('Error toggling API key:', error);
      toast.error('Failed to update API key');
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
        title="API Keys - Linkbolt"
        description="Manage your API keys for programmatic access"
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

        <PageHeader title="API Keys" />

        <div className="grid gap-6 mt-6">
          {/* Create API Key */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your API Keys</CardTitle>
                  <CardDescription>Manage programmatic access to your Linkbolt data</CardDescription>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No API keys created yet</p>
                  <p className="text-sm">Create your first API key to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Key className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{key.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">{key.key_prefix}...</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={key.is_active ? "default" : "secondary"}>
                              {key.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {key.usage_count} requests • Limit: {key.rate_limit}/day
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(key.id, key.is_active)}
                        >
                          {key.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKey(key.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Learn how to use the Linkbolt API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Include your API key in the Authorization header:
                </p>
                <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                  Authorization: Bearer YOUR_API_KEY
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Base URL</h3>
                <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                  https://ppfudytrnjfyngrebhxo.supabase.co
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Example Request</h3>
                <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
{`curl -X GET \\
  https://ppfudytrnjfyngrebhxo.supabase.co/rest/v1/links \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "apikey: YOUR_ANON_KEY"`}
                </pre>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a href="https://supabase.com/docs/reference/javascript/introduction" target="_blank" rel="noopener">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full API Documentation
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Create API Key Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Generate a new API key for programmatic access
              </DialogDescription>
            </DialogHeader>

            {newlyCreatedKey ? (
              <div className="space-y-4">
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Save this API key now!</strong> You won't be able to see it again.
                  </AlertDescription>
                </Alert>

                <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted">
                  <code className="flex-1 text-sm break-all">
                    {showKey ? newlyCreatedKey : '•'.repeat(50)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(newlyCreatedKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    setNewlyCreatedKey(null);
                    setShowKey(false);
                    setShowCreateDialog(false);
                  }}
                  className="w-full"
                >
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Key Name</Label>
                  <Input
                    id="name"
                    placeholder="Production API Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    A descriptive name to help you identify this key
                  </p>
                </div>

                <div>
                  <Label htmlFor="rateLimit">Rate Limit (requests per day)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    placeholder="1000"
                    value={newKeyRateLimit}
                    onChange={(e) => setNewKeyRateLimit(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleCreateKey}
                  disabled={isCreating || !newKeyName}
                  className="w-full"
                >
                  {isCreating ? 'Creating...' : 'Create API Key'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}