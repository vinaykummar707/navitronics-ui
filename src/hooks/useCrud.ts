import { supabase } from '@/supabaseClient'
import { QueryOptions } from '@/types/query'
import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query'

export function createCrudHooks<
  TRow extends { id: string },
  TInsert,
  TUpdate
>(table: string) {
  const queryClient = new QueryClient()

  // ========================
  // LIST
  // ========================
  const useList = (options?: QueryOptions<TRow>) =>
    useQuery({
      queryKey: [table, options],
      queryFn: async () => {
        let query = supabase.from(table).select('*', { count: 'exact' })

        // Apply filters
        if (options?.filters) {
          Object.entries(options.filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              query = query.eq(key, value)
            }
          })
        }

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
          data: data as TRow[] || data as unknown as TRow, // Handle both array and single object cases
          count,
        }
      },
      enabled: !options?.skip
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
          .single()

        if (error) throw error
        return data as TRow
      },
      enabled: !!id,
    })

  // ========================
  // CREATE
  // ========================
  const useCreate = () =>
    useMutation({
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

  // ========================
  // UPDATE
  // ========================
  const useUpdate = () =>
    useMutation({
      mutationFn: async ({
        id,
        payload,
      }: {
        id: string
        payload: TUpdate
      }) => {
        const { data, error } = await supabase
          .from(table)
          .update(payload)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [table] })
      },
    })

  // ========================
  // DELETE (Soft delete ready)
  // ========================
  const useDelete = () =>
    useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from(table)
          .update({ deleted: true }) // Soft delete by setting 'deleted' flag
          .eq('id', id)

        if (error) throw error
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [table] })
      },
    })

  return {
    useList,
    useGet,
    useCreate,
    useUpdate,
    useDelete,
  }
}