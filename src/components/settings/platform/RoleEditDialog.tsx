
import React, { useState, useEffect } from 'react';
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
import { getRoleEndpoint, getApiUrl, getAuthHeaders } from '@/utils/api-config';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  is_active: boolean;
  created_at: string;
}

interface RoleEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onRoleUpdated: () => void;
}

const RoleEditDialog: React.FC<RoleEditDialogProps> = ({ isOpen, onClose, role, onRoleUpdated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { getToken } = useAuth();
  const { availablePermissions, isLoading: isLoadingPermissions } = usePermission();

  // Initialize form values when role changes
  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setIsActive(role.is_active);
      setSelectedPermissions(role.permissions.map(p => p.id));
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role) return;
    
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
      
      const response = await fetch(getApiUrl(getRoleEndpoint(role.id)), {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update role');
      }
      
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
      
      onRoleUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update role",
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
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Edit Role</SheetTitle>
          <SheetDescription>
            Update role details and permissions
          </SheetDescription>
        </SheetHeader>
        
        {role ? (
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
                  <LoadingSpinner size="sm" text="Loading permissions..." />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-none">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-2 p-2 border rounded-md">
                      <Checkbox 
                        id={`permission-${permission.id}`}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <Label 
                          htmlFor={`permission-${permission.id}`}
                          className="text-xs font-medium leading-tight"
                        >
                          {permission.name.replace(/_/g, ' ')}
                        </Label>
                        <p className="text-xs text-muted-foreground truncate">{permission.description}</p>
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
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="!mb-0" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            </SheetFooter>
          </form>
        ) : (
          <div className="flex items-center justify-center h-[50vh]">
            <LoadingSpinner size="lg" text="Loading role..." />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default RoleEditDialog;
