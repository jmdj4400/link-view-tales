import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Eye } from "lucide-react";
import { toast } from "sonner";
import { LeadFormPreview } from "./LeadFormPreview";

interface FormConfig {
  name: string;
  title: string;
  description: string;
  collect_name: boolean;
  collect_phone: boolean;
  collect_message: boolean;
  button_text: string;
  success_message: string;
  redirect_url: string;
  send_confirmation_email: boolean;
}

export function FormBuilder() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const [formConfig, setFormConfig] = useState<FormConfig>({
    name: "",
    title: "Get in Touch",
    description: "Fill out the form below and we'll get back to you soon.",
    collect_name: true,
    collect_phone: false,
    collect_message: true,
    button_text: "Submit",
    success_message: "Thank you! We'll be in touch soon.",
    redirect_url: "",
    send_confirmation_email: false,
  });

  const createFormMutation = useMutation({
    mutationFn: async (config: FormConfig) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("lead_forms").insert({
        user_id: user.id,
        ...config,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-forms"] });
      toast.success("Form created successfully");
      setOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create form"),
  });

  const resetForm = () => {
    setFormConfig({
      name: "",
      title: "Get in Touch",
      description: "Fill out the form below and we'll get back to you soon.",
      collect_name: true,
      collect_phone: false,
      collect_message: true,
      button_text: "Submit",
      success_message: "Thank you! We'll be in touch soon.",
      redirect_url: "",
      send_confirmation_email: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConfig.name.trim()) {
      toast.error("Please enter a form name");
      return;
    }
    createFormMutation.mutate(formConfig);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Form
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Lead Capture Form</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Form Name (Internal)</Label>
                  <Input
                    id="name"
                    value={formConfig.name}
                    onChange={(e) => setFormConfig({ ...formConfig, name: e.target.value })}
                    placeholder="Contact Form 2024"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="title">Form Title</Label>
                  <Input
                    id="title"
                    value={formConfig.title}
                    onChange={(e) => setFormConfig({ ...formConfig, title: e.target.value })}
                    placeholder="Get in Touch"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formConfig.description}
                    onChange={(e) => setFormConfig({ ...formConfig, description: e.target.value })}
                    placeholder="Fill out the form below..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form Fields</CardTitle>
                <CardDescription>Choose which fields to collect</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="collect-name">Collect Name</Label>
                  <Switch
                    id="collect-name"
                    checked={formConfig.collect_name}
                    onCheckedChange={(checked) => 
                      setFormConfig({ ...formConfig, collect_name: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="collect-phone">Collect Phone</Label>
                  <Switch
                    id="collect-phone"
                    checked={formConfig.collect_phone}
                    onCheckedChange={(checked) => 
                      setFormConfig({ ...formConfig, collect_phone: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="collect-message">Collect Message</Label>
                  <Switch
                    id="collect-message"
                    checked={formConfig.collect_message}
                    onCheckedChange={(checked) => 
                      setFormConfig({ ...formConfig, collect_message: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="button-text">Button Text</Label>
                  <Input
                    id="button-text"
                    value={formConfig.button_text}
                    onChange={(e) => setFormConfig({ ...formConfig, button_text: e.target.value })}
                    placeholder="Submit"
                  />
                </div>

                <div>
                  <Label htmlFor="success-message">Success Message</Label>
                  <Textarea
                    id="success-message"
                    value={formConfig.success_message}
                    onChange={(e) => setFormConfig({ ...formConfig, success_message: e.target.value })}
                    placeholder="Thank you! We'll be in touch soon."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="redirect-url">Redirect URL (Optional)</Label>
                  <Input
                    id="redirect-url"
                    type="url"
                    value={formConfig.redirect_url}
                    onChange={(e) => setFormConfig({ ...formConfig, redirect_url: e.target.value })}
                    placeholder="https://example.com/thank-you"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="send-confirmation">Send Confirmation Email</Label>
                  <Switch
                    id="send-confirmation"
                    checked={formConfig.send_confirmation_email}
                    onCheckedChange={(checked) => 
                      setFormConfig({ ...formConfig, send_confirmation_email: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Create Form
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <LeadFormPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        formConfig={formConfig}
      />
    </>
  );
}
