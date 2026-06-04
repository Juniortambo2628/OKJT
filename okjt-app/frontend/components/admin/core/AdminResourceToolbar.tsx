import React from 'react';
import { Search, LayoutGrid, List, Trash2, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface AdminResourceToolbarProps {
    // Search
    searchTerm: string;
    onSearchChange: (value: string) => void;
    placeholder?: string;
    
    // Status Filter
    activeFilter?: 'all' | 'active' | 'inactive';
    onFilterChange?: (filter: 'all' | 'active' | 'inactive') => void;
    activeLabel?: string;
    inactiveLabel?: string;
    hideStatusFilter?: boolean;
    
    // Sorting
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (sortBy: string) => void;
    onOrderChange: (order: 'asc' | 'desc') => void;
    sortOptions?: { label: string, value: string }[];
    
    // View Customization
    viewMode?: 'grid' | 'list';
    onViewModeChange?: (mode: 'grid' | 'list') => void;
    
    // Bulk Actions
    selectedCount?: number;
    onBulkDelete?: () => void;
}

const AdminResourceToolbar: React.FC<AdminResourceToolbarProps> = ({
    searchTerm,
    onSearchChange,
    placeholder = "Search resources...",
    
    activeFilter = 'all',
    onFilterChange = () => {},
    activeLabel = "Active",
    inactiveLabel = "Inactive",
    hideStatusFilter = false,
    
    sortBy,
    sortOrder,
    onSortChange,
    onOrderChange,
    sortOptions = [
        { label: 'Date Created', value: 'created_at' },
        { label: 'Alphabetical', value: 'title' }
    ],
    
    viewMode,
    onViewModeChange,
    
    selectedCount = 0,
    onBulkDelete
}) => {
    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-secondary/10 p-4 border border-border/50 rounded-lg">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input 
                        placeholder={placeholder}
                        className="pl-10 bg-background/50 border-border/50 h-10"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    {/* Filter & Sort Group */}
                    <div className="flex bg-secondary/30 p-1 rounded-lg border border-border/40">
                        {!hideStatusFilter && (
                            <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 gap-2 px-3 text-xs font-bold text-muted-foreground hover:text-foreground">
                                            <Filter size={14} />
                                            Filter: {activeFilter === 'all' ? 'All' : activeFilter === 'active' ? activeLabel : inactiveLabel}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onFilterChange('all')}>All Statuses</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onFilterChange('active')}>{activeLabel} Only</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onFilterChange('inactive')}>{inactiveLabel} Only</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                
                                <div className="w-px bg-border/40 h-4 my-auto mx-1" />
                            </>
                        )}
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 gap-2 px-3 text-xs font-bold text-muted-foreground hover:text-foreground">
                                    <ArrowUpDown size={14} />
                                    Sort: {sortOptions.find(o => o.value === sortBy)?.label || 'Default'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {sortOptions.map(option => (
                                    <DropdownMenuItem key={option.value} onClick={() => onSortChange(option.value)}>
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onOrderChange('asc')} className={sortOrder === 'asc' ? 'bg-primary/10 text-primary' : ''}>
                                    Ascending
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onOrderChange('desc')} className={sortOrder === 'desc' ? 'bg-primary/10 text-primary' : ''}>
                                    Descending
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* View Switcher */}
                    {onViewModeChange && viewMode && (
                        <div className="flex bg-secondary/30 p-1 rounded-lg border border-border/40">
                            <Button 
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => onViewModeChange('grid')}
                            >
                                <LayoutGrid size={15} />
                            </Button>
                            <Button 
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => onViewModeChange('list')}
                            >
                                <List size={15} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bulk Selection Banner */}
            {selectedCount > 0 && onBulkDelete && (
                <div className="flex items-center justify-between bg-primary/10 px-6 py-2 rounded-lg border border-primary/20 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-sm font-bold text-primary tracking-wide">
                            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                        </span>
                    </div>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={onBulkDelete}
                        className="h-8 gap-2 text-xs font-bold uppercase tracking-wider"
                    >
                        <Trash2 size={14} /> Delete Selection
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AdminResourceToolbar;
