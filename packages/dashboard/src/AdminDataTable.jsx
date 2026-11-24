import { useEffect, useRef, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, ArrowUpDown, Eye } from 'lucide-react';
import { Modal } from '@okjt/ui';
import EmptyState from './EmptyState.js';

/**
 * AdminDataTable: a list that is a table on wide screens and one card per row
 * below `lg`, with search, sorting, paging (client or server), selection,
 * per-row actions and a "View details" dialog. Lifted from Tena-host's
 * DataTable; its own entry, `@okjt/dashboard/table`, because it needs
 * `@tanstack/react-table` (install it to use this).
 *
 *   import AdminDataTable from '@okjt/dashboard/table';
 *   <AdminDataTable data={guests} columns={columns} detailTitle="Guest"
 *     rowActions={[{ key: 'delete', label: 'Delete', icon: <Trash2 size={14} />, variant: 'danger', onClick: remove }]} />
 *
 * Columns are TanStack column definitions. On the cards the first column heads
 * the card and the rest are label/value rows; a column's label is
 * `meta.label`, else its header when that is text, else its id. A column with
 * `meta.detailOnly` shows only in the details dialog.
 *
 * @param {Array}    data
 * @param {Array}    columns
 * @param {string}   [title]
 * @param {string}   [searchPlaceholder='Search...']
 * @param {object}   [serverPagination]  Laravel's paginator ({ current_page, last_page, from, to, total, prev_page_url, next_page_url }); paging is then the server's
 * @param {(page: number) => void} [onPageChange]  With serverPagination: go to that page (e.g. an Inertia visit)
 * @param {(query: string) => void} [onSearch]  Search on the server (with serverPagination, called on each change; otherwise 300 ms after typing stops)
 * @param {string}   [searchValue]       The server search's current value
 * @param {boolean}  [enableSelection]
 * @param {Array}    [selectedIds]       Controls the selection; onSelectionChange then gets ids
 * @param {(selection) => void} [onSelectionChange]  Rows, or ids when selectedIds is given
 * @param {(row) => any} [getRowId=(row) => row.id]
 * @param {string}   [emptyMessage='No results found']
 * @param {*}        [emptyIcon]
 * @param {object}   [emptyAction]       EmptyState's action
 * @param {Array<{ key, label, icon, variant?: 'success'|'warning'|'danger', onClick(row) }>} [rowActions]
 * @param {string}   [detailTitle]       Turns on "View details" for each row, under this title
 * @param {(text: string) => string} [translate]  Applied to the title, labels and action names (e.g. a project's own wording)
 */
const columnLabel = (column) => column.columnDef.meta?.label
  ?? (typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id);

const ACTION_VARIANTS = {
  success: 'hover:bg-positive/10 hover:text-positive-dark',
  warning: 'hover:bg-amber-500/10 hover:text-amber-700',
  danger: 'hover:bg-red-500/10 hover:text-red-600',
};

const DETAIL_ACTION_VARIANTS = {
  default: 'bg-contrast/5 text-ink hover:bg-contrast/10',
  success: 'bg-positive/10 text-positive-dark hover:bg-positive/20',
  warning: 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20',
  danger: 'bg-red-500/10 text-red-600 hover:bg-red-500/20',
};

const identity = (text) => text;
const cx = (...parts) => parts.filter(Boolean).join(' ');

const checkboxClass = 'h-4 w-4 cursor-pointer rounded border-contrast/20 text-accent focus:ring-accent/20 focus:ring-offset-0';
const pageButtonClass = 'rounded-lg p-2 hover:bg-contrast/5 disabled:cursor-not-allowed disabled:opacity-30';

