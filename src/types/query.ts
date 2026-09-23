export type QueryOptions<TRow> = {
  filters?: Partial<TRow>
  search?: {
    column: keyof TRow
    value: string
  }
  range?: {
    from: number
    to: number
  }
  orderBy?: {
    column: keyof TRow
    ascending?: boolean
  }
  custom?: (query: any) => any
  skip?: boolean;
  includeDeleted?: boolean;
  columns?: string;
}