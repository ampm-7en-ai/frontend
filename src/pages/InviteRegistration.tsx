
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl, API_ENDPOINTS } from '@/utils/api-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, User, Lock, Mail, AlertCircle, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const inviteRegistrationSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type InviteRegistrationValues = z.infer<typeof inviteRegistrationSchema>;

const InviteRegistration = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite_token');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const form = useForm<InviteRegistrationValues>({
    resolver: zodResolver(inviteRegistrationSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    } 
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!inviteToken) {
        setTokenValid(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${getApiUrl(API_ENDPOINTS.VALIDATE_INVITE)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invite_token: inviteToken
          })
        });

        if (!response.ok) {
          // Handle HTTP errors
          const errorText = await response.text();
          console.error("Token validation error:", errorText);
          setTokenValid(false);
          throw new Error(`HTTP error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        
        if (data.valid) {
          console.log("Token validation successful:", data);
          setTokenValid(true);
          setInvitedEmail(data.email);
          setBusinessName(data.team_name);
          setUserRole(data.role);
        } else {
          console.error("Invalid token:", data);
          setTokenValid(false);
          // Use the error message from the API response
          throw new Error(data.error || "Invalid invitation token");
        }
      } catch (error) {
        console.log("Token validation error:", error);
        setTokenValid(false);
        toast({
          title: "Invalid Invitation",
          description: error.message || "This invitation link is invalid or has expired.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [inviteToken, toast]);

  const onSubmit = async (values: InviteRegistrationValues) => {
    if (!inviteToken || !invitedEmail) {
      toast({
        title: "Registration Error",
        description: "Invalid invitation details.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        username: values.username,
        email: invitedEmail,
        password: values.password,
        invite_token: inviteToken,
      };

      // Updated endpoint to use INVITE_REGISTER
      const response = await fetch(getApiUrl(API_ENDPOINTS.INVITE_REGISTER), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json().catch(() => ({ message: "An error occurred" }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      console.log("Registration response:", data);
      
      // Updated to handle the actual API response structure
      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully.",
      });
      
      // Login with the received credentials
      await login(values.username, values.password, {
        accessToken: data.access, // Updated to match API response
        refreshToken: null, // No refresh token in the response
        userId: Number(data.user_id), // Updated to match API response
        role: data.user_role, // Updated to match API response
        isVerified: true // Assume verified since it's an invite
      });
      
      // Navigate based on user role
      if (data.user_role === 'superadmin') {
        navigate('/dashboard/superadmin');
      } else if (data.user_role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  // Loading state - show when checking token validity
  if (isLoading && tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Validating Invitation</CardTitle>
            <CardDescription>Please wait while we validate your invitation...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token state
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>This invitation link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Valid token state - show registration form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="text-primary font-bold text-3xl mb-1">7en.ai</div>
          <p className="text-dark-gray text-sm">European-compliant multi-agent AI platform</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Complete Your Registration</CardTitle>
            {businessName && (
              <CardDescription className="text-center">
                You've been invited to join <span className="font-medium">{businessName}</span>
                {userRole && (
                  <> as <span className="font-medium capitalize">{userRole}</span></>
                )}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {invitedEmail && (
              <Alert className="mb-6">
                <Mail className="h-4 w-4" />
                <AlertTitle>Invited Email</AlertTitle>
                <AlertDescription>
                  You're completing registration for <span className="font-medium">{invitedEmail}</span>
                </AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input placeholder="username" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input type="password" placeholder="•••••••" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input type="password" placeholder="•••••••" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Complete Registration"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <Button 
              variant="link" 
              className="text-sm"
              onClick={handleLoginRedirect}
            >
              Already have an account? Log in
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default InviteRegistration;
