import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlatformSettingsLayout from '@/components/settings/platform/PlatformSettingsLayout';
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit, 
  Trash2,
  FileText,
  CreditCard,
  Loader2
} from 'lucide-react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { API_ENDPOINTS, BASE_URL, getAuthHeaders } from '@/utils/api-config';
import { Link, useNavigate } from 'react-router-dom';
import { CreateInvoiceDialog } from '@/components/settings/platform/CreateInvoiceDialog';
import { useSubscription, SubscriptionPlan } from '@/hooks/useSubscription';
import DeleteSubscriptionPlanDialog from '@/components/settings/platform/DeleteSubscriptionPlanDialog';
import { useBillingConfig, useUpdateBillingConfig } from '@/hooks/useBillingConfig';
import { useTopupPackages, useDeleteTopupPackage, TopupPackage } from '@/hooks/useTopupPackages';
import { useTopupRanges, useDeleteTopupRange, TopupRange } from '@/hooks/useTopupRanges';
import { useAddons, useDeleteAddon, Addon } from '@/hooks/useAddons';
import TopupPackageDialog from '@/components/settings/platform/TopupPackageDialog';
import TopupRangeDialog from '@/components/settings/platform/TopupRangeDialog';
import { AddonDialog } from '@/components/settings/platform/AddonDialog';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernDropdown } from '@/components/ui/modern-dropdown';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Invoice {
  id: string;
  business: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
}

