import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { useReceipts } from '@/contexts/ReceiptsContext';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

type DateFilter = 'today' | 'week' | 'all';

interface DayReport {
  date: string;
  totalSales: number;
  totalPurchases: number;
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
      case 'today': startDate = startOfDay(now); break;
      case 'week': startDate = startOfWeek(now); endDate = endOfWeek(now); break;
      default: startDate = new Date(0); endDate = new Date(2099, 11, 31);
    }

    const groupedByDate = receipts.reduce((acc, receipt) => {
      const receiptDate = parseISO(receipt.date);
      if (receiptDate >= startDate && receiptDate <= endDate) {
        const dateKey = format(receiptDate, 'yyyy-MM-dd');
        if (!acc[dateKey]) acc[dateKey] = { date: dateKey, totalSales: 0, totalPurchases: 0 };
        if (receipt.type === 'sales') acc[dateKey].totalSales += receipt.totalAmount;
        else if (receipt.type === 'purchase') acc[dateKey].totalPurchases += receipt.totalAmount;
      }
      return acc;
    }, {} as Record<string, DayReport>);

    return Object.values(groupedByDate).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [receipts, dateFilter]);

  const totals = useMemo(() => {
    return filteredReports.reduce(
      (acc, report) => ({
        totalSales: acc.totalSales + report.totalSales,
        totalPurchases: acc.totalPurchases + report.totalPurchases,
      }),
      { totalSales: 0, totalPurchases: 0 }
    );
  }, [filteredReports]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center text-muted-foreground">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-lg sm:text-2xl font-bold text-foreground">Sales & Purchase Report</h1>
        <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
          <SelectTrigger className="w-full sm:w-[180px] h-10">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-base sm:text-2xl font-bold text-green-600">
              Rs {totals.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Purchases</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-base sm:text-2xl font-bold text-red-600">
              Rs {totals.totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-sm sm:text-base">Daily Report</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No transactions found for the selected period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Date</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Sales</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Purchases</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.date}>
                      <TableCell className="font-medium text-xs sm:text-sm py-2 sm:py-4">
                        {format(parseISO(report.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-right text-green-600 text-xs sm:text-sm py-2 sm:py-4">
                        Rs {report.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right text-red-600 text-xs sm:text-sm py-2 sm:py-4">
                        Rs {report.totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Report;
