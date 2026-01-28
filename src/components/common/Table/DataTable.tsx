"use client";

import {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { useServerTable } from "@/hooks/useServerTable";
import { FaFilter } from "react-icons/fa";

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
    refresh, // 🔥 from hook
  } = useServerTable<T>(fetcher, defaultSortBy);

  const [openFilter, setOpenFilter] = useState<string | null>(null);

  /* ===== expose methods to parent ===== */
  useImperativeHandle(ref, () => ({
    refresh,
  }));

  /* ===== sorting ===== */
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

  /* ================= UI ================= */

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Search..."
        className="border px-3 py-2 rounded w-64"
      />

      {/* Table */}
      <table className="min-w-full bg-white shadow rounded">
        <thead className="bg-gray-100 text-xs uppercase">
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                onClick={() => c.sortable && toggleSort(c.key)}
                className={`px-4 py-3 text-left ${
                  c.sortable ? "cursor-pointer" : ""
                }`}
              >
                {c.label}

                {c.key === sortBy && (sortOrder === "asc" ? " ▲" : " ▼")}

                {/* Filter */}
                {c.filterOption && (
                  <div className="relative inline-block ml-2">
                    <button
                      onClick={() =>
                        setOpenFilter(
                          openFilter === c.key ? null : (c.key as string)
                        )
                      }
                      className="text-gray-600 hover:text-black"
                    >
                      <FaFilter size={14} />
                    </button>

                    {openFilter === c.key && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
                        <button
                          className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100"
                          onClick={() => {
                            handelFilterOption(null);
                            setOpenFilter(null);
                            setPage(1);
                          }}
                        >
                          All
                        </button>

                        {c.filterOption.map((option) => (
                          <button
                            key={option.value}
                            className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100"
                            onClick={() => {
                              handelFilterOption({
                                key: c.key as string,
                                value: option.value,
                              });
                              setOpenFilter(null);
                              setPage(1);
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-6 text-center">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-6 text-center text-gray-500"
              >
                No records found
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="border-t">
                {columns.map((c, j) => (
                  <td key={j} className="px-4 py-3">
                    {c.render
                      ? c.render(row, refresh) // 🔥 pass refresh here
                      : String((row as any)[c.key as string] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Page {page} of {meta.totalPages}
        </span>

        <div className="space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <button
            disabled={page === meta.totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= EXPORT ================= */

const DataTable = forwardRef(DataTableInner) as <T>(
  props: Props<T> & { ref?: React.Ref<DataTableRef> }
) => React.ReactElement;

export default DataTable;
