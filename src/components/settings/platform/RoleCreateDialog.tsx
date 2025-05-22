
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { usePermission, Permission } from '@/context/PermissionContext';
import { API_ENDPOINTS, getApiUrl, getAuthHeaders } from '@/utils/api-config';
import { Loader2 } from 'lucide-react';

interface RoleCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleCreated: () => void;
}

const RoleCreateDialog: React.FC<RoleCreateDialogProps> = ({ isOpen, onClose, onRoleCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { getToken } = useAuth();
  const { availablePermissions, isLoading: isLoadingPermissions } = usePermission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const payload = {
        name,
        description,
        permission_ids: selectedPermissions,
        is_active: isActive
      };
      
      const response = await fetch(getApiUrl(API_ENDPOINTS.USER_ROLE), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create role');
      }
      
      toast({
        title: "Success",
        description: "Role created successfully",
      });
      
      // Reset form
      setName('');
      setDescription('');
      setIsActive(true);
      setSelectedPermissions([]);
      
      onRoleCreated();
      onClose();
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions(current => 
      current.includes(permissionId) 
        ? current.filter(id => id !== permissionId)
        : [...current, permissionId]
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Create New Role</SheetTitle>
          <SheetDescription>
            Define a new role with specific permissions
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="name">Role Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g., Support Agent"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role's responsibilities"
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="active-status" 
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="active-status">Active</Label>
          </div>
          
          <div className="space-y-4">
            <Label>Permissions</Label>
            {isLoadingPermissions ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading permissions...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-start space-x-2">
                    <Checkbox 
                      id={`permission-${permission.id}`}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={() => handlePermissionToggle(permission.id)}
                    />
                    <div>
                      <Label 
                        htmlFor={`permission-${permission.id}`}
                        className="text-sm font-medium"
                      >
                        {permission.name.replace(/_/g, ' ')}
                      </Label>
                      <p className="text-xs text-muted-foreground">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <SheetFooter className="pt-2">
            <Button 
              onClick={onClose} 
              type="button" 
              variant="outline"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !name}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : "Create Role"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default RoleCreateDialog;
