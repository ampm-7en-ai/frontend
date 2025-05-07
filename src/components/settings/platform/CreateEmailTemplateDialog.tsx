
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface CreateEmailTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateEmailTemplateDialog({ open, onOpenChange }: CreateEmailTemplateDialogProps) {
  const { toast } = useToast();
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateContent, setTemplateContent] = useState('<p>Hello {{user.name}},</p>\n<p>Your message here.</p>\n<p>Best regards,<br>The 7en AI Team</p>');
  
  const handleCreate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a template name.",
        variant: "destructive",
      });
      return;
    }

    if (!templateSubject.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide an email subject.",
        variant: "destructive",
      });
      return;
    }
    
    // Here you would typically save the template to your backend
    toast({
      title: "Template created",
      description: `${templateName} has been created successfully.`,
    });
    
    // Reset form and close dialog
    setTemplateName('');
    setTemplateSubject('');
    setTemplateContent('<p>Hello {{user.name}},</p>\n<p>Your message here.</p>\n<p>Best regards,<br>The 7en AI Team</p>');
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Email Template</DialogTitle>
          <DialogDescription>
            Design a new email template for your communications.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name</Label>
            <Input 
              id="templateName" 
              value={templateName} 
              onChange={(e) => setTemplateName(e.target.value)} 
              placeholder="e.g., New Feature Announcement"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="templateSubject">Email Subject</Label>
            <Input 
              id="templateSubject" 
              value={templateSubject} 
              onChange={(e) => setTemplateSubject(e.target.value)} 
              placeholder="e.g., Exciting New Features Now Available!"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="templateContent">Email Content (HTML)</Label>
            <Textarea 
              id="templateContent" 
              value={templateContent} 
              onChange={(e) => setTemplateContent(e.target.value)} 
              className="h-60 font-mono text-sm"
              expandable
              maxExpandedHeight="300px" 
            />
            <p className="text-xs text-muted-foreground">
              Use {{user.name}}, {{user.email}}, etc. as variables that will be replaced with actual values.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="newHtmlEmail" defaultChecked />
            <Label htmlFor="newHtmlEmail">Send as HTML email</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate}>Create Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
