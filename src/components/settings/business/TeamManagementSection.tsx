import React, { useState, useEffect } from 'react';
import { Trash, Clock, Mail, User, AlertCircle, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from '@/context/AuthContext';
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from '@/utils/api-config';
import { ScrollArea } from '@/components/ui/scroll-area';
import ModernButton from '@/components/dashboard/ModernButton';

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: {
    id: number;
    name: string;
    description: string;
  }[];
  is_active: boolean;
  created_at: string;
}

const inviteFormSchema = z.object({
  email: z.string().email("Invalid email address."),
  team_role_id: z.number({ required_error: "Please select a role." }),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

interface Member {
  id: string;
  email: string | null;
  role: string;
  created_at?: string;
  status: 'pending' | 'active';
  name?: string;
  expires_at?: string;
  used?: boolean;
}

const TeamManagementSection = () => {
  const { user, getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteApiError, setInviteApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Member[]>([]);
  const [showTeamManagement, setShowTeamManagement] = useState(true);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    fetchTeamMembers();
    fetchAvailableRoles();
  }, []);

  const fetchAvailableRoles = async () => {
    try {
      setLoadingRoles(true);
      const token = getToken();
      if (!token) {
        throw new Error("You must be logged in to view roles");
      }
      
      const response = await fetch(getApiUrl(API_ENDPOINTS.USER_ROLE), {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }
      
      const data = await response.json();
      setAvailableRoles(data.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast({
        title: "Error",
        description: "Failed to fetch available roles",
        variant: "destructive",
      });
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error("You must be logged in to view team members");
      }
      
      // Fetch team invites
      const response = await fetch(getApiUrl('users/get_team_invites/'), {
        method: 'GET',
        headers: getAuthHeaders(token),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
        
        if (errorData.error === "Only team owners can view invites") {
          setShowTeamManagement(false);
          console.log("User doesn't have permission to view team invites. Hiding team management section.");
        } else {
          throw new Error(errorData.error || `Failed to fetch team invites: ${response.status}`);
        }
        return;
      }
      
      setShowTeamManagement(true);
      
      const inviteData = await response.json();
      console.log("Team invites fetched:", inviteData.data);
      
      // Format the invites as members with active/pending status based on 'used' property
      const formattedMembers: Member[] = inviteData.data.map((invite: any) => ({
        id: invite.id.toString(),
        email: invite.email,
        role: invite.role,
        status: invite.used ? 'active' : 'pending',
        name: invite.email, // replace with name after api is done
        created_at: invite.created_at || new Date().toISOString(),
        expires_at: invite.expires_at,
        used: invite.used
      }));
      
      
      setTeamMembers(formattedMembers.sort(a => a.used ? -1 : 1));
    } catch (error) {
      console.error("Error fetching team members:", error);
      if (error instanceof Error && error.message !== "Only team owners can view invites") {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch team members",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelInvite = async (inviteId: string) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("You must be logged in to cancel invitations");
      }
      
      const response = await fetch(getApiUrl(API_ENDPOINTS.REMOVE_INVITE), {
        method: 'DELETE',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          invite_id: inviteId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
        throw new Error(errorData.error || `Failed to cancel invitation: ${response.status}`);
      }
      
      setTeamMembers(teamMembers.filter(member => member.id !== inviteId));
      
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
    }
  };

  const removeActiveMember = async (memberId: string) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("You must be logged in to remove team members");
      }
      
      const response = await fetch(getApiUrl(API_ENDPOINTS.REMOVE_MEMBER), {
        method: 'DELETE',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          invite_id: memberId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || `Failed to remove team member: ${response.status}`);
      }
      
      // For now, just remove from local state for mock implementation
      setTeamMembers(teamMembers.filter(member => member.id !== memberId));
      
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
    }
  };

  const onInviteSubmit = async (data: InviteFormValues) => {
    try {
      setIsSubmitting(true);
      setInviteApiError(null);
      
      const token = getToken();
      if (!token) {
        throw new Error("You must be logged in to send invitations");
      }
      
      const response = await fetch(getApiUrl('users/create_team_invite/'), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          email: data.email,
          team_role_id: data.team_role_id
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        if (responseData.error) {
            if(responseData.error.fields && responseData.error.fields.hasOwnProperty("email")){
                setInviteApiError(responseData.error.fields.email[0]);
            } else {
                setInviteApiError(responseData.error.message || "Failed to send invitation");
            }
          return;
        } else {
          throw new Error(responseData.error.message || `Failed to send invitation: ${response.status}`);
        }
      }
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${data.email}.`,
      });
      
      fetchTeamMembers();
      
      inviteForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while sending the invitation.",
        variant: "destructive",
      });
      console.error("Team invite error:", error);
    } finally {
      setIsSubmitting(false);
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

  if (!showTeamManagement) {
    return null;
  }

  return (
    <section className="p-8">
      <div className="mb-8 pl-2">
        <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-100">Team Management</h2>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          Manage team members and their access to your 7en.ai workspace
        </p>
      </div>

      {/* Inline Invite Form */}
      <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 mb-6 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Mail className="h-5 w-5" />
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
                      autoComplete="email"
                      className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 rounded-xl h-11"
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
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600 rounded-xl h-11">
                        <SelectValue placeholder="Can view" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingRoles ? (
                        <div className="flex justify-center items-center py-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="ml-2 text-sm">Loading roles...</span>
                        </div>
                      ) : availableRoles.length > 0 ? (
                        availableRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-roles" disabled>No roles available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ModernButton 
              type="submit" 
              variant="primary"
              icon={Send}
              disabled={isSubmitting}
              className="font-medium h-11 px-6"
            >
              {isSubmitting ? 'Sending...' : 'Send'}
            </ModernButton>
          </form>
        </Form>

        {inviteForm.watch("team_role_id") && (
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50 mt-4">
            <h4 className="text-sm font-semibold mb-3 text-slate-900 dark:text-slate-100">Role Permissions</h4>
            <ScrollArea className="h-[100px]">
              <div className="space-y-2">
                {availableRoles.find(r => r.id === inviteForm.watch("team_role_id"))?.permissions.map(permission => (
                  <div key={permission.id} className="flex items-center justify-between py-1.5 px-3 bg-white/60 dark:bg-slate-700/60 rounded-lg">
                    <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{permission.name.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{permission.description}</span>
                  </div>
                ))}
                {availableRoles.find(r => r.id === inviteForm.watch("team_role_id"))?.permissions.length === 0 && (
                  <div className="text-center py-3 text-slate-500 dark:text-slate-400 text-sm">
                    This role has no permissions assigned
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Current Owner - More Compact */}
      <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-600/50 mb-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{user?.name || 'You'}</h3>
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 text-xs">Owner</Badge>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Team Members List - More Compact */}
      {(teamMembers.length > 0 || loading) && (
        <div className="bg-white/50 dark:bg-slate-700/50 rounded-2xl border border-slate-200/50 dark:border-slate-600/50 backdrop-blur-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-600/50">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Team Members</h3>
          </div>
          
          {loading ? (
            <div className="p-6 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="divide-y divide-slate-200/50 dark:divide-slate-600/50">
              {teamMembers.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-600/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
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
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
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
                    onClick={() => member.status === 'pending' ? cancelInvite(member.id) : removeActiveMember(member.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 h-10 w-10 p-0"
                  >
                    <Trash className="h-5 w-5" />
                  </ModernButton>
                </div>
              ))}
            </div>
          )}
          
          {!loading && teamMembers.length === 0 && (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <User className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-1 text-sm">No team members yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Invite your first team member to get started collaborating.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default TeamManagementSection;
