"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { useServerTable } from "@/hooks/useServerTable";
import { 
  FiSearch, FiFilter, FiChevronLeft, FiChevronRight, 
  FiChevronUp, FiChevronDown, FiMoreVertical, FiRefreshCw, 
  FiBox
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

/* ================= TYPES ================= */

export type FilterOption = {
  label: string;
  value: string;
};

export type Column<T> = {
  label: string;
  key?: keyof T;
  sortable?: boolean;
  render?: (row: T, refresh: () => void) => React.ReactNode;
  filterOption?: FilterOption[];
};

export type DataTableRef = {
  refresh: () => void;
};

type Props<T> = {
  columns: Column<T>[];
  fetcher: (params: any) => Promise<any>;
  defaultSortBy: string;
};

/* ================= COMPONENT ================= */

function DataTableInner<T>(
  { columns, fetcher, defaultSortBy }: Props<T>,
  ref: React.Ref<DataTableRef>
) {
  const {
    data,
    loading,
    search,
    setSearch,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    page,
    setPage,
    meta,
    handelFilterOption,
    refresh,
  } = useServerTable<T>(fetcher, defaultSortBy);

  const [openFilter, setOpenFilter] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    refresh,
  }));

  const toggleSort = (key?: keyof T) => {
    if (!key) return;
    const k = key as string;
    if (sortBy === k) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(k);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative group w-full sm:w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search records..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm"
          />
        </div>
        
        <button 
          onClick={() => refresh()} 
          className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200"
          title="Refresh Data"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Table Container */}
      <div className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                {columns.map((c, i) => (
                  <th
                    key={i}
                    className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500"
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        onClick={() => c.sortable && toggleSort(c.key)}
                        className={`flex items-center gap-1 ${c.sortable ? "cursor-pointer hover:text-indigo-600 transition-colors" : ""}`}
                      >
                        {c.label}
                        {c.sortable && (
                          <span className="flex flex-col text-[8px] opacity-40">
                            <FiChevronUp className={sortBy === c.key && sortOrder === "asc" ? "text-indigo-600 opacity-100 scale-125" : ""} />
                            <FiChevronDown className={sortBy === c.key && sortOrder === "desc" ? "text-indigo-600 opacity-100 scale-125" : ""} />
                          </span>
                        )}
                      </span>

                      {/* Filter Popover */}
                      {c.filterOption && (
                        <div className="relative">
                          <button
                            onClick={() => setOpenFilter(openFilter === c.key ? null : (c.key as string))}
                            className={`p-1 rounded-md transition-colors ${openFilter === c.key ? "bg-indigo-100 text-indigo-600" : "hover:bg-slate-200"}`}
                          >
                            <FiFilter size={12} />
                          </button>

                          <AnimatePresence>
                            {openFilter === c.key && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 shadow-indigo-900/5"
                              >
                                <button
                                  className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 text-slate-600"
                                  onClick={() => {
                                    handelFilterOption(null);
                                    setOpenFilter(null);
                                    setPage(1);
                                  }}
                                >
                                  Show All
                                </button>
                                {c.filterOption.map((option) => (
                                  <button
                                    key={option.value}
                                    className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors"
                                    onClick={() => {
                                      handelFilterOption({ key: c.key as string, value: option.value });
                                      setOpenFilter(null);
                                      setPage(1);
                                    }}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={columns.length} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FiBox size={40} className="text-slate-200" />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                    {columns.map((c, j) => (
                      <td key={j} className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {c.render
                          ? c.render(row, refresh)
                          : String((row as any)[c.key as string] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Container */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Showing Page <span className="text-slate-900">{page}</span> of <span className="text-slate-900">{meta.totalPages || 1}</span>
        </p>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-white border border-slate-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all text-slate-600 shadow-sm"
          >
            <FiChevronLeft /> Prev
          </button>

          <button
            disabled={page === meta.totalPages || meta.totalPages === 0}
            onClick={() => setPage(page + 1)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-white border border-slate-200 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-all text-slate-600 shadow-sm"
          >
            Next <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}

const DataTable = forwardRef(DataTableInner) as <T>(
  props: Props<T> & { ref?: React.Ref<DataTableRef> }
) => React.ReactElement;

export default DataTable;