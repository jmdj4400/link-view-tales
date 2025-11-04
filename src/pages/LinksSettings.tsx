import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface Link {
  id: string;
  title: string;
  dest_url: string;
  position: number;
  is_active: boolean;
}

export default function LinksSettings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [links, setLinks] = useState<Link[]>([]);
  const [newLink, setNewLink] = useState({ title: "", dest_url: "" });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user]);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user?.id)
      .order('position', { ascending: true });

    if (!error && data) {
      setLinks(data);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('links')
      .insert({
        user_id: user?.id,
        title: newLink.title,
        dest_url: newLink.dest_url,
        position: links.length,
      });

    if (error) {
      toast.error('Failed to add link');
    } else {
      toast.success('Link added successfully');
      setNewLink({ title: "", dest_url: "" });
      fetchLinks();
    }
  };

  const handleDeleteLink = async (id: string) => {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete link');
    } else {
      toast.success('Link deleted');
      fetchLinks();
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('links')
      .update({ is_active: !currentState })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update link');
    } else {
      fetchLinks();
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1">Manage Links</h1>
          <p className="text-muted-foreground">Add and organize your profile links</p>
        </div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Link</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Link Title</Label>
                <Input
                  id="title"
                  placeholder="My Website"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Destination URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={newLink.dest_url}
                  onChange={(e) => setNewLink({ ...newLink, dest_url: e.target.value })}
                  required
                />
              </div>
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Add Link
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
            {links.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No links yet. Add your first link above!</p>
            ) : (
              links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{link.title}</div>
                    <div className="text-sm text-muted-foreground truncate">{link.dest_url}</div>
                  </div>
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
                    onClick={() => handleDeleteLink(link.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
