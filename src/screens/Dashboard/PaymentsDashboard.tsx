import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { CalendarIcon, Download, Filter, TrendingUp, Users, Globe, DollarSign } from 'lucide-react';
import { PaymentsService } from '../../services/paymentsService';
import { PaymentSummary, MonthlyTrend, PaymentFilters } from '../../lib/types/payments';
import PaymentsTable from './PaymentsTable';
import PaymentsChart from './PaymentsChart';
import { format } from 'date-fns';

const PaymentsDashboard: React.FC = () => {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(new Date().setMonth(new Date().getMonth() - 3)), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await PaymentsService.getSummary();
      setSummary(data.summary);
      setMonthlyTrends(data.charts.monthlyTrends);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting data...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading payment data...</p>
        </div>
      </div>
    );
  }

  const totalILS = summary?.totalsByCurrency.find(c => c.currency === 'ILS')?.total_amount || 0;
  const totalUSD = summary?.totalsByCurrency.find(c => c.currency === 'USD')?.total_amount || 0;
  const totalClients = summary?.totalsByCurrency.reduce((acc, curr) => acc + curr.unique_clients, 0) || 0;
  const totalTransactions = summary?.totalsByCurrency.reduce((acc, curr) => acc + curr.transaction_count, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payments Dashboard</h1>
          <p className="text-muted-foreground">Track and analyze Spectra/Booksy payments</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (ILS)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{PaymentsService.formatCurrency(totalILS, 'ILS')}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.totalsByCurrency.find(c => c.currency === 'ILS')?.transaction_count || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (USD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{PaymentsService.formatCurrency(totalUSD, 'USD')}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.totalsByCurrency.find(c => c.currency === 'USD')?.transaction_count || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">Active paying clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.countrySummary.length || 0}</div>
            <p className="text-xs text-muted-foreground">Global presence</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="clients">Top Clients</TabsTrigger>
          <TabsTrigger value="countries">Countries</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Monthly Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trends</CardTitle>
              <CardDescription>Revenue breakdown by currency over time</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentsChart data={monthlyTrends} />
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Latest 5 transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary?.recentPayments.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                    <div>
                      <p className="font-medium">{payment.client}</p>
                      <p className="text-sm text-muted-foreground">
                        {PaymentsService.formatDate(payment.payment_date)} • {payment.country}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {PaymentsService.formatCurrency(payment.amount, payment.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <PaymentsTable filters={filters} />
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Paying Clients</CardTitle>
              <CardDescription>Clients with highest total payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary?.topClients.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{client.client}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{client.payment_count} payments</span>
                        <span>Avg: {PaymentsService.formatCurrency(client.avg_amount, client.currency)}</span>
                        <span>Last: {PaymentsService.formatDate(client.last_payment)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {PaymentsService.formatCurrency(client.total_amount, client.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="countries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Country</CardTitle>
              <CardDescription>Geographic distribution of payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary?.countrySummary.map((country, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{country.country}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{country.unique_clients} clients</span>
                        <span>{country.transaction_count} transactions</span>
                        <span>Currency: {country.currency}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {PaymentsService.formatCurrency(country.total_amount, country.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentsDashboard;
