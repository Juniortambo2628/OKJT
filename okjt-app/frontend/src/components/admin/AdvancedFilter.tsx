import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Filter, X } from 'lucide-react';

interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  options?: Array<{ value: string; label: string }>;
}

interface AdvancedFilterProps {
  fields: FilterField[];
  onFilter: (filters: Record<string, any>) => void;
  onReset?: () => void;
}

export default function AdvancedFilter({ fields, onFilter, onReset }: AdvancedFilterProps) {
  const schema = z.object(
    fields.reduce((acc, field) => {
      if (field.type === 'text') {
        acc[field.name] = z.string().optional();
      } else if (field.type === 'select') {
        acc[field.name] = z.string().optional();
      } else if (field.type === 'date') {
        acc[field.name] = z.string().optional();
      } else if (field.type === 'dateRange') {
        acc[`${field.name}_from`] = z.string().optional();
        acc[`${field.name}_to`] = z.string().optional();
      }
      return acc;
    }, {} as Record<string, z.ZodTypeAny>)
  );

  const { register, handleSubmit, reset, watch } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: Record<string, any>) => {
    onFilter(data);
  };

  const handleReset = () => {
    reset();
    if (onReset) {
      onReset();
    } else {
      onFilter({});
    }
  };

  const hasActiveFilters = Object.values(watch()).some(value => value && value !== '');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="admin-advanced-filter">
      <div className="admin-filter-header">
        <div className="admin-filter-title">
          <Filter size={18} />
          <span>Advanced Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="admin-filter-reset"
          >
            <X size={16} />
            Reset
          </button>
        )}
      </div>

      <div className="admin-filter-fields">
        {fields.map((field) => {
          if (field.type === 'text') {
            return (
              <div key={field.name} className="admin-filter-field">
                <label>{field.label}</label>
                <div className="admin-search-wrapper">
                  <Search size={16} className="admin-search-icon" />
                  <input
                    type="text"
                    {...register(field.name)}
                    placeholder={`Search ${field.label.toLowerCase()}...`}
                    className="admin-search-input"
                  />
                </div>
              </div>
            );
          }

          if (field.type === 'select') {
            return (
              <div key={field.name} className="admin-filter-field">
                <label>{field.label}</label>
                <select {...register(field.name)} className="admin-select">
                  <option value="">All</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (field.type === 'date') {
            return (
              <div key={field.name} className="admin-filter-field">
                <label>{field.label}</label>
                <input
                  type="date"
                  {...register(field.name)}
                  className="admin-input"
                />
              </div>
            );
          }

          if (field.type === 'dateRange') {
            return (
              <div key={field.name} className="admin-filter-field admin-filter-date-range">
                <label>{field.label}</label>
                <div className="admin-date-range">
                  <input
                    type="date"
                    {...register(`${field.name}_from`)}
                    placeholder="From"
                    className="admin-input"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    {...register(`${field.name}_to`)}
                    placeholder="To"
                    className="admin-input"
                  />
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      <div className="admin-filter-actions">
        <button type="submit" className="admin-btn-primary">
          <Search size={16} />
          Apply Filters
        </button>
      </div>
    </form>
  );
}

