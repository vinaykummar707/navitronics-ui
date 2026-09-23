import { supabase } from '@/supabaseClient'
import { QueryOptions } from '@/types/query'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function createCrudHooks<
  TRow extends { id: string },
  TInsert,
  TUpdate
>(table: string) {
  // ========================
  // LIST
  // ========================
  const useList = (options?: QueryOptions<TRow> & { count?: 'exact' | 'planned' | 'estimated' }) =>
    useQuery({
      queryKey: [table, options],
      queryFn: async () => {
        const countMode = options?.count || (options?.range ? 'exact' : undefined)
        const selectColumns = options?.columns || '*'
        let query = countMode
          ? supabase.from(table).select(selectColumns, { count: countMode as any })
          : supabase.from(table).select(selectColumns)

        // Apply filters
        const filters = { ...(options?.filters || {}) } as Record<string, any>

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value)
          }
        })

        // Search
        if (options?.search) {
          query = query.ilike(
            options.search.column as string,
            `%${options.search.value}%`
          )
        }

        // Sorting
        if (options?.orderBy) {
          query = query.order(options.orderBy.column as string, {
            ascending: options.orderBy.ascending ?? true,
          })
        }

        // Pagination
        if (options?.range) {
          query = query.range(options.range.from, options.range.to)
        }

        // Custom logic
        if (options?.custom) {
          query = options.custom(query)
        }

        const { data, error, count } = await query

        if (error) throw error

        return {
          data: (data as TRow[]) || (data as unknown as TRow),
          count,
        }
      },
      enabled: !options?.skip,
    })

  // ========================
  // GET BY ID
  // ========================
  const useGet = (id: string) =>
    useQuery({
      queryKey: [table, id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('id', id)
          .maybeSingle()

        if (error) throw error
        return data as TRow | null
      },
      enabled: !!id,
    })

  // ========================
  // CREATE
  // ========================
  const useCreate = () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async (payload: TInsert) => {
        const { data, error } = await supabase
          .from(table)
          .insert(payload)
          .select()
          .single()

        if (error) throw error
        return data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [table] })
      },
    })
  }

  // ========================
  // UPDATE
  // ========================
  const useUpdate = () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async ({
        id,
        payload,
      }: {
        id: string
        payload: TUpdate
      }) => {
        const updatePayload: Record<string, any> = {
          ...(payload as Record<string, any>),
          updated_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
          .from(table)
          .update(updatePayload)
          .eq('id', id)
          .select()

        if (error) throw error

        if (!data || data.length === 0) {
          throw new Error(
            'This record no longer exists or is not accessible and cannot be updated.'
          )
        }

        return data[0] as TRow
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [table] })
      },
    })
  }

  // ========================
  // DELETE (Hard delete)
  // ========================
  const useDelete = () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id)

        if (error) throw error
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [table] })
      },
    })
  }

  // ========================
  // DELETE ALL / BULK DELETE (Hard delete)
  // ========================
  const useDeleteAll = () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async (ids: string[]) => {
        const { error } = await supabase
          .from(table)
          .delete()
          .in('id', ids)

        if (error) throw error
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [table] })
      },
    })
  }

  return {
    useList,
    useGet,
    useCreate,
    useUpdate,
    useDelete,
    useDeleteAll,
  }
}

/**
 * Reusable utility to check for duplicates (case-insensitive & trimmed)
 */
export async function checkActiveDuplicate(
  table: string,
  column: string,
  value: string,
  scopeFilter?: Record<string, any>,
  excludeId?: string
): Promise<boolean> {
  const trimmed = value.trim()
  if (!trimmed) return false

  let query = supabase
    .from(table)
    .select('id')
    .ilike(column, trimmed)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  if (scopeFilter) {
    Object.entries(scopeFilter).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query = query.eq(k, v)
      }
    })
  }

  const { data, error } = await query.limit(1)
  if (error) {
    console.warn(`Duplicate check warning for ${table}.${column}:`, error)
    return false
  }
  return !!data && data.length > 0
}