
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/utils/api-config";
import { apiRequest } from "@/utils/api-interceptor";

interface GuidelinesPanelProps {
  name: string;
  guidelines: string;
  avatar: string;
  onNameChange: (name: string) => void;
  onGuidelinesChange: (guidelines: string) => void;
  onAvatarChange: (avatar: string) => void;
}

const GuidelinesPanel: React.FC<GuidelinesPanelProps> = ({
  name,
  guidelines,
  avatar,
  onNameChange,
  onGuidelinesChange,
  onAvatarChange
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const validateImageFile = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a JPG, PNG, or SVG file.",
          variant: "destructive"
        });
        resolve(false);
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB.",
          variant: "destructive"
        });
        resolve(false);
        return;
      }

      // For SVG files, skip dimension validation
      if (file.type === 'image/svg+xml') {
        resolve(true);
        return;
      }

      // Check dimensions for raster images
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        
        // Check if dimensions are within 500x500
        if (width > 500 || height > 500) {
          toast({
            title: "Image too large",
            description: "Please select an image with dimensions below 500x500px.",
            variant: "destructive"
          });
          resolve(false);
          return;
        }

        // Check if aspect ratio is 1:1 (allow 5% tolerance)
        const aspectRatio = width / height;
        if (aspectRatio < 0.95 || aspectRatio > 1.05) {
          toast({
            title: "Invalid aspect ratio",
            description: "Please select an image with a 1:1 aspect ratio (square).",
            variant: "destructive"
          });
          resolve(false);
          return;
        }

        resolve(true);
      };

      img.onerror = () => {
        toast({
          title: "Invalid image",
          description: "Unable to load the selected image.",
          variant: "destructive"
        });
        resolve(false);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      // Validate the file first
      const isValid = await validateImageFile(file);
      if (!isValid) {
        setIsUploading(false);
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload file with authentication
      const response = await apiRequest(getApiUrl('users/upload-file/'), {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      if (data.status === 'success' && data.data?.url) {
        onAvatarChange(data.data.url);
        toast({
          title: "Avatar updated",
          description: "Your avatar has been uploaded successfully.",
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/svg+xml';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agent Identity</CardTitle>
          <CardDescription>
            Configure your agent's name and avatar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-16 h-16 cursor-pointer" onClick={handleAvatarClick}>
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={handleAvatarClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex-1">
              <Label htmlFor="agent-name">Agent Name</Label>
              <input
                id="agent-name"
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter agent name"
              />
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>Upload requirements:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>File types: JPG, PNG, SVG</li>
              <li>Maximum dimensions: 500x500px</li>
              <li>Aspect ratio: 1:1 (square)</li>
              <li>Maximum file size: 5MB</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Guidelines</CardTitle>
          <CardDescription>
            Define how your agent should behave and respond
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="guidelines">Guidelines</Label>
            <Textarea
              id="guidelines"
              value={guidelines}
              onChange={(e) => onGuidelinesChange(e.target.value)}
              placeholder="Enter agent guidelines and behavior instructions..."
              className="min-h-[120px]"
              maxLength={2000}
            />
            <p className="text-sm text-gray-500">
              {guidelines.length}/2000 characters
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuidelinesPanel;
