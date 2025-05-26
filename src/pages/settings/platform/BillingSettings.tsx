import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
  CreditCard
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

  return (
    <PlatformSettingsLayout
      title="Billing Settings"
      description="Manage subscription plans and platform billing configurations"
    >
      <Tabs defaultValue="plans">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Subscription Plans</CardTitle>
                  <CardDescription>Manage plans and pricing packages</CardDescription>
                </div>
                <Button onClick={handleCreatePlan}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {isLoadingSubscriptionPlans ? (
                  <div className="text-center py-8">Loading subscription plans...</div>
                ) : subscriptionPlansError ? (
                  <div className="text-center py-8 text-red-500">
                    Error loading subscription plans. Please try again.
                  </div>
                ) : subscriptionPlans && subscriptionPlans.length > 0 ? (
                  subscriptionPlans.map((plan) => (
                    <Card key={plan.id} className="border">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{plan.name}</h3>
                            <div className="text-2xl font-bold mt-1">${plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditPlan(plan.id!)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-500 hover:bg-red-50"
                              onClick={() => handleDeletePlanRequest(plan)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-4">{plan.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {plan.features?.map((feature, i) => (
                            <Badge key={i} variant="outline">{feature}</Badge>
                          ))}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          Duration: {plan.duration_days} days
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Invoice Management</CardTitle>
                  <CardDescription>View and manage all platform invoices</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportCsv}>
                    <Download className="h-4 w-4 mr-2" /> 
                    Export CSV
                  </Button>
                  <Button onClick={() => setIsCreateInvoiceOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> 
                    Create Invoice
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search invoices..." 
                      className="pl-10" 
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page on new search
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select 
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
                    </Select>
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Billing Configuration</CardTitle>
              <CardDescription>Manage global billing settings and defaults</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">General Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billingCurrency">Default Currency</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger id="billingCurrency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                    <Input id="taxRate" type="number" defaultValue="10" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="autoRenew" defaultChecked />
                    <Label htmlFor="autoRenew">Enable Auto-Renewal by Default</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="prorateBilling" defaultChecked />
                    <Label htmlFor="prorateBilling">Enable Proration for Plan Changes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="sendReceipts" defaultChecked />
                    <Label htmlFor="sendReceipts">Automatically Send Receipts</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Invoice Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" defaultValue="7en AI Inc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyAddress">Company Address</Label>
                    <Textarea id="companyAddress" defaultValue="123 AI Street, San Francisco, CA 94103, USA" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceFooter">Invoice Footer Text</Label>
                  <Textarea id="invoiceFooter" defaultValue="Thank you for your business. Please contact billing@example.com for any questions." />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Reminders & Notifications</h3>
                <div className="space-y-2">
                  <Label htmlFor="reminderDays">Send Payment Reminder (days before due date)</Label>
                  <Input id="reminderDays" type="number" defaultValue="3" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="overdueNotifications" defaultChecked />
                  <Label htmlFor="overdueNotifications">Enable Overdue Payment Notifications</Label>
                </div>
              </div>
              
              <Button>Save Settings</Button>
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
    </PlatformSettingsLayout>
  );
};

export default BillingSettings;
