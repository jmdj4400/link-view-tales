import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Trash2, GripVertical, Link as LinkIcon, Eye, QrCode, CalendarClock, Gauge, Link2, TrendingUp, Folder } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryManager } from "@/components/links/CategoryManager";
import { ABTestManager } from "@/components/links/ABTestManager";
import { toast } from "sonner";
import { QRCodeDialog } from "@/components/links/QRCodeDialog";
import { LinkScheduleDialog } from "@/components/links/LinkScheduleDialog";
import { ClickLimitDialog } from "@/components/links/ClickLimitDialog";
import { UTMBuilderDialog } from "@/components/links/UTMBuilderDialog";
import { PageLoader } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { SEOHead } from "@/components/SEOHead";
import { linkValidation } from "@/lib/security-utils";
import { PageHeader } from "@/components/ui/page-header";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { FormFieldWithValidation } from "@/components/ui/form-field-with-validation";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { useCommonShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { UpgradePrompt } from "@/components/ui/upgrade-prompt";
import { UsageIndicator } from "@/components/ui/usage-indicator";

interface Link {
  id: string;
  title: string;
  dest_url: string;
  position: number;
  is_active: boolean;
  active_from: string | null;
  active_until: string | null;
  max_clicks: number | null;
  current_clicks: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export default function LinksSettings() {
  useCommonShortcuts();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [links, setLinks] = useState<Link[]>([]);
  const [newLink, setNewLink] = useState({ title: "", dest_url: "", category_id: "none" });
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userHandle, setUserHandle] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedLinkForAB, setSelectedLinkForAB] = useState<Link | null>(null);
  const [qrCodeDialog, setQrCodeDialog] = useState<{ open: boolean; link: Link | null }>({ open: false, link: null });
  const [scheduleDialog, setScheduleDialog] = useState<{ open: boolean; link: Link | null }>({ open: false, link: null });
  const [clickLimitDialog, setClickLimitDialog] = useState<{ open: boolean; link: Link | null }>({ open: false, link: null });
  const [utmDialog, setUtmDialog] = useState<{ open: boolean; link: Link | null }>({ open: false, link: null });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; linkId: string | null; linkTitle: string }>({ 
    open: false, 
    linkId: null, 
    linkTitle: '' 
  });
  const [userPlan, setUserPlan] = useState<string>('free');

  const FREE_TIER_LIMIT = 5;
  const isPaidUser = userPlan !== 'free';
  const showUpgradePrompt = !isPaidUser && links.length >= FREE_TIER_LIMIT;

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchLinks();
      fetchUserHandle();
      fetchCategories();
      fetchUserPlan();
    }
  }, [user]);

  const fetchUserPlan = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user?.id)
      .single();
    
    if (data) {
      setUserPlan(data.plan || 'free');
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('link_categories')
      .select('id, name, color')
      .eq('user_id', user?.id)
      .order('position');
    
    if (data) {
      setCategories(data);
    }
  };

  const fetchUserHandle = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('handle')
      .eq('id', user?.id)
      .single();
    
    if (data) {
      setUserHandle(data.handle);
    }
  };

  const fetchLinks = async () => {
    setIsLoadingLinks(true);
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user?.id)
      .order('position', { ascending: true });

    if (!error && data) {
      setLinks(data);
    }
    setIsLoadingLinks(false);
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Check free tier limit (5 links max)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user?.id)
      .single();
    
    const isPaidUser = profileData?.plan && profileData.plan !== 'free';
    const FREE_TIER_LIMIT = 5;
    
    if (!isPaidUser && links.length >= FREE_TIER_LIMIT) {
      toast.error(`Free plan limited to ${FREE_TIER_LIMIT} links. Upgrade to add more!`);
      setIsSubmitting(false);
      navigate('/billing');
      return;
    }
    
    // Validate inputs
    const titleError = linkValidation.title.validate(newLink.title);
    const urlError = linkValidation.destUrl.validate(newLink.dest_url);

    if (titleError || urlError) {
      toast.error(titleError || urlError || 'Validation error');
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from('links')
      .insert({
        user_id: user?.id,
        title: newLink.title,
        dest_url: newLink.dest_url,
        category_id: newLink.category_id === "none" ? null : newLink.category_id,
        position: links.length,
      });

    if (error) {
      toast.error('Failed to add link');
    } else {
      toast.success('Link added successfully');
      setNewLink({ title: "", dest_url: "", category_id: "none" });
      fetchLinks();
      fetchCategories();
    }
    setIsSubmitting(false);
  };

  const handleDeleteLink = async (id: string) => {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete link');
    } else {
      toast.success('Link deleted successfully');
      fetchLinks();
    }
  };

  const confirmDeleteLink = (link: Link) => {
    setDeleteConfirmation({
      open: true,
      linkId: link.id,
      linkTitle: link.title,
    });
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    console.log('LinksSettings: Toggling link active state', { id, currentState, userId: user?.id });
    const { data, error } = await supabase
      .from('links')
      .update({ is_active: !currentState })
      .eq('id', id)
      .select();

    if (error) {
      console.error('LinksSettings: Toggle failed', { 
        error,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        linkId: id,
        userId: user?.id
      });
      toast.error(`Failed to update link: ${error.message}`);
    } else {
      console.log('LinksSettings: Toggle successful', { data });
      fetchLinks();
    }
  };

  const handleSaveSchedule = async (linkId: string, activeFrom: string | null, activeUntil: string | null) => {
    const { error } = await supabase
      .from('links')
      .update({ active_from: activeFrom, active_until: activeUntil })
      .eq('id', linkId);

    if (error) {
      toast.error('Failed to update schedule');
    } else {
      toast.success('Schedule updated');
      fetchLinks();
    }
  };

  const handleSaveClickLimit = async (linkId: string, maxClicks: number | null) => {
    const { error } = await supabase
      .from('links')
      .update({ max_clicks: maxClicks })
      .eq('id', linkId);

    if (error) {
      toast.error('Failed to update click limit');
    } else {
      toast.success('Click limit updated');
      fetchLinks();
    }
  };

  const handleSaveUTM = async (linkId: string, utmSource: string | null, utmMedium: string | null, utmCampaign: string | null) => {
    const { error } = await supabase
      .from('links')
      .update({ 
        utm_source: utmSource, 
        utm_medium: utmMedium, 
        utm_campaign: utmCampaign 
      })
      .eq('id', linkId);

    if (error) {
      toast.error('Failed to update UTM parameters');
    } else {
      toast.success('UTM parameters updated');
      fetchLinks();
    }
  };

  const getScheduleStatus = (link: Link) => {
    const now = new Date();
    const from = link.active_from ? new Date(link.active_from) : null;
    const until = link.active_until ? new Date(link.active_until) : null;

    if (from && now < from) return { status: 'scheduled', text: 'Starts later' };
    if (until && now > until) return { status: 'expired', text: 'Expired' };
    if (from || until) return { status: 'active', text: 'Scheduled' };
    return null;
  };

  const getClickStatus = (link: Link) => {
    if (!link.max_clicks) return null;
    const remaining = link.max_clicks - link.current_clicks;
    if (remaining <= 0) return { status: 'limit-reached', text: 'Limit reached' };
    if (remaining <= link.max_clicks * 0.2) return { status: 'low', text: `${remaining} left` };
    return { status: 'active', text: `${link.current_clicks}/${link.max_clicks}` };
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <SEOHead
        title="Manage Links - LinkPeek"
        description="Add and organize your profile links."
        noindex={true}
      />
      <div className="min-h-screen bg-background">
        <PageHeader 
          showBack 
          title="LinkPeek"
          actions={
            userHandle ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`/${userHandle}`, '_blank')}
                aria-label="View your public profile in a new tab"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            ) : undefined
          }
        />

      <div className="container mx-auto px-6 py-10 max-w-4xl">
        <BreadcrumbNav />
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1">Manage Links</h1>
          <p className="text-muted-foreground">Add and organize your profile links</p>
        </div>

        <Tabs defaultValue="links" className="space-y-6">
          <TabsList>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="space-y-6">
        {/* Usage Indicator for Free Users */}
        {!isPaidUser && (
          <Card>
            <CardContent className="pt-6">
              <UsageIndicator
                current={links.length}
                limit={FREE_TIER_LIMIT}
                label="Links used"
              />
            </CardContent>
          </Card>
        )}
        
        {/* Upgrade Prompt when limit reached */}
        {showUpgradePrompt && (
          <UpgradePrompt
            variant="banner"
            title="Link Limit Reached"
            description={`You've reached the free plan limit of ${FREE_TIER_LIMIT} links. Upgrade to Pro for unlimited links and advanced features.`}
            feature="Pro"
          />
        )}
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Link</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLink} className="space-y-4">
              <FormFieldWithValidation
                id="title"
                label="Link Title"
                value={newLink.title}
                onChange={(value) => setNewLink({ ...newLink, title: value })}
                validation={linkValidation.title}
                maxLength={linkValidation.title.maxLength}
                placeholder="My Website"
                showCharCount
                required
                disabled={showUpgradePrompt}
              />
              
              <FormFieldWithValidation
                id="url"
                label="Destination URL"
                type="url"
                value={newLink.dest_url}
                onChange={(value) => setNewLink({ ...newLink, dest_url: value })}
                validation={linkValidation.destUrl}
                maxLength={linkValidation.destUrl.maxLength}
                placeholder="https://example.com"
                required
                disabled={showUpgradePrompt}
              />
              
              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Select
                  value={newLink.category_id}
                  onValueChange={(value) => setNewLink({ ...newLink, category_id: value })}
                  disabled={showUpgradePrompt}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="No category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isSubmitting || showUpgradePrompt}>
                <Plus className="h-4 w-4 mr-2" />
                {showUpgradePrompt ? "Upgrade to Add More" : isSubmitting ? "Adding..." : "Add Link"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Links</CardTitle>
            <CardDescription>{links.length} {links.length === 1 ? 'link' : 'links'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingLinks ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Skeleton className="h-5 w-5" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                ))}
              </div>
            ) : links.length === 0 ? (
              <EmptyState
                icon={LinkIcon}
                title="No links yet"
                description="Add your first link above to get started with your profile"
              />
            ) : (
              links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-3 p-3 border rounded-lg transition-all hover:shadow-md"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {link.category_id && categories.find(c => c.id === link.category_id) && (
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: categories.find(c => c.id === link.category_id)?.color }}
                        />
                      )}
                      <div className="font-medium truncate">{link.title}</div>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{link.dest_url}</div>
                    <div className="flex gap-2 mt-1">
                      {getScheduleStatus(link) && (
                        <span className="text-xs text-muted-foreground">
                          {getScheduleStatus(link)?.text}
                        </span>
                      )}
                      {getClickStatus(link) && (
                        <span className={`text-xs ${getClickStatus(link)?.status === 'limit-reached' ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {getClickStatus(link)?.text}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLinkForAB(link)}
                    title="A/B Testing"
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setClickLimitDialog({ open: true, link })}
                    title="Click Limit"
                  >
                    <Gauge className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUtmDialog({ open: true, link })}
                    title="UTM Parameters"
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setScheduleDialog({ open: true, link })}
                    title="Schedule"
                  >
                    <CalendarClock className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQrCodeDialog({ open: true, link })}
                    title="QR Code"
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={link.is_active ? "outline" : "secondary"}
                    size="sm"
                    onClick={() => handleToggleActive(link.id, link.is_active)}
                  >
                    {link.is_active ? "Active" : "Inactive"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => confirmDeleteLink(link)}
                    title="Delete link"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>

        <TabsContent value="ab-testing">
          {selectedLinkForAB ? (
            <div className="space-y-4">
              <Button variant="outline" onClick={() => setSelectedLinkForAB(null)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to link selection
              </Button>
              <ABTestManager linkId={selectedLinkForAB.id} linkTitle={selectedLinkForAB.title} />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Select a Link for A/B Testing</CardTitle>
                <CardDescription>Choose which link you want to create variants for</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {links.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No links available. Create links first.
                  </p>
                ) : (
                  links.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => setSelectedLinkForAB(link)}
                    >
                      <div>
                        <div className="font-medium">{link.title}</div>
                        <div className="text-sm text-muted-foreground truncate">{link.dest_url}</div>
                      </div>
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Dialog for Delete */}
      <ConfirmationDialog
        open={deleteConfirmation.open}
        onOpenChange={(open) => setDeleteConfirmation({ open, linkId: null, linkTitle: '' })}
        onConfirm={async () => {
          if (deleteConfirmation.linkId) {
            await handleDeleteLink(deleteConfirmation.linkId);
          }
        }}
        title="Delete Link?"
        description={`Are you sure you want to delete "${deleteConfirmation.linkTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
      
      {qrCodeDialog.link && (
        <QRCodeDialog
          open={qrCodeDialog.open}
          onOpenChange={(open) => setQrCodeDialog({ open, link: null })}
          title={qrCodeDialog.link.title}
          url={`${window.location.origin}/r/${qrCodeDialog.link.id}`}
        />
      )}

      {scheduleDialog.link && (
        <LinkScheduleDialog
          open={scheduleDialog.open}
          onOpenChange={(open) => setScheduleDialog({ open, link: null })}
          link={scheduleDialog.link}
          onSave={handleSaveSchedule}
        />
      )}

      {clickLimitDialog.link && (
        <ClickLimitDialog
          open={clickLimitDialog.open}
          onOpenChange={(open) => setClickLimitDialog({ open, link: null })}
          link={clickLimitDialog.link}
          onSave={handleSaveClickLimit}
        />
      )}

      {utmDialog.link && (
        <UTMBuilderDialog
          open={utmDialog.open}
          onOpenChange={(open) => setUtmDialog({ open, link: null })}
          link={utmDialog.link}
          onSave={handleSaveUTM}
        />
      )}
    </div>
    </>
  );
}
