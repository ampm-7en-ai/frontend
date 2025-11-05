import React, { useState } from 'react';
import { Edit, Pen, Save, User as UserIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { updateSettings } from "@/utils/api-config";
import { ModernDropdown } from "@/components/ui/modern-dropdown";
import ModernButton from '@/components/dashboard/ModernButton';
import countryData from "@/components/ui/countryData";
import { Icon } from '@/components/icons';

const profileFormSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters."),
  adminEmail: z.string().email("Invalid email address."),
  adminPhone: z
    .string()
    .nullable()
    .refine(val => !val || val.length >= 8, {
      message: "Phone number must be at least 8 digits.",
    }),
  adminWebsite: z.string().optional().nullable(),
  privacyUrl: z.string(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface BusinessProfileSectionProps {
  initialData: {
    businessName: string;
    adminEmail: string;
    adminPhone: string;
    adminWebsite: string;
    isAllowed: boolean;
    privacyUrl: string;
  };
}

const BusinessProfileSection = ({ initialData }: BusinessProfileSectionProps) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(() => {
    if (initialData.adminPhone && initialData.adminPhone.startsWith("+")) {
      const match = countryData.find(c => initialData.adminPhone.startsWith(c.dial_code));
      return match ? match.code : "US";
    }
    return "US";
  });
  const [localNumber, setLocalNumber] = useState(() => {
    if (initialData.adminPhone && initialData.adminPhone.startsWith("+")) {
      const match = countryData.find(c => initialData.adminPhone.startsWith(c.dial_code));
      return match ? initialData.adminPhone.slice(match.dial_code.length) : initialData.adminPhone;
    }
    return initialData.adminPhone || "";
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialData,
  });

  const countryOptions = countryData.map(country => ({
    value: country.code,
    label: `${country.name} ${country.dial_code}`,
    description: country.dial_code,
    logo: country.flag
  }));

  const handleCountryChange = (countryCode: string) => {
    const country = countryData.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(countryCode);
      const fullPhone = country.dial_code + localNumber;
      profileForm.setValue('adminPhone', fullPhone);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/^0+/, "");
    setLocalNumber(num);
    const country = countryData.find(c => c.code === selectedCountry);
    if (country) {
      const fullPhone = country.dial_code + num;
      profileForm.setValue('adminPhone', fullPhone);
    }
  };

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      const payload = {
        business_details: {
          business_name: data.businessName,
          phone_number: data.adminPhone,
          website: data.adminWebsite,
          privacy_url: data.privacyUrl
        },
      };
      const res = await updateSettings(payload);

      toast({
        title: "Profile updated",
        description: res.message || "Your business profile has been updated successfully.",
      });

      if (res.data && res.data.business_details) {
        profileForm.reset({
          businessName: res.data.business_details.business_name || "",
          adminEmail: res.data.business_details.email || "",
          adminPhone: res.data.business_details.phone_number || "",
          adminWebsite: res.data.business_details.website || "",
          privacyUrl: res.data.business_details.privacy_url || "",
        });
      }

      setIsEditingProfile(false);
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error?.message || "Failed to update business profile.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="p-8 px-0">
      <div className="mb-8 pl-2">
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100">Business Profile</h2>
        <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">
          Manage your business information and contact details
        </p>
      </div>
      
      <div className="bg-white/70 dark:bg-neutral-800/70 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-transparent rounded-xl flex items-center justify-start bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
              <Icon type='plain' name={`Person`} color='hsl(var(--primary))' className='h-5 w-5' />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Business Information</h3>
          </div>
          {initialData.isAllowed && (
            <ModernButton
              variant="outline"
              size="sm"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              icon={isEditingProfile ? undefined : Pen}
            >
              {isEditingProfile ? 'Cancel' : 'Edit'}
            </ModernButton>
          )}
        </div>

        {isEditingProfile ? (
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your Business Name" 
                        {...field} 
                        variant="modern"
                      />
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
                      <Input 
                        placeholder="admin@example.com" 
                        {...field} 
                        disabled 
                        variant="modern"
                        className="opacity-60"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="adminWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://" 
                        {...field} 
                        variant="modern"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="privacyUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy url</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://" 
                        {...field} 
                        variant="modern"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="adminPhone"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <ModernDropdown
                          value={selectedCountry}
                          onValueChange={handleCountryChange}
                          options={countryOptions}
                          placeholder="Select country"
                          className="w-48"
                          searchable={true}
                          searchPlaceholder="Search countries..."
                          maxHeight="250px"
                          renderOption={(option) => (
                            <div className="flex items-center gap-3 w-full">
                              <div className="w-5 h-4 bg-center bg-cover rounded-sm flex-shrink-0" 
                                style={{ backgroundImage: `url(${option.logo})` }}
                              />
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm truncate">{option.label}</span>
                              </div>
                            </div>
                          )}
                        />
                        <Input
                          type="tel"
                          value={localNumber}
                          onChange={handlePhoneNumberChange}
                          placeholder="Phone number"
                          variant="modern"
                          className={`flex-1 ${fieldState.error ? "border-red-500" : ""}`}
                          maxLength={15}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-start pt-4">
                <ModernButton type="submit" variant="primary" icon={Save}>
                  Save Changes
                </ModernButton>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-50/80 dark:bg-neutral-800/70 rounded-[8px] p-4 border border-neutral-200/50 dark:border-none">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Business Name</h4>
                <p className="text-muted-foreground dark:text-muted-foreground">{profileForm.getValues().businessName || 'Not specified'}</p>
              </div>
              <div className="bg-neutral-50/80 dark:bg-neutral-800/70 rounded-[8px] p-4 border border-neutral-200/50 dark:border-none">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Email</h4>
                <p className="text-muted-foreground dark:text-muted-foreground">{profileForm.getValues().adminEmail || 'Not specified'}</p>
              </div>
              <div className="bg-neutral-50/80 dark:bg-neutral-800/70 rounded-[8px] p-4 border border-neutral-200/50 dark:border-none">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Website</h4>
                <p className="text-muted-foreground dark:text-muted-foreground">{profileForm.getValues().adminWebsite || 'Not specified'}</p>
              </div>
              <div className="bg-neutral-50/80 dark:bg-neutral-800/70 rounded-[8px] p-4 border border-neutral-200/50 dark:border-none">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Phone</h4>
                <p className="text-muted-foreground dark:text-muted-foreground">{profileForm.getValues().adminPhone || 'Not specified'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BusinessProfileSection;
