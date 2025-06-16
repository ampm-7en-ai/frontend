
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const PaymentHistory = () => {
  const { data: paymentHistory, isLoading, error } = usePaymentHistory();
  const { toast } = useToast();

  const handleDownloadInvoice = (invoiceUrl: string, planName: string) => {
    if (!invoiceUrl) {
      toast({
        title: "Invoice not available",
        description: "No invoice URL found for this payment.",
        variant: "destructive"
      });
      return;
    }

    // Open invoice URL in new tab for download
    window.open(invoiceUrl, '_blank');
    
    toast({
      title: "Invoice downloaded",
      description: `Invoice for ${planName} is being downloaded.`,
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'CANCELLED':
        return 'secondary';
      case 'EXPIRED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-50 text-green-700';
      case 'CANCELLED':
        return 'bg-yellow-50 text-yellow-700';
      case 'EXPIRED':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Link 
          to="/settings/business" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold">Payment History</h1>
        <p className="text-muted-foreground">View your subscription and payment details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Failed to load payment history. Please try again.
            </div>
          ) : !paymentHistory || paymentHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payment history found</p>
              <p className="text-sm">Your payment records will appear here once you subscribe to a plan.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Ended</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment, index) => (
                  <TableRow 
                    key={index}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">{payment.plan_name}</TableCell>
                    <TableCell>${payment.price}</TableCell>
                    <TableCell>
                      {format(new Date(payment.started_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(payment.ended_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{payment.duration} days</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusBadgeVariant(payment.status)}
                        className={getStatusColor(payment.status)}
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.invoice_url ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(payment.invoice_url!, payment.plan_name)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;
