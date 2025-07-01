
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, Search, Calendar as CalendarIcon, X, Tag } from "lucide-react";
import { useTask } from "@/contexts/TaskContext";
import { format } from "date-fns";

interface FilterOptions {
  search: string;
  priority: string[];
  status: string[];
  categories: string[];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  tags: string[];
  dueSoon: boolean;
  overdue: boolean;
}

interface AdvancedTaskFiltersProps {
  onFiltersChange: (filteredTasks: any[]) => void;
}

const AdvancedTaskFilters: React.FC<AdvancedTaskFiltersProps> = ({ onFiltersChange }) => {
  const { tasks, categories } = useTask();
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    priority: [],
    status: [],
    categories: [],
    dateRange: { from: null, to: null },
    tags: [],
    dueSoon: false,
    overdue: false
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const applyFilters = () => {
    let filteredTasks = [...tasks];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Priority filter
    if (filters.priority.length > 0) {
      filteredTasks = filteredTasks.filter(task =>
        filters.priority.includes(task.priority)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filteredTasks = filteredTasks.filter(task =>
        filters.status.includes(task.status)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filteredTasks = filteredTasks.filter(task =>
        task.categoryId && filters.categories.includes(task.categoryId)
      );
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        
        if (filters.dateRange.from && taskDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && taskDate > filters.dateRange.to) return false;
        
        return true;
      });
    }

    // Due soon filter (next 7 days)
    if (filters.dueSoon) {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= new Date() && taskDate <= sevenDaysFromNow;
      });
    }

    // Overdue filter
    if (filters.overdue) {
      const now = new Date();
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate || task.status === 'completed') return false;
        return new Date(task.dueDate) < now;
      });
    }

    onFiltersChange(filteredTasks);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      priority: [],
      status: [],
      categories: [],
      dateRange: { from: null, to: null },
      tags: [],
      dueSoon: false,
      overdue: false
    });
    onFiltersChange(tasks);
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'priority' | 'status' | 'categories' | 'tags', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  React.useEffect(() => {
    applyFilters();
  }, [filters, tasks]);

  const activeFiltersCount = [
    filters.search ? 1 : 0,
    filters.priority.length,
    filters.status.length,
    filters.categories.length,
    filters.dateRange.from || filters.dateRange.to ? 1 : 0,
    filters.dueSoon ? 1 : 0,
    filters.overdue ? 1 : 0
  ].reduce((sum, count) => sum + count, 0);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          <div className="flex gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Always visible search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {isExpanded && (
          <>
            {/* Priority filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <div className="flex gap-2 flex-wrap">
                {['low', 'medium', 'high'].map(priority => (
                  <div key={priority} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority}`}
                      checked={filters.priority.includes(priority)}
                      onCheckedChange={() => toggleArrayFilter('priority', priority)}
                    />
                    <label htmlFor={`priority-${priority}`} className="text-sm capitalize">
                      {priority}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <div className="flex gap-2 flex-wrap">
                {['todo', 'in-progress', 'completed'].map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.status.includes(status)}
                      onCheckedChange={() => toggleArrayFilter('status', status)}
                    />
                    <label htmlFor={`status-${status}`} className="text-sm">
                      {status === 'in-progress' ? 'In Progress' : 
                       status.charAt(0).toUpperCase() + status.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Category filters */}
            {categories.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Categories</label>
                <div className="flex gap-2 flex-wrap">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={filters.categories.includes(category.id)}
                        onCheckedChange={() => toggleArrayFilter('categories', category.id)}
                      />
                      <label htmlFor={`category-${category.id}`} className="text-sm">
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Date range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Due Date Range</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {filters.dateRange.from ? format(filters.dateRange.from, "MMM dd") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from || undefined}
                      onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, from: date || null })}
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {filters.dateRange.to ? format(filters.dateRange.to, "MMM dd") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to || undefined}
                      onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, to: date || null })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Quick filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Quick Filters</label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="due-soon"
                    checked={filters.dueSoon}
                    onCheckedChange={(checked) => updateFilter('dueSoon', !!checked)}
                  />
                  <label htmlFor="due-soon" className="text-sm">Due Soon (7 days)</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="overdue"
                    checked={filters.overdue}
                    onCheckedChange={(checked) => updateFilter('overdue', !!checked)}
                  />
                  <label htmlFor="overdue" className="text-sm">Overdue</label>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedTaskFilters;
