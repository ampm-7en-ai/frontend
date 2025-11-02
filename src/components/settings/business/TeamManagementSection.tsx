import React, { useState } from 'react';
import { Trash, Clock, Mail, User, AlertCircle, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from '@/context/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import ModernButton from '@/components/dashboard/ModernButton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Icon } from '@/components/icons';
import { ModernModal } from '@/components/ui/modern-modal';
import { 
  useTeamRoles, 
  useTeamMembers, 
  useCreateTeamInvite, 
  useCancelInvite, 
  useRemoveTeamMember 
} from '@/hooks/useTeamManagement';

const inviteFormSchema = z.object({
  email: z.string().email("Invalid email address."),
  team_role_id: z.number({ required_error: "Please select a role." }),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

const TeamManagementSection = () => {
  const { user } = useAuth();
  const [inviteApiError, setInviteApiError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);

  // Use React Query hooks
  const { data: availableRoles = [], isLoading: loadingRoles } = useTeamRoles();
  const { data: teamMembers = [], isLoading: loadingMembers } = useTeamMembers();
  const createInvite = useCreateTeamInvite();
  const cancelInviteMutation = useCancelInvite();
  const removeMemberMutation = useRemoveTeamMember();
  
  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
    },
  });

  const onInviteSubmit = async (data: InviteFormValues) => {
    try {
      setInviteApiError(null);
      await createInvite.mutateAsync({
        email: data.email,
        team_role_id: data.team_role_id
      });
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${data.email}.`,
      });
      
      inviteForm.reset();
    } catch (error) {
      if (error instanceof Error) {
        setInviteApiError(error.message);
      } else {
        toast({
          title: "Error",
          description: "An error occurred while sending the invitation.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelInviteMutation.mutateAsync(inviteId);
      toast({
        title: "Invitation cancelled",
        description: "The team invitation has been cancelled successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while cancelling the invitation.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMemberMutation.mutateAsync(memberId);
      toast({
        title: "Member removed",
        description: "The team member has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while removing the team member.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const calculateExpiryStatus = (expiryDate: string): string => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Expires today';
    } else if (diffDays === 1) {
      return 'Expires tomorrow';
    } else {
      return `Expires in ${diffDays} days`;
    }
  };

  // If no team members data available and no permission, don't show the section
  if (!loadingMembers && teamMembers.length === 0 && availableRoles.length === 0) {
    return null;
  }

  const handleRemove = (delType: string, item: string) => {
    setSelectedItem(delType);
    setDeleteConfirmOpen(true);
    setMemberId(item);
  };

  const isDeleting = cancelInviteMutation.isPending || removeMemberMutation.isPending;

  return (
    <section className="p-8 px-0">
      <div className="mb-8 pl-2">
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">Team Management</h2>
        <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
          Manage team members and their access to your 7en.ai workspace
        </p>
      </div>

      {/* Inline Invite Form */}
      <div className="bg-white/70 dark:bg-neutral-800/70 rounded-2xl p-6 mb-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <div className="bg-transparent rounded-xl flex items-center justify-start bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
              <Icon type='plain' name={`Users`} color='hsl(var(--primary))' className='h-5 w-5' />
          </div>
          Invite Team Member
        </h3>
        
        {inviteApiError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{inviteApiError}</AlertDescription>
          </Alert>
        )}
        
        <Form {...inviteForm}>
          <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="flex items-end gap-4">
            <FormField
              control={inviteForm.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input 
                      placeholder="Add name or emails" 
                      {...field} 
                      type="email"
                      variant='modern'
                      autoComplete="email"
                      className="bg-white/80 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-600 rounded-xl h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={inviteForm.control}
              name="team_role_id"
              render={({ field }) => (
                <FormItem className="min-w-[160px]">
                  <FormControl>
                    <ModernDropdown
                      value={field.value?.toString() || ""}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      options={loadingRoles ? [] : availableRoles.length > 0 ? availableRoles.map(role => ({
                        value: role.id.toString(),
                        label: role.name
                      })) : [{ value: "no-roles", label: "No roles available" }]}
                      placeholder="Select Role"
                      disabled={loadingRoles || availableRoles.length === 0}
                      className="bg-white/80 border-neutral-200 h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ModernButton 
              type="submit" 
              variant="primary"
              icon={Send}
              disabled={createInvite.isPending}
              className="font-medium h-11 px-6"
            >
              {createInvite.isPending ? 'Sending...' : 'Send'}
            </ModernButton>
          </form>
        </Form>

        {inviteForm.watch("team_role_id") && (
          <div className="bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl p-4 border border-neutral-200/50 dark:border-neutral-600/50 mt-4">
            <h4 className="text-sm font-semibold mb-3 text-neutral-900 dark:text-neutral-100">Role Permissions</h4>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {availableRoles.find(r => r.id === inviteForm.watch("team_role_id"))?.permissions.map(permission => (
                  <div key={permission.id} className="flex items-center justify-between py-1.5 px-3 bg-white/60 dark:bg-neutral-700/60 rounded-lg">
                    <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{permission.name.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-neutral-600 dark:text-muted-foreground">{permission.description}</span>
                  </div>
                ))}
                {availableRoles.find(r => r.id === inviteForm.watch("team_role_id"))?.permissions.length === 0 && (
                  <div className="text-center py-3 text-neutral-500 dark:text-neutral-400 text-sm">
                    This role has no permissions assigned
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Current Owner - More Compact */}
      <div className="bg-white/70 dark:bg-neutral-800/70 rounded-2xl p-6 pb-2 mb-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
            <Icon type='plain' name={`Person`} color='hsl(var(--primary))' className='h-5 w-5' />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{user?.name || 'You'}</h3>
              <Badge className="text-purple-600 border-0 text-xs">Owner</Badge>
            </div>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        {/* Team Members List - More Compact */}
          {(teamMembers.length > 0 || loadingMembers) && (
            <div className="bg-white/50 dark:bg-neutral-800/70 rounded-2xl border border-neutral-200/50 dark:border-neutral-600/50 backdrop-blur-sm overflow-hidden mb-4">
              <div className="p-4 border-b border-neutral-200/50 dark:border-neutral-600/50">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Team Members</h3>
              </div>
              
              {loadingMembers ? (
                <div className="bg-none">
                  <div className="container mx-auto py-12 flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" text="Loading..." />
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-neutral-200/50 dark:divide-neutral-600/50">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/50 dark:hover:bg-neutral-700/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-transparent rounded-lg flex items-center justify-center">
                          <Icon type='plain' name={`Person`} color='hsl(var(--primary))' className='h-5 w-5 mr-1' />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                              {member.name || member.email}
                            </h4>
                            {member.status === 'pending' ? (
                              <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 text-xs">
                                <Clock className="h-2.5 w-2.5" />
                                Pending
                              </Badge>
                            ) : (
                              <Badge className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground dark:muted-foreground">
                            <span className="capitalize">{member.role}</span>
                            <span>•</span>
                            <span>
                              {member.status === 'pending' 
                                ? (member.expires_at ? calculateExpiryStatus(member.expires_at) : 'No expiry')
                                : `Added ${formatDate(member.created_at || '')}`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      <ModernButton
                        variant="outline"
                        size="sm"
                        onClick={() => member.status === 'pending' ? handleRemove("cancel", member.id) : handleRemove("remove", member.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:!text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 h-10 w-10 p-0"
                      >
                        <Icon type='plain' name={`Bin`} color='hsl(var(--primary))' className='h-5 w-5' />
                      </ModernButton>
                    </div>
                  ))}
                </div>
              )}
              
              {!loadingMembers && teamMembers.length === 0 && (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <User className="h-6 w-6 text-neutral-400" />
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-1 text-sm">No team members yet</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500">
                    Invite your first team member to get started collaborating.
                  </p>
                </div>
              )}
            </div>
          )}
      </div>
    {/* Delete Confirmation Modal */}
          <ModernModal
            open={deleteConfirmOpen}
            onOpenChange={setDeleteConfirmOpen}
            title={selectedItem === 'cancel' ? "Cancel Invitation" : "Remove Member"}
            description={`Are you sure you want to ${selectedItem === 'cancel' ? 'cancel this invitation' : 'remove this member'}? This action cannot be undone.`}
            size="md"
            type='alert'
            footer={
              <div className="flex gap-3">
                <ModernButton variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                  Cancel
                </ModernButton>
                <ModernButton 
                  variant="primary" 
                  onClick={() => memberId && (selectedItem === 'cancel' ? handleCancelInvite(memberId) : handleRemoveMember(memberId))}
                  className="!bg-red-600 hover:!bg-red-700 focus:ring-red-600 !text-white"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </ModernButton>
              </div>
            }
          >
            <div className="py-4">
              <p className="text-muted-foreground dark:text-muted-foreground">
                {selectedItem === 'cancel' 
                  ? 'This will cancel the pending invitation and the recipient will no longer be able to join.'
                  : 'This will permanently remove the team member and revoke their access to the workspace.'
                }
              </p>
            </div>
          </ModernModal>
      
    </section>
  );
};

export default TeamManagementSection;
