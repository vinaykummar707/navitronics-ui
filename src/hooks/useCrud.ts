import { supabase } from '@/supabaseClient'
import { QueryOptions } from '@/types/query'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const SOFT_DELETE_TABLES = [
  'routes',
  'stops',
  'depots',
  'regions',
  'organizations',
  'users',
  'font_settings',
]

export function createCrudHooks<
  TRow extends { id: string },
  TInsert,
  TUpdate
>(table: string) {
  const isSoftDeleteTable = SOFT_DELETE_TABLES.includes(table)

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
        if (
          !options?.includeDeleted &&
          filters.deleted === undefined &&
          isSoftDeleteTable
        ) {
          filters.deleted = false
        }

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
  const useGet = (id: string, options?: { includeDeleted?: boolean }) =>
    useQuery({
      queryKey: [table, id, options?.includeDeleted],
      queryFn: async () => {
        let query = supabase
          .from(table)
          .select('*')
          .eq('id', id)

        if (!options?.includeDeleted && isSoftDeleteTable) {
          query = query.eq('deleted', false)
        }

        const { data, error } = await query.maybeSingle()

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
  // UPDATE (With Concurrency & Soft-Delete Protection)
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

        let query = supabase
          .from(table)
          .update(updatePayload)
          .eq('id', id)

        // Concurrency protection: prevent updating soft-deleted records
        if (isSoftDeleteTable) {
          query = query.eq('deleted', false)
        }

        const { data, error } = await query.select()

        if (error) throw error

        if (!data || data.length === 0) {
          throw new Error(
            'This record has been deleted or is no longer accessible and cannot be updated.'
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
  // DELETE (Soft delete with audit metadata)
  // ========================
  const useDelete = () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async (id: string) => {
        const deletePayload: Record<string, any> = {
          deleted: true,
          updated_at: new Date().toISOString(),
        }

        if (table === 'users') {
          deletePayload.active = false
        }

        let query = supabase
          .from(table)
          .update(deletePayload)
          .eq('id', id)

        if (isSoftDeleteTable) {
          query = query.eq('deleted', false)
        }

        const { error } = await query

        if (error) throw error
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [table] })
      },
    })
  }

  // ========================
  // DELETE ALL / BULK DELETE
  // ========================
  const useDeleteAll = () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async (ids: string[]) => {
        const deletePayload: Record<string, any> = {
          deleted: true,
          updated_at: new Date().toISOString(),
        }

        if (table === 'users') {
          deletePayload.active = false
        }

        let query = supabase
          .from(table)
          .update(deletePayload)
          .in('id', ids)

        if (isSoftDeleteTable) {
          query = query.eq('deleted', false)
        }

        const { error } = await query

        if (error) throw error
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [table] })
      },
    })
  }

  // ========================
  // RESTORE (Soft delete recovery with conflict detection)
  // ========================
  const useRestore = () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: async (id: string) => {
        const restorePayload: Record<string, any> = {
          deleted: false,
          updated_at: new Date().toISOString(),
        }

        if (table === 'users') {
          restorePayload.active = true
        }

        const { data, error } = await supabase
          .from(table)
          .update(restorePayload)
          .eq('id', id)
          .eq('deleted', true)
          .select()

        if (error) {
          if (error.code === '23505') {
            throw new Error(
              'Cannot restore: an active record with the same unique name or identifier already exists.'
            )
          }
          throw error
        }

        if (!data || data.length === 0) {
          throw new Error('Record not found or already active.')
        }

        return data[0] as TRow
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
    useRestore,
  }
}

/**
 * Reusable utility to check for active duplicates (case-insensitive & trimmed)
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
    .eq('deleted', false)

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