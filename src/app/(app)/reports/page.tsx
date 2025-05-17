'use client';
import Link from 'next/link';
import { PlusCircle, Filter, Download, FilePenLine, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { useState } from 'react';

// Mock data for reports
const mockReports = [
  { id: 'RPT001', date: new Date(2024, 5, 10), technician: 'Alice Smith', type: 'Near Miss', status: 'Open' },
  { id: 'RPT002', date: new Date(2024, 5, 12), technician: 'Bob Johnson', type: 'Safety Observation', status: 'Closed' },
  { id: 'RPT003', date: new Date(2024, 5, 15), technician: 'Alice Smith', type: 'First Aid', status: 'In Progress' },
  { id: 'RPT004', date: new Date(2024, 5, 18), technician: 'Charlie Brown', type: 'Property Damage', status: 'Open' },
  { id: 'RPT005', date: new Date(2024, 5, 20), technician: 'Bob Johnson', type: 'Environmental', status: 'Closed' },
];

type ReportStatus = 'Open' | 'In Progress' | 'Closed';

const statusColors: Record<ReportStatus, string> = {
  Open: 'bg-red-500/20 text-red-700 border-red-500/30',
  'In Progress': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  Closed: 'bg-green-500/20 text-green-700 border-green-500/30',
};


export default function ReportsListPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <>
      <PageHeader
        title="Incident Reports" // i18n: reportsList.title
        description="View, manage, and export incident reports." // i18n: reportsList.description
        actions={
          <Link href="/reports/new" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {/* i18n: reportsList.newReportButton */}
              New Report
            </Button>
          </Link>
        }
      />

      {/* Filters Section */}
      <div className="mb-6 p-4 border rounded-lg bg-card shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label htmlFor="date-range" className="text-sm font-medium text-muted-foreground">{/* i18n: reportsList.filterDateRange */}Date Range</label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button id="date-range" variant="outline" className="w-full justify-start text-left font-normal">
                        <Filter className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                        ) : (
                            <span>{/* i18n: reportsList.filterPickDate */}Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <label htmlFor="technician" className="text-sm font-medium text-muted-foreground">{/* i18n: reportsList.filterTechnician */}Technician</label>
            <Select>
              <SelectTrigger id="technician">
                <SelectValue placeholder="All Technicians" /> {/* i18n: reportsList.filterAllTechnicians */}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technicians</SelectItem>
                <SelectItem value="alice">Alice Smith</SelectItem>
                <SelectItem value="bob">Bob Johnson</SelectItem>
                <SelectItem value="charlie">Charlie Brown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label htmlFor="status" className="text-sm font-medium text-muted-foreground">{/* i18n: reportsList.filterStatus */}Status</label>
            <Select>
              <SelectTrigger id="status">
                <SelectValue placeholder="All Statuses" /> {/* i18n: reportsList.filterAllStatuses */}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {/* i18n: reportsList.exportButton */}
            Export All (CSV)
          </Button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-lg border shadow-sm overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">{/* i18n: reportsList.tableHeadID */}Report ID</TableHead>
              <TableHead>{/* i18n: reportsList.tableHeadDate */}Date</TableHead>
              <TableHead>{/* i18n: reportsList.tableHeadTechnician */}Technician</TableHead>
              <TableHead>{/* i18n: reportsList.tableHeadType */}Type</TableHead>
              <TableHead>{/* i18n: reportsList.tableHeadStatus */}Status</TableHead>
              <TableHead className="text-right">{/* i18n: reportsList.tableHeadActions */}Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockReports.map((report) => (
              <TableRow key={report.id} className="hover:bg-muted/50 cursor-pointer">
                <TableCell className="font-medium">{report.id}</TableCell>
                <TableCell>{format(report.date, 'PP')}</TableCell>
                <TableCell>{report.technician}</TableCell>
                <TableCell>{report.type}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${statusColors[report.status as ReportStatus]}`}>
                    {report.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Filter className="h-4 w-4 transform rotate-90" /> {/* Placeholder for MoreVertical */}
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/reports/${report.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View</span> {/* i18n: reportsList.actionView */}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                         <Link href={`/reports/${report.id}`}> {/* Should be edit link if separate */}
                          <FilePenLine className="mr-2 h-4 w-4" />
                          <span>Edit</span> {/* i18n: reportsList.actionEdit */}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Export PDF</span> {/* i18n: reportsList.actionExportPDF */}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       {/* Pagination Placeholder */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm" disabled>
            {/* i18n: reportsList.paginationPrevious */}
            Previous
          </Button>
          <Button variant="outline" size="sm">
            {/* i18n: reportsList.paginationNext */}
            Next
          </Button>
        </div>
    </>
  );
}
