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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from '@/utils/api-config';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Form schemas
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

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  created_at: string;
  status: 'pending';
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active';
  last_active: string;
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
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'admin',
      status: 'active',
      last_active: '2025-04-09T08:45:00Z'
    },
    {
      id: '2',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      role: 'user',
      status: 'active',
      last_active: '2025-04-09T07:30:00Z'
    },
    {
      id: '3',
      name: 'Sara Wilson',
      email: 'sara.wilson@example.com',
      role: 'user',
      status: 'active',
      last_active: '2025-04-08T16:15:00Z'
    }
  ]);
  
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([
    {
      id: '1',
      email: 'john.doe@example.com',
      role: 'admin',
      created_at: '2025-04-08T10:30:00Z',
      status: 'pending'
    },
    {
      id: '2',
      email: 'sarah.smith@example.com',
      role: 'user',
      created_at: '2025-04-08T12:45:00Z',
      status: 'pending'
    },
    {
      id: '3',
      email: 'alex.johnson@example.com',
      role: 'admin',
      created_at: '2025-04-09T09:15:00Z',
      status: 'pending'
    }
  ]);
  
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

  const cancelInvite = async (inviteId: string) => {
    try {
      setPendingInvites(pendingInvites.filter(invite => invite.id !== inviteId));
      
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

  const resendInvite = async (email: string) => {
    try {
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

  const removeTeamMember = async (memberId: string) => {
    try {
      setTeamMembers(teamMembers.filter(member => member.id !== memberId));
      
      toast({
        title: "Team member removed",
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

  const changeTeamMemberRole = async (memberId: string, newRole: string) => {
    try {
      setTeamMembers(teamMembers.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      ));
      
      toast({
        title: "Role updated",
        description: "The team member's role has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while updating the role.",
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
      
      const token = getToken();
      if (!token) {
        throw new Error("You must be logged in to send invitations");
      }
      
      // Convert agent role to user for the API
      const roleForApi = data.role === "agent" ? "user" : data.role;
      
      const response = await fetch(getApiUrl(API_ENDPOINTS.TEAM_INVITE), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          email: data.email,
          role: roleForApi,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to send invitation' }));
        throw new Error(errorData.message || `Failed to send invitation: ${response.status}`);
      }
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${data.email} with ${data.role} role.`,
      });
      
      const newInvite: PendingInvite = {
        id: `inv-${Date.now()}`,
        email: data.email,
        role: data.role,
        created_at: new Date().toISOString(),
        status: 'pending'
      };
      
      setPendingInvites([...pendingInvites, newInvite]);
      
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
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

      <section>
        <h2 className="text-xl font-semibold mb-4">Team Management</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-6">
              Manage your team members and invitations to your 7en.ai workspace.
            </p>
            
            {/* Team Members list */}
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium mb-4">Team Members</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Current user (owner) row */}
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user?.name || 'You'}</p>
                              <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Owner
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {/* No actions for owner */}
                        </TableCell>
                      </TableRow>
                      
                      {/* Other team members */}
                      {teamMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-muted">
                                  {member.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-muted-foreground">{member.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={member.role === 'admin' ? 
                              'bg-blue-50 text-blue-700 border-blue-200' : 
                              'bg-gray-50 text-gray-700 border-gray-200'}>
                              {member.role === 'admin' ? 'Admin' : 'User'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removeTeamMember(member.id)}
                                  >
                                    <Trash className="h-4 w-4 text-red-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Remove Member</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              {/* Pending Invitations */}
              {pendingInvites.length > 0 && (
                <div>
                  <h3 className="text-base font-medium mb-4">Pending Invitations</h3>
                  <div className="space-y-3">
                    {pendingInvites.map((invite) => (
                      <div key={invite.id} className="flex items-start justify-between p-3 border rounded-md bg-muted/10">
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">{invite.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                {invite.role === 'agent' ? 'User' : invite.role}
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                Invited on {formatDate(invite.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => resendInvite(invite.email)}
                            title="Resend Invitation"
                          >
                            <Mail className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => cancelInvite(invite.id)}
                            title="Cancel Invitation"
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Invite button */}
              <div>
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
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
                                  <SelectItem value="agent">User</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Admins can manage the entire workspace. Users can only create and manage chatbots.
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

        <section>
          <h2 className="text-xl font-semibold mb-4">Billing</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h3 className="font-medium">Current Plan</h3>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-muted-foreground">Free Tier</p>
                  <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                    <DialogTrigger asChild>
                      <Button>Upgrade Plan</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Upgrade Your Plan</DialogTitle>
                        <DialogDescription>
                          Choose the plan that best fits your needs.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div className="border rounded-lg p-4 space-y-2 hover:border-primary cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">Pro Plan</h3>
                              <p className="text-sm text-muted-foreground">For growing businesses</p>
                            </div>
                            <p className="text-lg font-bold">$29/month</p>
                          </div>
                          <ul className="space-y-1 text-sm">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Unlimited messages</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>Advanced analytics</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>API access</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>5 team members</span>
                            </li>
                          </ul>
                        </div>
                        <div className="border rounded-lg p-4 space-y-2 border-primary bg-primary/5 cursor-
