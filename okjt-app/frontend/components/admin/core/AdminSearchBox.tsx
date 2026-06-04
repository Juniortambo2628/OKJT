import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AdminSearchBoxProps {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

const AdminSearchBox: React.FC<AdminSearchBoxProps> = ({ 
    placeholder = "Search...", 
    value, 
    onChange,
    className 
}) => {
    return (
        <div className={`flex flex-col md:flex-row gap-4 items-center justify-between bg-secondary/10 p-4 border border-border/50 ${className}`}>
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                    placeholder={placeholder}
                    className="pl-10 bg-background/50"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
};

export default AdminSearchBox;
