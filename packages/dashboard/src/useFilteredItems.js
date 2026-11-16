import { useMemo } from 'react';

/**
 * A list narrowed by a search, and optionally by field values, then sorted.
 *
 *   useFilteredItems(items, searchQuery, filterFn)           // as before
 *   useFilteredItems(items, {
 *     searchQuery,                      // text to look for
 *     searchFields: ['title', 'notes'], // where to look (default: every field)
 *     filterFn: (item, query) => bool,  // or decide the search yourself
 *     where: { project_id: id },        // keep items whose field equals the value
 *                                       // (compared as text; empty values are ignored)
 *     sortFn: (a, b) => …,              // order of the result
 *   })
 *
 * Lifted from Najenga's useFilteredItems (searchFields, its project filter as
 * `where`, sortFn). Without the options it behaves as it always has.
 */
export default function useFilteredItems(items, queryOrOptions, legacyFilterFn) {
  const options = queryOrOptions && typeof queryOrOptions === 'object' ? queryOrOptions : { searchQuery: queryOrOptions, filterFn: legacyFilterFn };
  const { searchQuery, filterFn, searchFields, where, sortFn } = options;
  // Keyed by content: callers pass fresh arrays and objects every render.
  const fieldsKey = searchFields ? searchFields.join(',') : '';
  const whereKey = where ? JSON.stringify(where) : '';

  return useMemo(() => {
    if (!items) return [];
    let list = items;

    const conditions = where ? Object.entries(where).filter(([, v]) => v !== undefined && v !== null && v !== '') : [];
    if (conditions.length) {
      list = list.filter((item) => conditions.every(([field, value]) => String(item?.[field]) === String(value)));
    }

    const searchLower = (searchQuery || '').toLowerCase();
    if (searchLower) {
      list = list.filter((item) => {
        if (filterFn) return filterFn(item, searchLower);
        if (searchFields) {
          return searchFields.some((field) => {
            const value = item?.[field];
            return value !== undefined && value !== null && String(value).toLowerCase().includes(searchLower);
          });
        }
        // Default: search across all string values
        return Object.values(item).some((val) => {
          if (typeof val === 'string') return val.toLowerCase().includes(searchLower);
          if (val && typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(searchLower);
          return false;
        });
      });
    }

    if (sortFn) list = [...list].sort(sortFn);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchFields and where are keyed by content
  }, [items, searchQuery, filterFn, fieldsKey, whereKey, sortFn]);
}
