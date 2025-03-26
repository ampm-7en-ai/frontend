
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Globe, Building, Phone, MapPin, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

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
  address: z.string().min(1, "Address is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSignupSuccess: (data: any, email: string) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess }) => {
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      terms: false
    }
  });

  const handleSignup = async (values: SignupFormValues) => {
    setIsLoading(true);
    
    try {
      // Create JSON payload instead of FormData
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
      
      const targetUrl = 'https://7en.ai/api/users/register/';
      
      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
          // Don't set mode to cors, let the browser handle it
        });
        
        // Handle responses regardless of status
        const data = await response.json();
        handleRegistrationResponse(data, response.ok, values.email);
      } catch (error) {
        console.error('API call failed:', error);
        
        if (process.env.NODE_ENV === 'development') {
          const simulatedData = {
            status: "success",
            message: "Account created successfully. Please check your email for verification.",
            data: {
              user: {
                username: values.username,
                email: values.email,
                business_name: values.business_name
              }
            }
          };
          
          handleRegistrationResponse(simulatedData, true, values.email);
          
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
  
  const handleRegistrationResponse = (data: any, isSuccess: boolean, email: string) => {
    console.log('Registration response:', data);
    
    if (isSuccess) {
      onSignupSuccess(data, email);
      toast({
        title: "Registration Successful",
        description: "Please check your email for verification",
        variant: "default",
      });
    } else {
      toast({
        title: "Registration Failed",
        description: data.message || "Please check your information and try again",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold text-center mb-6">Create your account</h1>
      
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSignup)}>
          <FormField
            control={form.control}
            name="business_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
                  <FormControl>
                    <Input 
                      placeholder="Your Business Name" 
                      className="pl-9" 
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
                  <FormLabel>Username</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
                    <FormControl>
                      <Input 
                        placeholder="username" 
                        className="pl-9" 
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
                  <FormLabel>Email</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="email@example.com" 
                        className="pl-9" 
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
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
                    <FormControl>
                      <Input 
                        type={showSignupPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="pl-9 pr-10" 
                        {...field} 
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-gray hover:text-black"
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
                  <FormLabel>Phone Number</FormLabel>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
                    <FormControl>
                      <Input 
                        placeholder="+1234567890" 
                        className="pl-9" 
                        {...field} 
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website (Optional)</FormLabel>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
                  <FormControl>
                    <Input 
                      placeholder="www.example.com" 
                      className="pl-9" 
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
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-gray h-4 w-4" />
                  <FormControl>
                    <Input 
                      placeholder="Business Address" 
                      className="pl-9" 
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
            name="terms"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-2 mt-4">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="grid gap-1 leading-none">
                  <FormLabel className="text-sm font-medium text-dark-gray cursor-pointer">
                    I agree to the 
                    <a href="/terms" className="text-primary hover:underline ml-1">
                      Terms of Service
                    </a> and 
                    <a href="/privacy" className="text-primary hover:underline ml-1">
                      Privacy Policy
                    </a>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full h-12 mt-6" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default SignupForm;
