import React, { useState } from 'react';
import { Edit, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { updateSettings } from "@/utils/api-config";
import PhoneInputField from "@/components/ui/PhoneInputField";

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
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface BusinessProfileSectionProps {
  initialData: {
    businessName: string;
    adminEmail: string;
    adminPhone: string;
    adminWebsite: string;
    isAllowed: boolean;
  };
}

const BusinessProfileSection = ({ initialData }: BusinessProfileSectionProps) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialData,
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      const payload = {
        business_details: {
          business_name: data.businessName,
          phone_number: data.adminPhone,
          website: data.adminWebsite,
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
    <section>
      <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
        <span>Business Profile</span>
        {
          initialData.isAllowed && (!isEditingProfile ? (
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
        ))
        }
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
                        <Input placeholder="admin@example.com" {...field} disabled />
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
                        <Input placeholder="https://" {...field} />
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
                        <PhoneInputField
                          value={field.value || ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={!!fieldState.error}
                          placeholder="Enter phone number"
                        />
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
              <h3 className="font-medium">Email</h3>
              <p className="text-muted-foreground">{profileForm.getValues().adminEmail}</p>
            </div>
            <div>
              <h3 className="font-medium">Website</h3>
              <p className="text-muted-foreground">{profileForm.getValues().adminWebsite}</p>
            </div>
            <div>
              <h3 className="font-medium">Phone</h3>
              <p className="text-muted-foreground">{profileForm.getValues().adminPhone}</p>
            </div>
            <div>
              <h3 className="font-medium">Subscription Plan</h3>
              <p className="text-muted-foreground">Free Tier</p>
            </div>
          </CardContent>
        )}
      </Card>
    </section>
  );
};

export default BusinessProfileSection;
