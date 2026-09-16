import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { receiptService } from '@/services/receiptService';
import {
  format, startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, subMonths, parseISO, eachDayOfInterval,
} from 'date-fns';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

type DateFilter = 'today' | 'week' | 'month' | 'lastMonth' | 'custom';

interface DayReport {
  date: string;
  totalSales: number;
  totalPurchases: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const Report = () => {
  const now = useMemo(() => new Date(), []);
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [dailyTotals, setDailyTotals] = useState<Record<string, { totalSales: number; totalPurchases: number }>>({});
  const [loading, setLoading] = useState(true);

  const yearOptions = useMemo(() => {
    const currentYear = now.getFullYear();
    const years: number[] = [];
    for (let y = 2024; y <= currentYear; y++) years.push(y);
    return years.reverse();
  }, [now]);

  // Load complete daily totals for the selected month (paged, nothing truncated)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const totals = await receiptService.getMonthlyDailyTotals(selectedYear, selectedMonth);
        if (!cancelled) setDailyTotals(totals);
      } catch (error) {
        console.error('Failed to load report totals:', error);
        if (!cancelled) setDailyTotals({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedYear, selectedMonth]);

  const handleQuickFilterChange = (value: DateFilter) => {
    setDateFilter(value);
    if (value === 'lastMonth') {
      const last = subMonths(now, 1);
      setSelectedYear(last.getFullYear());
      setSelectedMonth(last.getMonth());
    } else if (value !== 'custom') {
      setSelectedYear(now.getFullYear());
      setSelectedMonth(now.getMonth());
    }
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(Number(value));
    setDateFilter('custom');
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(Number(value));
    setDateFilter('custom');
  };

  const { startDate, endDate, periodLabel } = useMemo(() => {
    const monthDate = new Date(selectedYear, selectedMonth, 1);
    switch (dateFilter) {
      case 'today':
        return { startDate: startOfDay(now), endDate: endOfDay(now), periodLabel: `Today — ${format(now, 'MMM dd, yyyy')}` };
      case 'week':
        return { startDate: startOfWeek(now), endDate: endOfWeek(now), periodLabel: `This Week — ${format(startOfWeek(now), 'MMM dd')} – ${format(endOfWeek(now), 'MMM dd, yyyy')}` };
      case 'month':
        return { startDate: startOfMonth(now), endDate: endOfMonth(now), periodLabel: `This Month — ${format(now, 'MMM yyyy')}` };
      case 'lastMonth': {
        const last = subMonths(now, 1);
        return { startDate: startOfMonth(last), endDate: endOfMonth(last), periodLabel: `Last Month — ${format(last, 'MMM yyyy')}` };
      }
      default:
        return {
          startDate: startOfMonth(monthDate),
          endDate: endOfMonth(monthDate),
          periodLabel: `${MONTH_NAMES[selectedMonth]} ${selectedYear}`,
        };
    }
  }, [dateFilter, selectedYear, selectedMonth, now]);

  const filteredReports = useMemo<DayReport[]>(() => {
    return eachDayOfInterval({ start: startDate, end: endDate })
      .map(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const found = dailyTotals[dateKey];
        return { date: dateKey, totalSales: found?.totalSales || 0, totalPurchases: found?.totalPurchases || 0 };
      })
      .reverse(); // newest first
  }, [dailyTotals, startDate, endDate]);

  const totals = useMemo(() => {
    return filteredReports.reduce(
      (acc, report) => ({
        totalSales: acc.totalSales + report.totalSales,
        totalPurchases: acc.totalPurchases + report.totalPurchases,
      }),
      { totalSales: 0, totalPurchases: 0 }
    );
  }, [filteredReports]);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-foreground">Sales & Purchase Report</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{periodLabel}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={dateFilter} onValueChange={(value) => handleQuickFilterChange(value as DateFilter)}>
            <SelectTrigger className="w-full sm:w-[160px] h-10">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              {dateFilter === 'custom' && <SelectItem value="custom">Custom Month</SelectItem>}
            </SelectContent>
          </Select>

          <Select value={String(selectedYear)} onValueChange={handleYearChange}>
            <SelectTrigger className="w-full sm:w-[110px] h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map(year => (
                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(selectedMonth)} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-full sm:w-[140px] h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.map((name, idx) => (
                <SelectItem key={name} value={String(idx)}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading reports...</div>
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
