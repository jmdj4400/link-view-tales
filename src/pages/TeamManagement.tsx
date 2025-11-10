import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Users, Mail, Trash2, Crown, Shield, Edit, Eye, UserPlus, ArrowLeft } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Workspace {
  id: string;
  name: string;
  owner_id: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  invited_at: string;
  joined_at: string | null;
  profiles: {
    name: string;
    email: string;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  editor: Edit,
  viewer: Eye,
};

const roleColors = {
  owner: 'bg-amber-500',
  admin: 'bg-purple-500',
  editor: 'bg-blue-500',
  viewer: 'bg-gray-500',
};

export default function TeamManagement() {
  const { user, subscriptionStatus, loading } = useAuth();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    // Check if user has business plan
    if (!loading && subscriptionStatus?.product_id !== 'prod_TLc9WRMahXD66M') {
      toast.error('Team collaboration is only available on the Business plan');
      navigate('/billing');
      return;
    }

    if (user) {
      fetchWorkspace();
    }
  }, [user, loading, subscriptionStatus, navigate]);

  const fetchWorkspace = async () => {
    setIsLoading(true);
    try {
      // Get or create workspace
      let { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user!.id)
        .single();

      if (workspaceError && workspaceError.code === 'PGRST116') {
        // Create workspace if doesn't exist
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user!.id)
          .single();

        const { data: newWorkspace, error: createError } = await supabase
          .from('workspaces')
          .insert({
            name: `${profile?.name}'s Team`,
            owner_id: user!.id,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Add owner as member
        await supabase.from('workspace_members').insert({
          workspace_id: newWorkspace.id,
          user_id: user!.id,
          role: 'owner',
          joined_at: new Date().toISOString(),
        });

        workspaceData = newWorkspace;
      }

      setWorkspace(workspaceData);

      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('workspace_members')
        .select(`
          *,
          profiles:user_id (name, email)
        `)
        .eq('workspace_id', workspaceData.id);

      if (membersError) throw membersError;
      setMembers(membersData as any || []);

      // Fetch invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('workspace_invitations')
        .select('*')
        .eq('workspace_id', workspaceData.id)
        .is('accepted_at', null);

      if (invitationsError) throw invitationsError;
      setInvitations(invitationsData || []);
    } catch (error) {
      console.error('Error fetching workspace:', error);
      toast.error('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail || !workspace) return;

    setIsInviting(true);
    try {
      const { error } = await supabase.functions.invoke('send-team-invitation', {
        body: {
          workspace_id: workspace.id,
          email: inviteEmail,
          role: inviteRole,
        },
      });

      if (error) throw error;

      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('editor');
      setShowInviteDialog(false);
      fetchWorkspace();
    } catch (error) {
      console.error('Error inviting member:', error);
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Team member removed');
      fetchWorkspace();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove team member');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('workspace_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast.success('Invitation cancelled');
      fetchWorkspace();
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation');
    }
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
        title="Team Management - Linkbolt"
        description="Manage your team members and collaborators"
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
          title="Team Management"
        />

        <div className="grid gap-6 mt-6">
          {/* Workspace Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {workspace?.name}
              </CardTitle>
              <CardDescription>
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Invite Members */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invite Team Members</CardTitle>
                  <CardDescription>Send invitations to collaborate</CardDescription>
                </div>
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join your team
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="colleague@company.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin - Full access</SelectItem>
                            <SelectItem value="editor">Editor - Can edit links</SelectItem>
                            <SelectItem value="viewer">Viewer - Read only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleInviteMember}
                        disabled={isInviting || !inviteEmail}
                        className="w-full"
                      >
                        {isInviting ? 'Sending...' : 'Send Invitation'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Active members in your workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => {
                  const RoleIcon = roleIcons[member.role as keyof typeof roleIcons];
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${roleColors[member.role as keyof typeof roleColors]}`}>
                          <RoleIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{member.profiles.name}</p>
                          <p className="text-sm text-muted-foreground">{member.profiles.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{member.role}</Badge>
                        {member.role !== 'owner' && member.user_id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>Invitations waiting to be accepted</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{invitation.role}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelInvitation(invitation.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}