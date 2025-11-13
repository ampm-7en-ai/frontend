import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Globe, Building, Phone, MapPin, User, Lock } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl, API_ENDPOINTS, authApi } from "@/utils/api-config";
import { GOOGLE_AUTH_CONFIG, GOOGLE_OAUTH_SCOPES, RECAPTCHA_CONFIG } from "@/utils/auth-config";
import { useAuth } from "@/context/AuthContext";
import ModernButton from "@/components/dashboard/ModernButton";
import { useAppTheme } from "@/hooks/useAppTheme";

const signupSchema = z.object({
  business_name: z.string().min(1, "Business name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  phone_number: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSignupSuccess: (data: any, email: string) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess }) => {
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme } = useAppTheme();
  const { login, setPendingVerificationEmail, setNeedsVerification } = useAuth();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      business_name: "",
      email: "",
      password: "",
      phone_number: "",
      website: "",
      address: "",
      username: "",
    },
  });

  const handleSignup = async (values: SignupFormValues) => {
    setIsLoading(true);

    try {
      // Execute reCAPTCHA
      let recaptchaToken: string | undefined;
      try {
        recaptchaToken = await window.grecaptcha.execute(RECAPTCHA_CONFIG.SITE_KEY, { action: "signup" });
      } catch (error) {
        console.error("reCAPTCHA error:", error);
        toast({
          title: "Verification Failed",
          description: "Could not verify reCAPTCHA. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const payload = {
        bussiness_name: values.business_name,
        email: values.email,
        password: values.password,
        phone_number: values.phone_number,
        website: values.website || "",
        address: values.address,
        username: values.username,
      };

      console.log("Sending signup data:", payload);

      try {
        const response = await authApi.register(payload, recaptchaToken);

        const data = await response.json();

        if (response.ok) {
          if (data.message) {
            toast({
              title: "Registration Status",
              description: data.message,
              variant: "default",
            });
          }

          handleRegistrationSuccess(data, values.email);
        } else {
          handleRegistrationError(data);
        }
      } catch (error) {
        console.error("API call failed:", error);

        if (process.env.NODE_ENV === "development") {
          const simulatedData = {
            status: "success",
            message: "OTP sent for verification",
            data: {
              user: {
                username: values.username,
                email: values.email,
                business_name: values.business_name,
              },
            },
          };

          handleRegistrationSuccess(simulatedData, values.email);

          toast({
            title: "Development Mode",
            description: "Using simulated response for demonstration purposes",
            variant: "default",
          });
        } else {
          toast({
            title: "Registration Error",
            description: "Could not connect to registration service. Please try again later.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationSuccess = (data: any, email: string) => {
    console.log("Registration success:", data);

    setPendingVerificationEmail(email);
    setNeedsVerification(true);

    navigate("/verify", { state: { email } });

    toast({
      title: "Account Created",
      description: "Please verify your email to continue",
      variant: "default",
    });
  };

  const handleRegistrationError = (data: any) => {
    console.log("Registration error response:", data);

    if (data.username) {
      form.setError("username", {
        type: "server",
        message: Array.isArray(data.username) ? data.username[0] : data.username,
      });
    }

    if (data.email) {
      form.setError("email", {
        type: "server",
        message: Array.isArray(data.email) ? data.email[0] : data.email,
      });
    }

    if (!data.username && !data.email && data.error.message) {
      if (data.error.fields.hasOwnProperty("username")) {
        toast({
          title: "Registration Failed",
          description: data.error.fields.username[0],
          variant: "destructive",
        });
      } else if (data.error.fields.hasOwnProperty("email")) {
        toast({
          title: "Registration Failed",
          description: data.error.fields.email[0],
          variant: "destructive",
        });
      }
    } else if (!data.username && !data.email && !data.error.message) {
      toast({
        title: "Registration Failed",
        description: "Please check your information and try again",
        variant: "destructive",
      });
    }
  };

  const handleSSOLogin = async (provider: "google" | "apple", token: string) => {
    try {
      const formData = new FormData();
      formData.append("sso_token", token);
      formData.append("provider", provider);

      console.log(`Sending ${provider.toUpperCase()} SSO request to endpoint:`, API_ENDPOINTS.SSO_LOGIN);

      const apiUrl = getApiUrl(API_ENDPOINTS.SSO_LOGIN + "?provider=" + provider);
      console.log("Full API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      console.log(`${provider.toUpperCase()} SSO signup response status:`, response.status);

      const data = await response.json();
      console.log(`${provider.toUpperCase()} SSO signup response:`, data);

      if (response.ok && data.data.access) {
        const userRole = data.data.userData.user_role === "admin" ? "admin" : data.data.userData.user_role;

        await login(data.data.userData.username || `${provider} User`, "", {
          access: data.data.access,
          refresh: data.refresh || null,
          user_id: data.data.user_id,
          userData: {
            username: data.data.userData.username,
            email: data.data.userData.email || `${provider}_user@example.com`,
            avatar: data.data.userData.avatar,
            team_role: data.data.userData.team_role || null,
            user_role: userRole,
            permissions: data.data.userData.permissions || {},
            is_verified: true,
          },
        });

        toast({
          title: "Signup Successful",
          description: "Welcome! Your account has been created.",
          variant: "default",
        });

        if (userRole === "superadmin") {
          navigate("/dashboard/superadmin");
        } else if (userRole === "admin") {
          navigate("/dashboard/admin");
        } else {
          navigate("/dashboard");
        }
      } else if (data.error) {
        toast({
          title: "Signup Failed",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signup Failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`${provider.toUpperCase()} SSO signup error:`, error);
      toast({
        title: "Signup Failed",
        description: `Could not complete ${provider} sign-up. Please try again later.`,
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsGoogleLoading(true);

      const googleAuth = (window as any).google?.accounts?.oauth2;

      if (!googleAuth) {
        toast({
          title: "Google Sign-Up Error",
          description: "Google authentication is not available. Please try again later.",
          variant: "destructive",
        });
        setIsGoogleLoading(false);
        return;
      }

      const client = googleAuth.initTokenClient({
        client_id: GOOGLE_AUTH_CONFIG.CLIENT_ID,
        scope: GOOGLE_OAUTH_SCOPES,
        redirect_uris: GOOGLE_AUTH_CONFIG.REDIRECT_URI,
        callback: async (tokenResponse: any) => {
          console.log("Google OAuth token response:", tokenResponse);

          if (tokenResponse.error) {
            console.error("Google Sign-Up error:", tokenResponse.error);
            if (tokenResponse.error !== "popup_closed_by_user") {
              toast({
                title: "Google Sign-Up Failed",
                description: "There was an error signing up with Google. Please try again.",
                variant: "destructive",
              });
            }
            setIsGoogleLoading(false);
            return;
          }

          await handleSSOLogin("google", tokenResponse.access_token);
          setIsGoogleLoading(false);
        },
        error_callback: () => {
          setIsGoogleLoading(false);
        },
      });

      client.requestAccessToken();
    } catch (error) {
      console.error("Google Sign-Up initialization error:", error);
      toast({
        title: "Google Sign-Up Error",
        description: "Could not initialize Google Sign-Up. Please try again later.",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignup = async () => {
    try {
      setIsAppleLoading(true);

      const AppleID = (window as any).AppleID;

      if (!AppleID) {
        toast({
          title: "Apple Sign-Up Error",
          description: "Apple authentication is not available. Please try again later.",
          variant: "destructive",
        });
        setIsAppleLoading(false);
        return;
      }

      AppleID.auth.init({
        clientId: "com.ampmlabs.7enai.signin",
        scope: "name email",
        redirectURI: window.location.origin + "/dashboard",
        usePopup: true,
      });

      const data = await AppleID.auth.signIn();
      console.log("Apple OAuth response:", data);

      if (data.authorization && data.authorization.id_token) {
        await handleSSOLogin("apple", data.authorization.id_token);
      } else {
        toast({
          title: "Apple Sign-Up Failed",
          description: "Could not get authentication token from Apple.",
          variant: "destructive",
        });
      }

      setIsAppleLoading(false);
    } catch (error: any) {
      console.error("Apple Sign-Up error:", error);

      // Don't show error for user cancellation
      if (error.error !== "popup_closed_by_user") {
        toast({
          title: "Apple Sign-Up Error",
          description: "Could not complete Apple sign-up. Please try again later.",
          variant: "destructive",
        });
      }

      setIsAppleLoading(false);
    }
  };

  useEffect(() => {
    const loadScripts = () => {
      // Load reCAPTCHA Script
      const recaptchaScript = document.createElement("script");
      recaptchaScript.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_CONFIG.SITE_KEY}`;
      recaptchaScript.async = true;
      document.head.appendChild(recaptchaScript);

      // Load Google Script
      const googleScript = document.createElement("script");
      googleScript.src = "https://accounts.google.com/gsi/client";
      googleScript.async = true;
      googleScript.defer = true;
      googleScript.onload = () => {
        console.log("Google Identity Services script loaded");
      };
      googleScript.onerror = () => {
        console.error("Error loading Google Identity Services script");
      };
      document.head.appendChild(googleScript);

      // Load Apple Script
      const appleScript = document.createElement("script");
      appleScript.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
      appleScript.async = true;
      appleScript.defer = true;
      appleScript.onload = () => {
        console.log("Apple ID Services script loaded");
      };
      appleScript.onerror = () => {
        console.error("Error loading Apple ID Services script");
      };
      document.head.appendChild(appleScript);
    };

    loadScripts();

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Social Sign-Up Buttons */}
      <div className="space-y-3">
        <ModernButton
          type="button"
          variant="outline"
          size="lg"
          className="w-full h-11 flex items-center justify-center gap-3"
          onClick={handleGoogleSignup}
          disabled={isGoogleLoading || isAppleLoading || isLoading}
        >
          {isGoogleLoading ? (
            <LoadingSpinner size="sm" className="!mb-0" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285f4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34a853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#fbbc05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#ea4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Sign up with Google
        </ModernButton>

        <ModernButton
          type="button"
          variant="outline"
          size="lg"
          className="w-full h-11 flex items-center justify-center gap-3"
          onClick={handleAppleSignup}
          disabled={isAppleLoading || isGoogleLoading || isLoading}
        >
          {isAppleLoading ? (
            <LoadingSpinner size="sm" className="!mb-0" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          )}
          Sign up with Apple
        </ModernButton>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="dark:bg-neutral-900 bg-gray-100 px-3 text-sm text-muted-foreground mr-1">
            or continue with email
          </span>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-2" onSubmit={form.handleSubmit(handleSignup)}>
          <FormField
            control={form.control}
            name="business_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Business Name</FormLabel>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                  <FormControl>
                    <Input
                      placeholder="Enter business name"
                      variant="modern"
                      size="lg"
                      className="pl-10 pr-4"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Username</FormLabel>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                  <FormControl>
                    <Input placeholder="Enter username" variant="modern" size="lg" className="pl-10 pr-4" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Email</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      variant="modern"
                      size="lg"
                      className="pl-10 pr-4"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Password</FormLabel>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                  <FormControl>
                    <Input
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="••••••••"
                      variant="modern"
                      size="lg"
                      className="pl-10 pr-10"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                  >
                    {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Phone Number</FormLabel>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                    <FormControl>
                      <Input 
                        placeholder="+1234567890" 
                        variant="modern"
                        size="lg"
                        className="pl-10 pr-4"
                        {...field} 
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
          {/* <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Website (Optional)</FormLabel>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                  <FormControl>
                    <Input 
                      placeholder="www.example.com" 
                      variant="modern"
                      size="lg"
                      className="pl-12 pr-4"
                      {...field} 
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          {/* <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Address</FormLabel>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                  <FormControl>
                    <Input 
                      placeholder="Business Address" 
                      variant="modern"
                      size="lg"
                      className="pl-12 pr-4"
                      {...field} 
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <div className="dark:bg-transparent dark:px-0 py-2 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-neutral-400 leading-relaxed">
              By creating an account, you agree to our{" "}
              <a href="/terms" className="text-muted-foreground hover:text-foreground underline transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-muted-foreground hover:text-foreground underline transition-colors">
                Privacy Policy
              </a>
              .
            </p>
          </div>

          <ModernButton type="submit" variant="primary" size="lg" className="w-full h-11" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </ModernButton>
        </form>
      </Form>
    </div>
  );
};

export default SignupForm;
