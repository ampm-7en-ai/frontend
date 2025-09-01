import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Globe, Building, Phone, MapPin, User, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl, API_ENDPOINTS } from '@/utils/api-config';
import { useAuth } from '@/context/AuthContext';
import ModernButton from '@/components/dashboard/ModernButton';

const signupSchema = z.object({
  business_name: z.string().min(1, "Business name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  phone_number: z.string().min(10, "Valid phone number is required"),
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setPendingVerificationEmail, setNeedsVerification } = useAuth();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      business_name: '',
      email: '',
      password: '',
      phone_number: '',
      website: '',
      address: '',
      username: '',
    }
  });

  const handleSignup = async (values: SignupFormValues) => {
    setIsLoading(true);
    
    try {
      const payload = {
        bussiness_name: values.business_name,
        email: values.email,
        password: values.password,
        phone_number: values.phone_number,
        website: values.website || '',
        address: values.address,
        username: values.username
      };

      console.log('Sending signup data:', payload);
      
      const targetUrl = getApiUrl(API_ENDPOINTS.REGISTER);
      
      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
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
        console.error('API call failed:', error);
        
        if (process.env.NODE_ENV === 'development') {
          const simulatedData = {
            status: "success",
            message: "OTP sent for verification",
            data: {
              user: {
                username: values.username,
                email: values.email,
                business_name: values.business_name
              }
            }
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
      console.error('Registration error:', error);
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
    console.log('Registration success:', data);
    
    setPendingVerificationEmail(email);
    setNeedsVerification(true);
    
    navigate('/verify', { state: { email } });
    
    toast({
      title: "Account Created",
      description: "Please verify your email to continue",
      variant: "default",
    });
  };
  
  const handleRegistrationError = (data: any) => {
    console.log('Registration error response:', data);
    
    if (data.username) {
      form.setError('username', { 
        type: 'server', 
        message: Array.isArray(data.username) ? data.username[0] : data.username 
      });
    }
    
    if (data.email) {
      form.setError('email', { 
        type: 'server', 
        message: Array.isArray(data.email) ? data.email[0] : data.email 
      });
    }
    
    if (!data.username && !data.email && data.error.message) {
      if(data.error.fields.hasOwnProperty("username")){
         toast({
          title: "Registration Failed",
          description: data.error.fields.username[0],
          variant: "destructive",
        });
      }else if(data.error.fields.hasOwnProperty("email")){
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

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
      
      </div>
      
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSignup)}>
          <FormField
            control={form.control}
            name="business_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Business Name</FormLabel>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                  <FormControl>
                    <Input 
                      placeholder="Your Business Name" 
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
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Username</FormLabel>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                    <FormControl>
                      <Input 
                        placeholder="username" 
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
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="email@example.com" 
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
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                    <FormControl>
                      <Input 
                        type={showSignupPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        variant="modern"
                        size="lg"
                        className="pl-12 pr-12"
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
            
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Phone Number</FormLabel>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                    <FormControl>
                      <Input 
                        placeholder="+1234567890" 
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
            />
          </div>
          
          {/* <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Website (Optional)</FormLabel>
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
                <FormLabel className="text-gray-700 font-medium">Address</FormLabel>
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
          
          <div className="dark:bg-transparent dark:px-0 p-4 rounded-lg border dark:border-0">
            <p className="text-sm text-gray-600 leading-relaxed">
              By creating an account, you agree to our{" "}
              <a href="/terms" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Privacy Policy
              </a>
              .
            </p>
          </div>
          
          <ModernButton 
            type="submit" 
            variant="primary"
            size="lg"
            className="w-full h-11"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </ModernButton>
        </form>
      </Form>
    </div>
  );
};

export default SignupForm;
