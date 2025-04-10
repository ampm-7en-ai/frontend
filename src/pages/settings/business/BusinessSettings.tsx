
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, AlertCircle, Slack, CreditCard, Plus, Mail, Edit, CheckCircle2, User, Save, Trash, Clock } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from '@/utils/api-config';

const profileFormSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters."),
  adminEmail: z.string().email("Invalid email address."),
});

const inviteFormSchema = z.object({
  email: z.string().email("Invalid email address."),
  role: z.enum(["admin", "agent"]),
});

const paymentFormSchema = z.object({
  cardName: z.string().min(2, "Name must be at least 2 characters."),
  cardNumber: z.string().min(16, "Card number must be at least 16 digits.").max(19),
  expiryDate: z.string().min(5, "Expiry date must be in MM/YY format."),
  cvc: z.string().min(3, "CVC must be at least 3 digits."),
});

const preferencesFormSchema = z.object({
  emailNotifications: z.boolean(),
  timezone: z.string(),
  language: z.string(),
  defaultExportFormat: z.string()
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type InviteFormValues = z.infer<typeof inviteFormSchema>;
type PaymentFormValues = z.infer<typeof paymentFormSchema>;
type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;

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

const BusinessSettings = () => {
  const { user, getToken } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isEditingGlobalSettings, setIsEditingGlobalSettings] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteApiError, setInviteApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTeamMembers, setActiveTeamMembers] = useState<Member[]>([
    {
      id: 'user-1',
      email: 'jane.smith@example.com',
      role: 'admin',
      created_at: '2025-03-15T14:30:00Z',
      status: 'active',
      name: 'Jane Smith'
    },
    {
      id: 'user-2',
      email: 'michael.brown@example.com',
      role: 'agent',
      created_at: '2025-03-20T09:45:00Z',
      status: 'active',
      name: 'Michael Brown'
    }
  ]);
  
  const [showTeamManagement, setShowTeamManagement] = useState(true);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      businessName: user?.role === 'admin' ? 'Your Business' : 'Platform Admin',
      adminEmail: user?.email || '',
    },
  });

  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: 'agent',
    },
  });

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
    },
  });

  const preferencesForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      emailNotifications: true,
      timezone: 'UTC-8',
      language: 'en-US',
      defaultExportFormat: 'json'
    },
  });

  const [globalSettings, setGlobalSettings] = useState({
    defaultModel: 'GPT-4',
    maxContextLength: 8000,
    defaultTemperature: 0.7,
  });

  useEffect(() => {
    fetchTeamInvites();
  }, []);

  const fetchTeamInvites = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        throw new Error("You must be logged in to view team invites");
      }
      
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
      console.log("Team invites fetched:", inviteData);
      
      const formattedInvites: Member[] = inviteData.map((invite: any) => ({
        id: invite.id.toString(),
        email: invite.email,
        role: invite.role,
        status: 'pending',
        expires_at: invite.expires_at,
        used: invite.used
      }));
      
      setMembers(formattedInvites);
    } catch (error) {
      console.error("Error fetching team invites:", error);
      if (error instanceof Error && error.message !== "Only team owners can view invites") {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch team invites",
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
      
      setMembers(members.filter(member => member.id !== inviteId));
      
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

  const resendInvite = async (inviteId: string, email: string | null) => {
    if (!email) {
      toast({
        title: "Error",
        description: "No email address available for this invitation.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error("You must be logged in to resend invitations");
      }
      
      const response = await fetch(getApiUrl(`users/resend_team_invite/${inviteId}/`), {
        method: 'POST',
        headers: getAuthHeaders(token),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "An error occurred" }));
        throw new Error(errorData.error || `Failed to resend invitation: ${response.status}`);
      }
      
      toast({
        title: "Invitation resent",
        description: `An invitation has been resent to ${email}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while resending the invitation.",
        variant: "destructive",
      });
    }
  };

  const deleteMember = async (memberId: string) => {
    try {
      setMembers(members.filter(member => member.id !== memberId));
      
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

  const onProfileSubmit = (data: ProfileFormValues) => {
    toast({
      title: "Profile updated",
      description: "Your business profile has been updated successfully.",
    });
    setIsEditingProfile(false);
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
          role: data.role === "agent" ? "user" : data.role,
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        if (responseData.error) {
          setInviteApiError(responseData.error);
          return;
        } else {
          throw new Error(responseData.message || `Failed to send invitation: ${response.status}`);
        }
      }
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${data.email} with ${data.role} role.`,
      });
      
      fetchTeamInvites();
      
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

  const onPaymentSubmit = (data: PaymentFormValues) => {
    toast({
      title: "Payment method added",
      description: "Your payment method has been added successfully.",
    });
    setShowPaymentDialog(false);
    paymentForm.reset();
  };

  const onPreferencesSubmit = (data: PreferencesFormValues) => {
    toast({
      title: "Preferences updated",
      description: "Your preferences have been updated successfully.",
    });
    setIsEditingPreferences(false);
  };

  const saveGlobalSettings = () => {
    toast({
      title: "Global settings updated",
      description: "Your global agent settings have been updated successfully.",
    });
    setIsEditingGlobalSettings(false);
  };

  const handleUpgradePlan = () => {
    toast({
      title: "Plan upgraded",
      description: "Your subscription has been upgraded successfully.",
    });
    setShowUpgradeDialog(false);
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

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Settings for your organization. You can manage your organization details, plan, connected accounts, and API keys here.
        </p>
      </div>

      <div className="space-y-8">
        {/* Usage Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Usage</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium flex items-center">
                      Message credits consumed: <span className="font-bold ml-2">5/50</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-80">Number of message credits used in the current billing period.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please note that it takes a few minutes for the credits to be updated after a message is sent.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium flex items-center">
                      Web pages crawled this month: <span className="font-bold ml-2">11/50</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-80">Number of web pages crawled in the current billing period.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      This count increases each time a new webpage is crawled, whether or not you choose to use the page for training your chatbot.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Connected accounts Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Connected accounts</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Slack className="h-8 w-8 text-blue-500" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Slack</h3>
                    <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">not connected</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    To install 7en.ai to your Slack workspace, please visit the integrations page of the chatbot you want to connect.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* API Keys Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Your 7en.ai API Keys</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <p className="text-muted-foreground">
                  Upgrade your plan to enable API keys.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Business Profile Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
            <span>Business Profile</span>
            {!isEditingProfile ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" /> Edit
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditingProfile(false)}
                className="flex items-center gap-1"
              >
                Cancel
              </Button>
            )}
          </h2>
          <Card>
            {isEditingProfile ? (
              <CardContent className="pt-6">
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Business Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="adminEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Email</FormLabel>
                          <FormControl>
                            <Input placeholder="admin@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div>
                      <FormLabel>Subscription Plan</FormLabel>
                      <p className="text-muted-foreground mt-1">Free Tier</p>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button type="submit" className="flex items-center gap-1">
                        <Save className="h-4 w-4" /> Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            ) : (
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="font-medium">Business Name</h3>
                  <p className="text-muted-foreground">{profileForm.getValues().businessName}</p>
                </div>
                <div>
                  <h3 className="font-medium">Admin Email</h3>
                  <p className="text-muted-foreground">{profileForm.getValues().adminEmail}</p>
                </div>
                <div>
                  <h3 className="font-medium">Subscription Plan</h3>
                  <p className="text-muted-foreground">Free Tier</p>
                </div>
              </CardContent>
            )}
          </Card>
        </section>

        {/* Team Management Section - only shown if user has permission */}
        {showTeamManagement && (
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
                  
                  {activeTeamMembers.length > 0 && (
                    <>
                      <Separator />
                      <div className="p-2">
                        <p className="text-sm text-muted-foreground p-2">Active Members</p>
                        <div>
                          {activeTeamMembers.map((member) => (
                            <div key={member.id} className="p-3 flex items-center justify-between hover:bg-muted/50 rounded-md">
                              <div>
                                <p className="font-medium">
                                  {member.name || member.email}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <span className="capitalize">{member.role}</span>
                                  <span>&bull;</span>
                                  <span>Added {formatDate(member.created_at || '')}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => deleteMember(member.id)}
                                  title="Remove Member"
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
                  
                  {members.length > 0 && (
                    <>
                      <Separator />
                      <div className="p-2">
                        <p className="text-sm text-muted-foreground p-2">Pending Invitations</p>
                        <div>
                          {members.map((member) => (
                            <div key={member.id} className="p-3 flex items-center justify-between hover:bg-muted/50 rounded-md">
                              <div>
                                <p className="font-medium">
                                  {member.email || "No email specified"}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <span className="capitalize">{member.role}</span>
                                  <Badge variant="waiting" className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 mr-1" /> waiting response
                                  </Badge>
                                  <span>&bull;</span>
                                  <span>{member.expires_at ? calculateExpiryStatus(member.expires_at) : 'No expiry'}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {member.email && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => resendInvite(member.id, member.email)}
                                    title="Resend Invitation"
                                    className="text-xs"
                                  >
                                    Resend
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => cancelInvite(member.id)}
                                  title="Cancel Invitation"
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
                  
                  {!loading && members.length === 0 && activeTeamMembers.length === 0 && (
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
                              name="role"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Role</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="agent">Agent</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Admins can manage the entire workspace. Agents can only create and manage chatbots.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
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
        )}

        {/* Global Agent Settings Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
            <span>Global Agent Settings</span>
            {!isEditingGlobalSettings ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditingGlobalSettings(true)}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" /> Edit
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditingGlobalSettings(false)}
                className="flex items-center gap-1"
              >
                Cancel
              </Button>
            )}
          </h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              {isEditingGlobalSettings ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultModel">Default Response Model</Label>
                    <Select 
                      value={globalSettings.defaultModel} 
                      onValueChange={(value) => setGlobalSettings({...globalSettings, defaultModel: value})}
                    >
                      <SelectTrigger id="defaultModel">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GPT-4">GPT-4</SelectItem>
                        <SelectItem value="GPT-3.5">GPT-3.5</SelectItem>
                        <SelectItem value="Claude">Claude</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxContext">Maximum Context Length</Label>
                    <Select 
                      value={globalSettings.maxContextLength.toString()} 
                      onValueChange={(value) => setGlobalSettings({...globalSettings, maxContextLength: parseInt(value)})}
                    >
                      <SelectTrigger id="maxContext">
                        <SelectValue placeholder="Select context length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4000">4,000 tokens</SelectItem>
                        <SelectItem value="8000">8,000 tokens</SelectItem>
                        <SelectItem value="16000">16,000 tokens</SelectItem>
                        <SelectItem value="32000">32,000 tokens</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultTemp">Default Temperature</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        id="defaultTemp" 
                        type="number" 
                        min="0" 
                        max="1" 
                        step="0.1" 
                        value={globalSettings.defaultTemperature} 
                        onChange={(e) => setGlobalSettings({...globalSettings, defaultTemperature: parseFloat(e.target.value)})}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        Lower values produce more deterministic responses, higher values produce more creative ones.
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={saveGlobalSettings} className="flex items-center gap-1">
                      <Save className="h-4 w-4" /> Save Settings
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-medium">Default Response Model</h3>
                    <p className="text-muted-foreground">{globalSettings.defaultModel}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Maximum Context Length</h3>
                    <p className="text-muted-foreground">{globalSettings.maxContextLength.toLocaleString()} tokens</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Default Temperature</h3>
                    <p className="text-muted-foreground">{globalSettings.defaultTemperature}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default BusinessSettings;

