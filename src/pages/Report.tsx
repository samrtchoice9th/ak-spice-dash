import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useReceipts } from '@/contexts/ReceiptsContext';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type DateFilter = 'today' | 'week' | 'all';

interface DayReport {
  date: string;
  totalSales: number;
  totalPurchases: number;
  profit: number;
}

const Report = () => {
  const { receipts, loading } = useReceipts();
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const filteredReports = useMemo(() => {
    if (!receipts.length) return [];

    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    switch (dateFilter) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        break;
      default:
        startDate = new Date(0); // Include all dates
        endDate = new Date(2099, 11, 31); // Far future date
    }

    // Group receipts by date
    const groupedByDate = receipts.reduce((acc, receipt) => {
      const receiptDate = parseISO(receipt.date);
      if (receiptDate >= startDate && receiptDate <= endDate) {
        const dateKey = format(receiptDate, 'yyyy-MM-dd');
        
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            totalSales: 0,
            totalPurchases: 0,
            profit: 0,
          };
        }

        if (receipt.type === 'sales') {
          acc[dateKey].totalSales += receipt.totalAmount;
          acc[dateKey].profit += receipt.totalAmount;
        } else if (receipt.type === 'purchase') {
          acc[dateKey].totalPurchases += receipt.totalAmount;
          acc[dateKey].profit -= receipt.totalAmount;
        }
      }
      return acc;
    }, {} as Record<string, DayReport>);

    // Convert to array and sort by date (newest first)
    return Object.values(groupedByDate).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [receipts, dateFilter]);

  const totals = useMemo(() => {
    return filteredReports.reduce(
      (acc, report) => ({
        totalSales: acc.totalSales + report.totalSales,
        totalPurchases: acc.totalPurchases + report.totalPurchases,
        totalProfit: acc.totalProfit + report.profit,
      }),
      { totalSales: 0, totalPurchases: 0, totalProfit: 0 }
    );
  }, [filteredReports]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Sales & Purchase Report</h1>
        
        <div className="flex items-center gap-4">
          <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
            <SelectTrigger className="w-[180px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rs {totals.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Rs {totals.totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              totals.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              Rs {totals.totalProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Report</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions found for the selected period.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Purchases</TableHead>
                  <TableHead className="text-right">Profit/Loss</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.date}>
                    <TableCell className="font-medium">
                      {format(parseISO(report.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      Rs {report.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      Rs {report.totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      report.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {report.profit >= 0 ? '+' : ''}Rs {Math.abs(report.profit).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

export default Report;