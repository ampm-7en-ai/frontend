
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PlainTextInputProps {
  onAddText: (text: string, name: string) => void;
}

export const PlainTextInput: React.FC<PlainTextInputProps> = ({ onAddText }) => {
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast({
        title: "Text required",
        description: "Please enter some text content",
        variant: "destructive"
      });
      return;
    }
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a name for this text content",
        variant: "destructive"
      });
      return;
    }
    
    onAddText(text, name);
    setText('');
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="text-name">Name</Label>
        <Input
          id="text-name"
          placeholder="Company Policy"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="plain-text">Content</Label>
        <Textarea
          id="plain-text"
          placeholder="Enter or paste text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[150px]"
        />
      </div>
      
      <Button type="submit" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Text
      </Button>
    </form>
  );
};
