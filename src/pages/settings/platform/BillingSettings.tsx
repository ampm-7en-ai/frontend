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
import TopupPackageDialog from '@/components/settings/platform/TopupPackageDialog';
import TopupRangeDialog from '@/components/settings/platform/TopupRangeDialog';
import ModernButton from '@/components/dashboard/ModernButton';
import { ModernDropdown } from '@/components/ui/modern-dropdown';

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
    invoicesList,
    isLoadingInvoices,
    invoiceError,
    isLoadingSubscriptionPlans,
    subscriptionPlansError,
    refetchSubscriptionPlans
  } = useSubscription({ fetchCurrent: false, fetchAllPlans: true, fetchInvoice: true });

  // Topup hooks
  const { data: topupPackages, isLoading: isLoadingPackages } = useTopupPackages();
  const { data: topupRanges, isLoading: isLoadingRanges } = useTopupRanges();
  const deletePackageMutation = useDeleteTopupPackage();
  const deleteRangeMutation = useDeleteTopupRange();
  
  // Topup dialog states
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [rangeDialogOpen, setRangeDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TopupPackage | null>(null);
  const [editingRange, setEditingRange] = useState<TopupRange | null>(null);

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

  // Filter invoices based on search and status
  const filteredInvoices = invoicesList.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        invoice.business.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get current invoices for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

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
    
    filteredInvoices.forEach(invoice => {
      csvContent += `${invoice.id},${invoice.business},${invoice.amount},${invoice.status},${invoice.date}\n`;
    });
    
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

  const handleCreateInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      id: `INV-2025-${String(invoicesList.length + 1).padStart(3, '0')}`,
      ...invoice
    };
    
    setInvoices([newInvoice, ...invoices]);
    
    toast({
      title: "Invoice Created",
      description: "New invoice has been created successfully.",
    });
    
    setIsCreateInvoiceOpen(false);
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

  return (
    <PlatformSettingsLayout
      title="Billing Settings"
      description="Manage subscription plans and platform billing configurations"
    >
      <Tabs defaultValue="plans">
        <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="plans" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700">Subscription Plans</TabsTrigger>
          <TabsTrigger value="invoices" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700">Invoices</TabsTrigger>
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
            <div className="bg-white/70 dark:bg-neutral-800/70 rounded-2xl p-6 backdrop-blur-sm">
              <div className="space-y-6">
                {isLoadingSubscriptionPlans ? (
                  <div className="text-center py-8">Loading subscription plans...</div>
                ) : subscriptionPlansError ? (
                  <div className="text-center py-8 text-red-500">
                    Error loading subscription plans. Please try again.
                  </div>
                ) : subscriptionPlans && subscriptionPlans.length > 0 ? (
                  subscriptionPlans.map((plan) => (
                    <Card key={plan.id} className="border dark:text-gray-200">
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
        
        <TabsContent value="invoices">
          <section className="p-8 bg-white dark:bg-neutral-800/50 rounded-2xl">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl flex items-center justify-center bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-3">
                    <svg className="h-5 w-5" style={{color: 'hsl(var(--primary))'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Invoice Management</h2> 
                  </div>
                </div>
                <div className="flex gap-2">
                  <ModernButton variant="outline" onClick={handleExportCsv} size='sm'>
                    <Download className="h-4 w-4 mr-2" /> 
                    Export CSV
                  </ModernButton>
                  <ModernButton onClick={() => setIsCreateInvoiceOpen(true)} size='sm'>
                    <Plus className="h-4 w-4 mr-2" /> 
                    Create Invoice
                  </ModernButton>
                </div>
              </div>
            </div>
            <div className="bg-white/70 dark:bg-neutral-800/70 rounded-2xl p-6 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                    <Input 
                      placeholder="Search invoices..." 
                      className="pl-10" 
                      value={searchTerm}
                      variant="modern"
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page on new search
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <ModernDropdown
                      value={statusFilter}
                      onValueChange={(value) => {
                        setStatusFilter(value);
                        setCurrentPage(1); // Reset to first page on filter change
                      }}
                      options={[
                        { label: "All Statuses", value: "all"},
                        { label: "Paid", value: "paid"},
                        { label: "Pending", value: "pending"},
                        { label: "Overdue", value: "overdue"}
                      ]}
                      placeholder="Select Members"
                      className="text-xs rounded-xl border-slate-200 dark:border-slate-700"
                    />
                    {/* <Select 
                      value={statusFilter} 
                      onValueChange={(value) => {
                        setStatusFilter(value);
                        setCurrentPage(1); // Reset to first page on filter change
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select> */}
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentInvoices.length > 0 ? (
                      currentInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                          <TableCell>{invoice.business}</TableCell>
                          <TableCell>{invoice.amount}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={
                                invoice.status === "paid" ? "bg-green-50 text-green-700" : 
                                invoice.status === "pending" ? "bg-yellow-50 text-yellow-700" : 
                                "bg-red-50 text-red-700"
                              }
                            >
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{invoice.date}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => window.location.href=`https://invoice.stripe.com/i/acct_abcdefghijklmno/${invoice.stripe_invoice_id}?s=em`}>
                              <FileText className="h-4 w-4 mr-1" /> 
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No invoices found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                {filteredInvoices.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {Math.min(indexOfFirstItem + 1, filteredInvoices.length)} to {Math.min(indexOfLastItem, filteredInvoices.length)} of {filteredInvoices.length} invoices
                    </div>
                    
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        
                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink 
                              isActive={currentPage === i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
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
              <TabsList className="grid grid-cols-2 bg-muted/50 p-1 rounded-xl w-52 m-auto">
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
                          <Card key={pkg.id} className="border text-foreground">
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
                          <Card key={range.id} className="border text-foreground">
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
          <Card className="p-6 bg-white dark:bg-neutral-800/50">
            
            <CardContent className="space-y-8 p-0 pt-6">
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
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <CreateInvoiceDialog
        open={isCreateInvoiceOpen}
        onOpenChange={setIsCreateInvoiceOpen}
        onSubmit={handleCreateInvoice}
      />

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
    </PlatformSettingsLayout>
  );
};

export default BillingSettings;