export default function AdminDataTable({
  data,
  columns,
  title = null,
  searchPlaceholder = 'Search...',
  searchValue = '',
  serverPagination = null,
  onPageChange,
  onSearch = null,
  enableSelection = false,
  selectedIds = null,
  onSelectionChange = null,
  getRowId = (row) => row.id,
  emptyMessage = 'No results found',
  emptyIcon,
  emptyAction = null,
  rowActions = [],
  detailTitle = null,
  translate = identity,
}) {
  const t = translate;
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const isSelectionControlled = Array.isArray(selectedIds);
  const selectionState = isSelectionControlled
    ? Object.fromEntries(selectedIds.map((id) => [String(id), true]))
    : rowSelection;

  const handleRowSelectionChange = (updater) => {
    const next = typeof updater === 'function' ? updater(selectionState) : updater;
    if (!isSelectionControlled) {
      setRowSelection(next);
      return;
    }
    onSelectionChange?.(data.map(getRowId).filter((id) => next[String(id)]));
  };

  const selectionColumn = enableSelection ? [{
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        aria-label="Select all"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        className={checkboxClass}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        aria-label="Select row"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        className={checkboxClass}
      />
    ),
    size: 40,
    enableSorting: false,
    enableHiding: false,
  }] : [];

  const [detailRow, setDetailRow] = useState(null);
  const actionColumn = rowActions.length > 0 || detailTitle ? [{
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1 lg:justify-start">
        {detailTitle && (
          <button type="button" className="rounded-lg p-2 text-soft transition-colors hover:bg-contrast/5 hover:text-ink" title="View details" aria-label="View details" onClick={() => setDetailRow(row.original)}>
            <Eye size={14} />
          </button>
        )}
        {rowActions.map((action) => (
          <button
            key={action.key}
            type="button"
            className={cx('rounded-lg p-2 text-soft transition-colors', ACTION_VARIANTS[action.variant] ?? 'hover:bg-contrast/5 hover:text-ink')}
            title={t(action.label)}
            aria-label={t(action.label)}
            onClick={() => action.onClick(row.original)}
          >
            {action.icon}
          </button>
        ))}
      </div>
    ),
  }] : [];

  const allColumns = [...selectionColumn, ...columns, ...actionColumn];
  const columnVisibility = Object.fromEntries(columns.filter((c) => c.meta?.detailOnly).map((c) => [c.id ?? c.accessorKey, false]));

  const table = useReactTable({
    data,
    columns: allColumns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      ...(enableSelection ? { rowSelection: selectionState } : {}),
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    ...(enableSelection ? { onRowSelectionChange: handleRowSelectionChange } : {}),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: serverPagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: !!serverPagination,
    pageCount: serverPagination ? serverPagination.last_page : undefined,
    getRowId,
  });

  useEffect(() => {
    if (enableSelection && onSelectionChange && !isSelectionControlled) {
      onSelectionChange(table.getSelectedRowModel().rows.map((r) => r.original));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

  // Client-paged lists with onSearch: tell the page what was typed, 300 ms
  // after typing stops (clearing the box included), not on first render.
  const typed = useRef(false);
  useEffect(() => {
    if (!typed.current) { typed.current = true; return undefined; }
    if (!onSearch || serverPagination) return undefined;
    const timeout = setTimeout(() => onSearch(globalFilter), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFilter]);

  const goToPage = (page) => {
    if (serverPagination) onPageChange?.(page);
  };

  const rows = table.getRowModel().rows;
  const render = (cell) => flexRender(cell.column.columnDef.cell, cell.getContext());

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-contrast/5 p-4">
        {title && <h3 className="text-sm font-bold text-ink">{t(title)}</h3>}
        <label className="flex w-full items-center gap-2 rounded-xl bg-contrast/5 px-3 py-2 sm:w-64">
          <Search size={16} className="text-muted" aria-hidden="true" />
          {serverPagination && onSearch ? (
            <input
              type="search"
              defaultValue={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="w-full border-none bg-transparent p-0 text-sm font-bold placeholder:text-muted focus:ring-0"
            />
          ) : (
            <input
              type="search"
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="w-full border-none bg-transparent p-0 text-sm font-bold placeholder:text-muted focus:ring-0"
            />
          )}
        </label>
      </div>

      {rows.length === 0 && <EmptyState icon={emptyIcon} message={emptyMessage} action={emptyAction} />}

      {/* Table (from lg) */}
      {rows.length > 0 && (
        <div className="hidden overflow-x-auto lg:block" data-view="table">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-contrast/5 bg-contrast/[0.02]">
                  {headerGroup.headers.map((header) => {
                    const checkbox = header.id === 'select';
                    const sortable = !checkbox && header.column.getCanSort();
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={{ asc: 'ascending', desc: 'descending' }[header.column.getIsSorted()]}
                        className={cx('px-4 py-3 text-left text-xs font-semibold text-soft select-none', checkbox ? 'w-10 cursor-default text-center' : sortable && 'cursor-pointer transition-colors hover:bg-contrast/5')}
                        onClick={sortable ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <div className="group flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortable && ({
                            asc: <ArrowUpDown size={12} className="rotate-180" />,
                            desc: <ArrowUpDown size={12} />,
                          }[header.column.getIsSorted()] ?? <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-50" />)}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-contrast/5">
              {rows.map((row) => (
                <tr key={row.id} className={cx('transition-colors', row.getIsSelected() ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-contrast/[0.02]')}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={cx('px-4 py-3 text-sm font-medium text-body', cell.column.id === 'select' && 'w-10 text-center')}>
                      {render(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards (below lg): the first column heads the card, the rest are label/value rows */}
      {rows.length > 0 && (
        <ul className="space-y-3 px-4 lg:hidden" data-view="cards">
          {rows.map((row) => {
            const cells = row.getVisibleCells();
            const select = cells.find((c) => c.column.id === 'select');
            const actions = cells.find((c) => c.column.id === 'actions');
            const [primary, ...fields] = cells.filter((c) => c !== select && c !== actions);
            return (
              <li key={row.id} className={cx('rounded-2xl border p-4', row.getIsSelected() ? 'border-accent/30 bg-accent/5' : 'border-contrast/5 bg-surface')}>
                <div className="flex items-start gap-3">
                  {select && <div className="pt-1">{render(select)}</div>}
                  <div className="min-w-0 flex-1 text-sm font-semibold text-ink">{primary && render(primary)}</div>
                </div>
                {fields.map((cell) => (
                  <div key={cell.id} className="mt-2 flex items-center justify-between gap-4 border-t border-contrast/5 py-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted">{t(columnLabel(cell.column))}</span>
                    <div className="min-w-0 text-right text-sm font-semibold text-body [overflow-wrap:anywhere]">{render(cell)}</div>
                  </div>
                ))}
                {actions && <div className="mt-2 flex justify-end border-t border-contrast/5 pt-2">{render(actions)}</div>}
              </li>
            );
          })}
        </ul>
      )}

      {detailTitle && (
        <Modal open={!!detailRow} onClose={() => setDetailRow(null)} title={t(detailTitle)} maxWidth="lg">
          {detailRow && (() => {
            const row = table.getCoreRowModel().rows.find((r) => r.original === detailRow);
            const cells = row ? row.getAllCells().filter((c) => !['select', 'actions'].includes(c.column.id)) : [];
            return (
              <div>
                <dl className="divide-y divide-contrast/5">
                  {cells.map((cell) => (
                    <div key={cell.id} className="flex items-start justify-between gap-4 py-3">
                      <dt className="text-xs font-semibold uppercase tracking-widest text-muted">{t(columnLabel(cell.column))}</dt>
                      <dd className="min-w-0 text-right text-sm font-semibold text-body [overflow-wrap:anywhere]">{render(cell)}</dd>
                    </div>
                  ))}
                </dl>
                {rowActions.length > 0 && (
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    {rowActions.map((action) => (
                      <button
                        key={action.key}
                        type="button"
                        className={cx('inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors', DETAIL_ACTION_VARIANTS[action.variant] ?? DETAIL_ACTION_VARIANTS.default)}
                        onClick={() => { setDetailRow(null); action.onClick(detailRow); }}
                      >
                        {action.icon} {t(action.label)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </Modal>
      )}

      {rows.length > 0 && (
        <nav aria-label="Pages" className="flex flex-wrap items-center justify-between gap-2 border-t border-contrast/5 px-4 py-4">
          <div className="flex-1 text-xs font-bold text-soft">
            {serverPagination
              ? `Showing ${serverPagination.from}-${serverPagination.to} of ${serverPagination.total}`
              : `Page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount()}`}
          </div>
          <div className="flex items-center gap-2">
            {serverPagination ? (
              <>
                <button type="button" aria-label="First page" className={pageButtonClass} onClick={() => goToPage(1)} disabled={!serverPagination.prev_page_url}><ChevronsLeft size={16} /></button>
                <button type="button" aria-label="Previous page" className={pageButtonClass} onClick={() => goToPage(serverPagination.current_page - 1)} disabled={!serverPagination.prev_page_url}><ChevronLeft size={16} /></button>
                <span className="px-4 py-2 text-xs font-semibold text-soft">Page {serverPagination.current_page} of {serverPagination.last_page}</span>
                <button type="button" aria-label="Next page" className={pageButtonClass} onClick={() => goToPage(serverPagination.current_page + 1)} disabled={!serverPagination.next_page_url}><ChevronRight size={16} /></button>
                <button type="button" aria-label="Last page" className={pageButtonClass} onClick={() => goToPage(serverPagination.last_page)} disabled={!serverPagination.next_page_url}><ChevronsRight size={16} /></button>
              </>
            ) : (
              <>
                <button type="button" aria-label="First page" className={pageButtonClass} onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft size={16} /></button>
                <button type="button" aria-label="Previous page" className={pageButtonClass} onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft size={16} /></button>
                <button type="button" aria-label="Next page" className={pageButtonClass} onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight size={16} /></button>
                <button type="button" aria-label="Last page" className={pageButtonClass} onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight size={16} /></button>
              </>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
