import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Book, Patron, Transaction } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, FileText, PieChart as PieChartIcon, BarChart as BarChartIcon, FileDown } from "lucide-react";

export default function Reports() {
  const [reportType, setReportType] = useState("circulation");
  const [dateRange, setDateRange] = useState("30days");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Fetch data
  const { data: books, isLoading: isLoadingBooks } = useQuery<Book[]>({
    queryKey: ['/api/books'],
  });
  
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });
  
  const { data: categoryStats, isLoading: isLoadingCategoryStats } = useQuery({
    queryKey: ['/api/dashboard/category-stats'],
  });
  
  const isLoading = isLoadingBooks || isLoadingTransactions || isLoadingCategoryStats;
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Generate the start date based on date range selection
  const getStartDateFromRange = (): Date => {
    const now = new Date();
    switch (dateRange) {
      case "7days":
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        return sevenDaysAgo;
      case "30days":
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return thirtyDaysAgo;
      case "90days":
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(now.getDate() - 90);
        return ninetyDaysAgo;
      case "1year":
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        return oneYearAgo;
      case "custom":
        return startDate || new Date();
      default:
        return new Date(now.setDate(now.getDate() - 30));
    }
  };
  
  // Filter transactions by date range
  const getFilteredTransactions = () => {
    if (!transactions) return [];
    
    const start = getStartDateFromRange();
    const end = dateRange === "custom" && endDate ? endDate : new Date();
    
    return transactions.filter(transaction => {
      const transactionDate = transaction.timestamp ? new Date(transaction.timestamp) : null;
      if (!transactionDate) return false;
      
      return transactionDate >= start && transactionDate <= end;
    });
  };
  
  // Generate data for circulation report
  const getCirculationData = () => {
    const filteredTransactions = getFilteredTransactions();
    
    const checkouts = filteredTransactions.filter(t => t.transactionType === "Checkout").length;
    const returns = filteredTransactions.filter(t => t.transactionType === "Return").length;
    const overdue = filteredTransactions.filter(t => t.transactionType === "Overdue").length;
    
    return [
      { name: "Checkouts", value: checkouts },
      { name: "Returns", value: returns },
      { name: "Overdue", value: overdue }
    ];
  };
  
  // Generate data for category distribution
  const getCategoryData = () => {
    if (!categoryStats) return [];
    return categoryStats;
  };
  
  // Colors for pie chart
  const COLORS = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#9c27b0', '#795548'];
  
  // Generate the report title and description
  const getReportInfo = () => {
    const start = getStartDateFromRange();
    const end = dateRange === "custom" && endDate ? endDate : new Date();
    
    let title = "";
    let description = "";
    
    switch (reportType) {
      case "circulation":
        title = "Circulation Report";
        description = "Book checkouts, returns, and overdue items";
        break;
      case "categories":
        title = "Book Categories Report";
        description = "Distribution of books by category";
        break;
      default:
        title = "Report";
        description = "Library statistics";
    }
    
    description += ` (${formatDate(start)} - ${formatDate(end)})`;
    
    return { title, description };
  };
  
  const { title, description } = getReportInfo();
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-gray-500">Generate and analyze library statistics</p>
        </div>
        <Button className="mt-4 md:mt-0" variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Report Settings</CardTitle>
          <CardDescription>Configure the report parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="circulation">Circulation Report</SelectItem>
                  <SelectItem value="categories">Book Categories Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {dateRange === "custom" && (
              <div className="md:col-span-1 flex flex-col space-y-1">
                <label className="text-sm font-medium mb-1 block">Date Range</label>
                <div className="flex space-x-2">
                  <DatePicker
                    selected={startDate}
                    onSelect={setStartDate}
                    placeholder="Start date"
                  />
                  <DatePicker
                    selected={endDate}
                    onSelect={setEndDate}
                    placeholder="End date"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="chart" className="flex items-center">
                {reportType === "circulation" ? (
                  <PieChartIcon className="mr-2 h-4 w-4" />
                ) : (
                  <BarChartIcon className="mr-2 h-4 w-4" />
                )}
                Chart View
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Table View
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart">
              <div className="h-[400px] w-full">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                ) : (
                  reportType === "circulation" ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getCirculationData()}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getCirculationData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} items`, '']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getCategoryData()}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} books`, 'Count']} />
                        <Legend />
                        <Bar dataKey="count" name="Books" fill="#1976d2" />
                      </BarChart>
                    </ResponsiveContainer>
                  )
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="table">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-200 px-4 py-2 text-left bg-gray-50">{reportType === "circulation" ? "Transaction Type" : "Category"}</th>
                      <th className="border border-gray-200 px-4 py-2 text-left bg-gray-50">Count</th>
                      <th className="border border-gray-200 px-4 py-2 text-left bg-gray-50">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i}>
                          <td className="border border-gray-200 px-4 py-2"><Skeleton className="h-4 w-24" /></td>
                          <td className="border border-gray-200 px-4 py-2"><Skeleton className="h-4 w-12" /></td>
                          <td className="border border-gray-200 px-4 py-2"><Skeleton className="h-4 w-16" /></td>
                        </tr>
                      ))
                    ) : (
                      reportType === "circulation" ? (
                        getCirculationData().map((item, index) => {
                          const total = getCirculationData().reduce((acc, curr) => acc + curr.value, 0);
                          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
                          return (
                            <tr key={index}>
                              <td className="border border-gray-200 px-4 py-2">{item.name}</td>
                              <td className="border border-gray-200 px-4 py-2">{item.value}</td>
                              <td className="border border-gray-200 px-4 py-2">{percentage}%</td>
                            </tr>
                          );
                        })
                      ) : (
                        getCategoryData().map((item, index) => {
                          const total = getCategoryData().reduce((acc, curr) => acc + curr.count, 0);
                          const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0.0";
                          return (
                            <tr key={index}>
                              <td className="border border-gray-200 px-4 py-2">{item.category}</td>
                              <td className="border border-gray-200 px-4 py-2">{item.count}</td>
                              <td className="border border-gray-200 px-4 py-2">{percentage}%</td>
                            </tr>
                          );
                        })
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
