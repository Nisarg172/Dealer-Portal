'use client';

import { useEffect, useState } from 'react';

export function useServerTable<T>(
  fetcher: (params: any) => Promise<any>,
  initialSortBy: string
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterOptions, setFilterOptions] = useState<{ key: string; value: string } | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [refreshKey, setRefreshKey] = useState(0);

  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
  });

  const refresh = () => setRefreshKey((p) => p + 1);

  const loadData = async () => {
    try {
      setLoading(true);

      const res = await fetcher({
        search,
        sortBy,
        sortOrder,
        page,
        limit,
        filter: filterOptions,
      });

      setData(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, sortBy, sortOrder, page, filterOptions, refreshKey]);

  const handelFilterOption = (option: { key: string; value: string } | null) => {
    if (filterOptions?.value === option?.value) {
      setFilterOptions(null);
    } else {
      setFilterOptions(option);
    }
  };

  return {
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
  };
}
