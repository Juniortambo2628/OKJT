import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AdminPageHeaderProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ 
    title, 
    description, 
    actionLabel, 
    onAction 
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>
            {actionLabel && onAction && (
                <div className="flex items-center gap-3">
                    <Button 
                        className="gap-2 bg-primary hover:bg-primary/90 text-[#14110b] font-bold" 
                        onClick={onAction}
                    >
                        <Plus size={18} /> {actionLabel}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AdminPageHeader;
