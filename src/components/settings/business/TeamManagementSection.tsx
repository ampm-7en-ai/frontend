
import React, { useState, useEffect } from 'react';
import { Trash, Clock, Mail, Plus, User, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from '@/context/AuthContext';
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from '@/utils/api-config';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  const [showInviteDialog, setShowInviteDialog] = useState(false);
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
      
      setShowInviteDialog(false);
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
    <section>
      <h2 className="text-xl font-semibold mb-4">Team Management</h2>
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground mb-4">
            Team members who have access to your 7en.ai workspace.
          </p>
          <div className="rounded-md border">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium">{user?.name || 'You'}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Badge>Owner</Badge>
            </div>
            
            {teamMembers.length > 0 && (
              <>
                <Separator />
                <div className="p-2">
                  <p className="text-sm text-muted-foreground p-2">Team Members</p>
                  <div>
                    {teamMembers.map((member) => (
                      <div key={member.id} className="p-3 flex items-center justify-between hover:bg-muted/50 rounded-md">
                        <div>
                          <p className="font-medium">
                            {member.name || member.email}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 text-xs">
                            <span className="capitalize">{member.role}</span>
                            {member.status === 'pending' ? (
                              <>
                                <Badge variant="outline" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
                                  <Clock className="h-3 w-3 mr-1" /> waiting response
                                </Badge>
                                <span>&bull;</span>
                                <span>{member.expires_at ? calculateExpiryStatus(member.expires_at) : 'No expiry'}</span>
                              </>
                            ) : (
                              <>
                                <Badge variant="success" className="flex items-center gap-1">
                                  active
                                </Badge>
                                <span>&bull;</span>
                                <span>Added {formatDate(member.created_at || '')}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => member.status === 'pending' ? cancelInvite(member.id) : removeActiveMember(member.id)}
                            title={member.status === 'pending' ? "Cancel Invitation" : "Remove Member"}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {loading && (
              <div className="p-4 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
            
            {!loading && teamMembers.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">
                <p>No team members or pending invitations found.</p>
              </div>
            )}
            
            <Separator />
            <div className="p-4">
              <Dialog open={showInviteDialog} onOpenChange={(open) => {
                setShowInviteDialog(open);
                if (!open) {
                  setInviteApiError(null);
                  inviteForm.reset();
                } else {
                  fetchAvailableRoles();
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Invite Team Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Invite a new team member to your 7en.ai workspace.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {inviteApiError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{inviteApiError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Form {...inviteForm}>
                    <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-4">
                      <FormField
                        control={inviteForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="colleague@example.com" 
                                {...field} 
                                type="email"
                                autoComplete="email"
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
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
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
                                  <SelectItem value="" disabled>No roles available</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {inviteForm.watch("team_role_id") && (
                        <div className="border rounded-md p-3 bg-muted/30">
                          <h4 className="text-sm font-medium mb-2">Role Permissions</h4>
                          <ScrollArea className="h-[150px]">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Permission</TableHead>
                                  <TableHead>Description</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {availableRoles.find(r => r.id === inviteForm.watch("team_role_id"))?.permissions.map(permission => (
                                  <TableRow key={permission.id}>
                                    <TableCell className="font-medium">{permission.name.replace(/_/g, ' ')}</TableCell>
                                    <TableCell>{permission.description}</TableCell>
                                  </TableRow>
                                ))}
                                {availableRoles.find(r => r.id === inviteForm.watch("team_role_id"))?.permissions.length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                                      This role has no permissions assigned
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </div>
                      )}

                      <DialogFooter>
                        <Button 
                          type="submit" 
                          className="flex items-center gap-1" 
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>Sending...</>
                          ) : (
                            <>
                              <Mail className="h-4 w-4" /> Send Invitation
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default TeamManagementSection;
