
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, Calendar, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import ModernButton from '@/components/dashboard/ModernButton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Icon } from '@/components/icons';

const PaymentHistory = () => {
  const { data: paymentHistory, isLoading, error } = usePaymentHistory();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDownloadInvoice = (invoiceUrl: string, planName: string) => {
    if (!invoiceUrl) {
      toast({
        title: "Invoice not available",
        description: "No invoice URL found for this payment.",
        variant: "destructive"
      });
      return;
    }

    window.open(invoiceUrl, '_blank');
    
    toast({
      title: "Invoice downloaded",
      description: `Invoice for ${planName} is being downloaded.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-green-50 text-green-800 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
            {status}
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
            {status}
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge className="bg-red-50 text-red-800 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
            {status}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen dark:bg-[hsla(0,0%,0%,0.95)]">
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="mb-6">
          
          <ModernButton
            variant="outline"
            icon={ArrowLeft}
            onClick={()=>navigate('/settings/business')}
            className="text-muted-foreground hover:text-foreground"
            size='sm'
          >
            Back
          </ModernButton>
        
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-6">Payment History</h1>
          <p className="text-muted-foreground dark:text-muted-foreground mt-2">View your subscription and payment details</p>
        </div>

        <div className="bg-white/50 dark:bg-neutral-800/70 rounded-2xl border border-slate-200/50 dark:border-none backdrop-blur-sm overflow-hidden">
          
          
          <div className="p-6">
            {isLoading ? (
              <div className="bg-transparent">
                <div className="container mx-auto py-12 flex justify-center items-center h-12">
                  <LoadingSpinner size="lg" text="Loading..." />
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
                  <p className="font-medium">Error loading payment history</p>
                  <p className="text-sm mt-1">Please try again later.</p>
                </div>
              </div>
            ) : !paymentHistory || paymentHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground dark:text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No payment history found</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200/50 dark:border-neutral-700/50">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-neutral-50/50 dark:bg-neutral-800/70 transition-colors dark:border-neutral-600">
                      <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Plan</TableHead>
                      <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Price</TableHead>
                      <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Started</TableHead>
                      <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Ended</TableHead>
                      <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Duration</TableHead>
                      <TableHead className="font-semibold text-slate-900 dark:text-slate-100">Status</TableHead>
                      <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-100">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment, index) => (
                      <TableRow 
                        key={index}
                        className="hover:bg-neutral-50/50 dark:hover:bg-neutral-700/30 dark:border-neutral-600 transition-colors"
                      >
                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">{payment.plan_name !== null ? payment.plan_name : `Topup - ${payment.replies} replies`}</TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">${payment?.price || payment?.amount}</TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">
                          {format(new Date(payment.started_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">
                          {payment.ended_at !== null ? format(new Date(payment.ended_at), 'MMM dd, yyyy'): "-"}
                        </TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">{payment.duration == null ? `-` : payment.duration+` days`}</TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.invoice_url ? (
                            <ModernButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadInvoice(payment.invoice_url!, payment.plan_name)}
                              className="opacity-100 transition-opacity"
                              iconOnly
                            >
                              <Download className="h-4 w-4" />
                              
                            </ModernButton>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