const BillingSettings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Billing configuration state
  const { data: billingConfig, isLoading: isLoadingConfig, error: configError } = useBillingConfig();
  const updateConfigMutation = useUpdateBillingConfig();
  
  const [defaultCurrency, setDefaultCurrency] = useState('usd');
  const [defaultTaxRate, setDefaultTaxRate] = useState('10');
  const [enableAutoRenewal, setEnableAutoRenewal] = useState(true);
  const [enableProration, setEnableProration] = useState(true);
  const [autoSendReceipts, setAutoSendReceipts] = useState(true);
  const [companyName, setCompanyName] = useState('7en AI Inc.');
  const [companyAddress, setCompanyAddress] = useState('123 AI Street, San Francisco, CA 94103, USA');
  const [invoiceFooter, setInvoiceFooter] = useState('Thank you for your business. Please contact billing@example.com for any questions.');
  const [reminderDays, setReminderDays] = useState('3');
  const [overdueNotifications, setOverdueNotifications] = useState(true);
  
  // Use the updated useSubscription hook with options
  const { 
    subscriptionPlans,
    isLoadingSubscriptionPlans,
    subscriptionPlansError,
    refetchSubscriptionPlans
  } = useSubscription({ fetchCurrent: false, fetchAllPlans: true, fetchInvoice: true });

  // Topup hooks
  const { data: topupPackages, isLoading: isLoadingPackages } = useTopupPackages();
  const { data: topupRanges, isLoading: isLoadingRanges } = useTopupRanges();
  const deletePackageMutation = useDeleteTopupPackage();
  const deleteRangeMutation = useDeleteTopupRange();
  
  // Add-ons hooks
  const { data: addons, isLoading: isLoadingAddons } = useAddons();
  const deleteAddonMutation = useDeleteAddon();
  
  // Topup dialog states
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [rangeDialogOpen, setRangeDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TopupPackage | null>(null);
  const [editingRange, setEditingRange] = useState<TopupRange | null>(null);
  
  // Add-on dialog states
  const [addonDialogOpen, setAddonDialogOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [addonToDelete, setAddonToDelete] = useState<Addon | null>(null);
  const [showDeleteAddonDialog, setShowDeleteAddonDialog] = useState(false);

  // Update form data when billing config is loaded
  useEffect(() => {
    if (billingConfig) {
      setDefaultCurrency(billingConfig.default_currency.toLowerCase());
      setDefaultTaxRate(billingConfig.default_tax_rate);
      setEnableAutoRenewal(billingConfig.enable_auto_renewal);
      setEnableProration(billingConfig.enable_proration);
      setAutoSendReceipts(billingConfig.auto_send_receipts);
      setCompanyName(billingConfig.company_name);
      setCompanyAddress(billingConfig.company_address);
      setInvoiceFooter(billingConfig.invoice_footer_text);
      setReminderDays(billingConfig.payment_reminder_days.toString());
      setOverdueNotifications(billingConfig.enable_overdue_notifications);
    }
  }, [billingConfig]);

  const handleSaveBillingSettings = async () => {
    try {
      const configData = {
        default_currency: defaultCurrency.toUpperCase(),
        default_tax_rate: parseFloat(defaultTaxRate),
        enable_auto_renewal: enableAutoRenewal,
        enable_proration: enableProration,
        auto_send_receipts: autoSendReceipts,
        company_name: companyName,
        company_address: companyAddress,
        invoice_footer_text: invoiceFooter,
        payment_reminder_days: parseInt(reminderDays),
        enable_overdue_notifications: overdueNotifications,
      };

      await updateConfigMutation.mutateAsync(configData);

      toast({
        title: "Settings Saved",
        description: "Billing configuration has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save billing settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Invoice management state
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: "INV-2025-001", business: "Acme Corp", amount: "$499.00", status: "paid", date: "May 01, 2025" },
    { id: "INV-2025-002", business: "Globex Industries", amount: "$199.00", status: "pending", date: "May 03, 2025" },
    { id: "INV-2025-003", business: "Stark Enterprises", amount: "$49.00", status: "overdue", date: "Apr 15, 2025" },
    { id: "INV-2025-004", business: "Wayne Enterprises", amount: "$299.00", status: "paid", date: "May 05, 2025" },
    { id: "INV-2025-005", business: "Umbrella Corp", amount: "$149.00", status: "pending", date: "May 07, 2025" },
    { id: "INV-2025-006", business: "Cyberdyne Systems", amount: "$399.00", status: "paid", date: "May 10, 2025" },
    { id: "INV-2025-007", business: "Oscorp Industries", amount: "$79.00", status: "overdue", date: "Apr 25, 2025" },
    { id: "INV-2025-008", business: "LexCorp", amount: "$599.00", status: "paid", date: "May 12, 2025" },
  ]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

 

  // Get current invoices for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;


  const handleDeletePlanRequest = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletePlanConfirm = async () => {
    if (!planToDelete || !planToDelete.id) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).accessToken : null;
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      console.log('Deleting subscription plan with ID:', planToDelete.id);
      
      const response = await fetch(`${BASE_URL}subscriptions/delete/${planToDelete.id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });
      
      console.log('Delete response status:', response.status);
      
      // Check if the response is successful (2xx status codes)
      if (response.ok) {
        // Try to parse JSON response, but don't fail if it's empty
        let responseData = null;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            responseData = await response.json();
            console.log('Delete response data:', responseData);
          } catch (parseError) {
            console.log('No JSON response body or failed to parse, but delete was successful');
          }
        }
        
        // Refetch subscription plans after successful deletion
        await refetchSubscriptionPlans();
        
        toast({
          title: "Plan Deleted",
          description: responseData?.message || "Subscription plan has been deleted successfully.",
        });
        
        setIsDeleteDialogOpen(false);
        setPlanToDelete(undefined);
      } else {
        // Handle error responses
        let errorMessage = 'Failed to delete subscription plan';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.log('Failed to parse error response');
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete subscription plan.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCsv = () => {
    // Create CSV content
    let csvContent = "Invoice ID,Business,Amount,Status,Date\n";
    
    
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: "Invoices have been exported to CSV.",
    });
  };


  const handleCreatePlan = () => {
    navigate('/settings/platform/subscription-plan');
  };

  const handleEditPlan = (planId: number) => {
    navigate(`/settings/platform/subscription-plan/${planId}`);
  };

  const handleDeletePackage = async (packageId: number) => {
    try {
      await deletePackageMutation.mutateAsync(packageId);
      toast({
        title: "Package Deleted",
        description: "Topup package has been deleted successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete topup package.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRange = async (rangeId: number) => {
    try {
      await deleteRangeMutation.mutateAsync(rangeId);
      toast({
        title: "Range Deleted", 
        description: "Topup range has been deleted successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete topup range.",
        variant: "destructive"
      });
    }
  };

  const handleEditPackage = (pkg: TopupPackage) => {
    setEditingPackage(pkg);
    setPackageDialogOpen(true);
  };

  const handleEditRange = (range: TopupRange) => {
    setEditingRange(range);
    setRangeDialogOpen(true);
  };

  const handleDeleteAddonRequest = (addon: Addon) => {
    setAddonToDelete(addon);
    setShowDeleteAddonDialog(true);
  };

  const confirmDeleteAddon = async () => {
    if (!addonToDelete) return;
    
    try {
      await deleteAddonMutation.mutateAsync(addonToDelete.id);
      toast({
        title: "Add-on Deleted",
        description: "Add-on has been deleted successfully.",
        variant: "success"
      });
      setShowDeleteAddonDialog(false);
      setAddonToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete add-on.",
        variant: "destructive"
      });
    }
  };

  const handleEditAddon = (addon: Addon) => {
    setEditingAddon(addon);
    setAddonDialogOpen(true);
  };

  return (
    <PlatformSettingsLayout
      title="Billing Settings"
      description="Manage subscription plans and platform billing configurations"
    >
      <Tabs defaultValue="plans">
        <TabsList className="grid w-[450px] grid-cols-4 mb-8 bg-neutral-200 dark:bg-neutral-800 p-1 rounded-xl">
          <TabsTrigger value="plans" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700">Subscriptions</TabsTrigger>
          <TabsTrigger value="addons" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700">Add-ons</TabsTrigger>
          <TabsTrigger value="topup" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700">Topup</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans">
          <section className="p-8 bg-white dark:bg-neutral-800/50 rounded-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl flex items-center justify-center bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
                    <svg className="h-5 w-5" style={{color: 'hsl(var(--primary))'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Subscription Plans</h2>
                  </div>
                </div>
                <ModernButton onClick={handleCreatePlan} variant="primary" size='sm'>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Plan
                </ModernButton>
              </div>
            </div>
            <div className="bg-transparent dark:bg-transparent rounded-2xl p-0 backdrop-blur-sm">
              <div className="space-y-6">
                {isLoadingSubscriptionPlans ? (
                  <div className="text-center py-8">Loading subscription plans...</div>
                ) : subscriptionPlansError ? (
                  <div className="text-center py-8 text-red-500">
                    Error loading subscription plans. Please try again.
                  </div>
                ) : subscriptionPlans && subscriptionPlans.length > 0 ? (
                  subscriptionPlans.map((plan) => (
                    <Card key={plan.id} className="dark:text-gray-200 bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl border border-neutral-200/50 dark:border-none">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{plan.name}</h3>
                            <div className="text-2xl font-bold mt-1">${plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                          </div>
                          <div className="flex gap-2">
                            <ModernButton 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditPlan(plan.id!)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </ModernButton>
                            <ModernButton 
                              variant="outline" 
                              size="sm" 
                              className="text-red-500 hover:bg-red-50"
                              onClick={() => handleDeletePlanRequest(plan)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </ModernButton>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-4">{plan.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {plan.features?.map((feature, i) => (
                            <Badge key={i} variant="outline">{feature}</Badge>
                          ))}
                        </div>
                        
                        <div className="text-sm text-muted-foreground flex gap-4">
                          <div>Duration: {plan.duration_days} days</div>
                          <div>Total Replies: {plan.total_replies}</div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No subscription plans found. Create your first plan to get started.
                  </div>
                )}
              </div>
            </div>
          </section>
        </TabsContent>
        
        <TabsContent value="addons">
          <section className="p-8 bg-white dark:bg-neutral-800/50 rounded-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl flex items-center justify-center bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
                    <svg className="h-5 w-5" style={{color: 'hsl(var(--primary))'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Subscription Add-ons</h2>
                    <p className="text-sm text-muted-foreground">Manage additional features that users can add to their subscriptions</p>
                  </div>
                </div>
                <ModernButton 
                  onClick={() => {
                    setEditingAddon(null);
                    setAddonDialogOpen(true);
                  }}
                  variant="primary"
                  size='sm'
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Add-on
                </ModernButton>
              </div>
            </div>
            <div className="bg-transparent dark:bg-transparent rounded-2xl p-0 backdrop-blur-sm">
              <div className="space-y-6">
                {isLoadingAddons ? (
                  <div className="text-center py-8">Loading add-ons...</div>
                ) : addons && addons.length > 0 ? (
                  addons.map((addon) => (
                    <Card key={addon.id} className="dark:text-gray-200 bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl border border-neutral-200/50 dark:border-none">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{addon.name}</h3>
                            <div className="text-2xl font-bold mt-1">
                              ${addon.price_monthly}
                              <span className="text-sm font-normal text-muted-foreground">/month</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge 
                              variant={addon.status === 'ACTIVE' ? 'default' : 'secondary'}
                            >
                              {addon.status}
                            </Badge>
                            <ModernButton 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditAddon(addon)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </ModernButton>
                            <ModernButton 
                              variant="outline" 
                              size="sm" 
                              className="text-red-500 hover:bg-red-50"
                              onClick={() => handleDeleteAddonRequest(addon)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </ModernButton>
                          </div>
                        </div>
                        
                        {addon.description && (
                          <p className="text-muted-foreground">{addon.description}</p>
                        )}
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No add-ons found. Create your first add-on to get started.
                  </div>
                )}
              </div>
            </div>
          </section>
        </TabsContent>
        
        <TabsContent value="topup">
          
          <Card className="p-6 bg-white dark:bg-neutral-800/50">
            
            <CardContent className="space-y-6 p-0">
            <Tabs defaultValue="packages" className="w-full">
              <TabsList className="grid grid-cols-2 bg-neutral-200 dark:bg-neutral-800 p-1 rounded-xl w-52 m-auto">
                <TabsTrigger value="packages" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700">Packages</TabsTrigger>
                <TabsTrigger value="ranges" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700">Ranges</TabsTrigger>
              </TabsList>
              
              <TabsContent value="packages">
                <Card className="p-0 mt-6 bg-transparent dark:bg-transparent">
                  <CardHeader className="flex flex-row items-center justify-between p-0 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl flex items-center justify-center bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
                        <svg className="h-5 w-5" style={{color: 'hsl(var(--primary))'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Topup Packages</h2>
                      </div>
                    </div>
                    <ModernButton 
                      onClick={() => {
                        setEditingPackage(null);
                        setPackageDialogOpen(true);
                      }}
                      variant="primary"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Package
                    </ModernButton>
                  </CardHeader>
                  <CardContent className="p-0 pt-4">
                    {isLoadingPackages ? (
                      <div className="text-center py-8">Loading packages...</div>
                    ) : topupPackages && topupPackages.length > 0 ? (
                      <div className="space-y-4">
                        {topupPackages.map((pkg) => (
                          <Card key={pkg.id} className="dark:text-gray-200 bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl border border-neutral-200/50 dark:border-none">
                            <div className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-semibold">{pkg.name}</h3>
                                  <div className="text-2xl font-bold mt-1">
                                    ${pkg.amount}
                                    <span className="text-sm font-normal text-muted-foreground ml-2">
                                      {pkg.replies} replies
                                    </span>
                                  </div>
                                  <Badge 
                                    variant={pkg.status === 'ACTIVE' ? 'default' : 'secondary'}
                                    className="mt-2"
                                  >
                                    {pkg.status}
                                  </Badge>
                                </div>
                                <div className="flex gap-2">
                                  <ModernButton 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditPackage(pkg)}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </ModernButton>
                                  <ModernButton 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-500 hover:bg-red-50"
                                    onClick={() => handleDeletePackage(pkg.id)}
                                    disabled={deletePackageMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </ModernButton>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No topup packages found. Create your first package to get started.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="ranges">
                <Card className="p-0 mt-6 bg-transparent dark:bg-transparent">
                  <CardHeader className="flex flex-row items-center justify-between p-0 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl flex items-center justify-center bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
                        <svg className="h-5 w-5" style={{color: 'hsl(var(--primary))'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Topup Ranges</h2>
                      </div>
                    </div>
                    <ModernButton 
                      onClick={() => {
                        setEditingRange(null);
                        setRangeDialogOpen(true);
                      }}
                      variant="primary"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Range
                    </ModernButton>
                  </CardHeader>
                  <CardContent className="p-0 pt-4">
                    {isLoadingRanges ? (
                      <div className="text-center py-8">Loading ranges...</div>
                    ) : topupRanges && topupRanges.length > 0 ? (
                      <div className="space-y-4">
                        {topupRanges.map((range) => (
                          <Card key={range.id} className="dark:text-gray-200 bg-neutral-50/80 dark:bg-neutral-800/70 rounded-xl border border-neutral-200/50 dark:border-none">
                            <div className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-semibold">{range.name}</h3>
                                  <div className="text-lg font-bold mt-1">
                                    ${range.price_per_reply} per reply
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    Quantity: {range.min_qty} - {range.max_qty} replies
                                  </div>
                                  <Badge 
                                    variant={range.active ? 'default' : 'secondary'}
                                    className="mt-2"
                                  >
                                    {range.active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>
                                <div className="flex gap-2">
                                  <ModernButton 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditRange(range)}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </ModernButton>
                                  <ModernButton 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-red-500 hover:bg-red-50"
                                    onClick={() => handleDeleteRange(range.id)}
                                    disabled={deleteRangeMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </ModernButton>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No topup ranges found. Create your first range to get started.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6 bg-white dark:bg-neutral-800/70">
            
            <CardContent className="space-y-8 p-0">
              {isLoadingConfig ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading billing configuration...</span>
                </div>
              ) : configError ? (
                <div className="text-center py-8 text-red-600">
                  Failed to load billing configuration. Please try again.
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-foreground">General Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="billingCurrency">Default Currency</Label>
                        <ModernDropdown
                          value={defaultCurrency}
                          onValueChange={setDefaultCurrency}
                          options={[
                            { label: "USD ($)", value: "usd"},
                            { label: "EUR (€)", value: "eur"},
                            { label: "GBP (£)", value: "gbp"}
                          ]}
                          placeholder="Select Members"
                          className="text-xs rounded-xl border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                        <Input 
                          id="taxRate" 
                          type="number" 
                          variant="modern"
                          value={defaultTaxRate}
                          onChange={(e) => setDefaultTaxRate(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="autoRenew" 
                          checked={enableAutoRenewal}
                          onCheckedChange={setEnableAutoRenewal}
                        />
                        <Label htmlFor="autoRenew">Enable Auto-Renewal by Default</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="prorateBilling" 
                          checked={enableProration}
                          onCheckedChange={setEnableProration}
                        />
                        <Label htmlFor="prorateBilling">Enable Proration for Plan Changes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="sendReceipts" 
                          checked={autoSendReceipts}
                          onCheckedChange={setAutoSendReceipts}
                        />
                        <Label htmlFor="sendReceipts">Automatically Send Receipts</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-foreground">Invoice Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input 
                          id="companyName" 
                          value={companyName}
                          variant="modern"
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyAddress">Company Address</Label>
                        <Textarea 
                          id="companyAddress" 
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoiceFooter">Invoice Footer Text</Label>
                      <Textarea 
                        id="invoiceFooter" 
                        value={invoiceFooter}
                        onChange={(e) => setInvoiceFooter(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-foreground">Reminders & Notifications</h3>
                    <div className="space-y-2">
                      <Label htmlFor="reminderDays">Send Payment Reminder (days before due date)</Label>
                      <Input 
                        id="reminderDays" 
                        type="number" 
                        value={reminderDays}
                        variant="modern"
                        onChange={(e) => setReminderDays(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="overdueNotifications" 
                        checked={overdueNotifications}
                        onCheckedChange={setOverdueNotifications}
                      />
                      <Label htmlFor="overdueNotifications">Enable Overdue Payment Notifications</Label>
                    </div>
                  </div>
                  <div className='flex justify-end'>
                  <ModernButton 
                    onClick={handleSaveBillingSettings}
                    disabled={updateConfigMutation.isPending}
                    variant="primary"
                  >
                    {updateConfigMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Settings'
                    )}
                  </ModernButton>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      

      <DeleteSubscriptionPlanDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        plan={planToDelete}
        onDelete={handleDeletePlanConfirm}
        isDeleting={isDeleting}
      />

      <TopupPackageDialog
        open={packageDialogOpen}
        onOpenChange={(open) => {
          setPackageDialogOpen(open);
          if (!open) setEditingPackage(null);
        }}
        editPackage={editingPackage}
      />

      <TopupRangeDialog
        open={rangeDialogOpen}
        onOpenChange={(open) => {
          setRangeDialogOpen(open);
          if (!open) setEditingRange(null);
        }}
        editRange={editingRange}
      />

      <AddonDialog
        open={addonDialogOpen}
        onOpenChange={(open) => {
          setAddonDialogOpen(open);
          if (!open) setEditingAddon(null);
        }}
        addon={editingAddon}
      />

      <AlertDialog open={showDeleteAddonDialog} onOpenChange={setShowDeleteAddonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Add-on</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{addonToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAddon}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAddonMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PlatformSettingsLayout>
  );
};

export default BillingSettings;
