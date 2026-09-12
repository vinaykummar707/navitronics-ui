import React, { useState, useMemo } from "react";
import {
  Box,
  Table,
  HStack,
  Text,
  Button,
  IconButton,
  Card,
} from "@chakra-ui/react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

export interface ColumnDef<T> {
  id: string;
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  pageSize?: number;
  onRowClick?: (item: T) => void;
  selectedId?: string | number;
  selectedIds?: (string | number)[] | Set<string | number>;
  entityName?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  emptyTitle = "No records found",
  emptyDescription = "There are no records matching your current filter criteria.",
  emptyActionLabel,
  onEmptyAction,
  pageSize = 10,
  onRowClick,
  selectedId,
  selectedIds,
  entityName = "records",
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (colId: string) => {
    if (sortColumn === colId) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortColumn(null);
        setSortDirection("asc");
      }
    } else {
      setSortColumn(colId);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    const colDef = columns.find((c) => c.id === sortColumn);
    if (!colDef) return data;

    const accessor = colDef.accessorKey;
    return [...data].sort((a, b) => {
      let valA: any = accessor ? a[accessor] : (a as any)[sortColumn];
      let valB: any = accessor ? b[accessor] : (b as any)[sortColumn];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection, columns]);

  // Pagination calculation
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIdx = (activePage - 1) * pageSize;
    return sortedData.slice(startIdx, startIdx + pageSize);
  }, [sortedData, activePage, pageSize]);

  if (isLoading) {
    return <LoadingState rows={pageSize > 6 ? 6 : pageSize} type="table" />;
  }

  if (isError) {
    return <ErrorState message={errorMessage} onRetry={onRetry} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  const startEntry = totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1;
  const endEntry = Math.min(activePage * pageSize, totalItems);

  return (
    <Card.Root
      variant="outline"
      w="full"
      overflow="hidden"
    >
      <Box overflowX="auto">
        <Table.Root interactive>
          <Table.Header bg="bg.subtle">
            <Table.Row bg="bg.subtle" borderBottomWidth="1px" borderColor="border.default">
              {columns.map((col) => {
                const isSorted = sortColumn === col.id;
                const canSort = col.sortable !== false && col.accessorKey;

                return (
                  <Table.ColumnHeader
                    key={col.id}
                    w={col.width}
                    textAlign={col.align || "left"}
                    fontSize="11px"
                    fontWeight="600"
                    color="fg.muted"
                    letterSpacing="0.04em"
                    textTransform="uppercase"
                    bg="bg.subtle"
                    borderBottomWidth="1px"
                    borderColor="border.default"
                    cursor={canSort ? "pointer" : "default"}
                    userSelect="none"
                    py="3.5"
                    px="4.5"
                    onClick={() => canSort && handleSort(col.id)}
                    _hover={canSort ? { color: "fg.default" } : undefined}
                  >
                    <HStack
                      gap="1.5"
                      justify={col.align === "right" ? "flex-end" : col.align === "center" ? "center" : "flex-start"}
                    >
                      <span>{col.header}</span>
                      {canSort && (
                        <Box as="span" opacity={isSorted ? 1 : 0.35} shrink="0">
                          {isSorted ? (
                            sortDirection === "asc" ? (
                              <ChevronUp size={13} />
                            ) : (
                              <ChevronDown size={13} />
                            )
                          ) : (
                            <ChevronsUpDown size={13} />
                          )}
                        </Box>
                      )}
                    </HStack>
                  </Table.ColumnHeader>
                );
              })}
            </Table.Row>
          </Table.Header>

          <Table.Body bg="bg.surface">
            {paginatedData.map((item, rowIdx) => {
              const rowKey = keyExtractor(item);
              const isSelected = selectedIds
                ? selectedIds instanceof Set
                  ? selectedIds.has(rowKey)
                  : selectedIds.includes(rowKey)
                : selectedId !== undefined && selectedId === rowKey;

              return (
                <Table.Row
                  key={rowKey}
                  onClick={() => onRowClick && onRowClick(item)}
                  cursor={onRowClick ? "pointer" : "default"}
                  bg={isSelected ? "blue.subtle" : undefined}
                  _hover={{ bg: isSelected ? "blue.subtle" : "bg.subtle" }}
                  borderBottomWidth={rowIdx === paginatedData.length - 1 ? "0px" : "1px"}
                  borderColor="border.default"
                  transition="background-color 0.12s ease"
                >
                  {columns.map((col) => {
                    const content = col.cell
                        ? col.cell(item, rowIdx)
                        : col.accessorKey
                        ? (item[col.accessorKey] as any)
                        : null;

                    return (
                      <Table.Cell
                        key={col.id}
                        color="fg.default"
                        textAlign={col.align || "left"}
                        borderColor="border.default"
                        py="3"
                        px=""
                      >
                        {content}
                      </Table.Cell>
                    );
                  })}
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Grounded Pagination Footer Bar */}
      <HStack
        px="4"
        py="2.5"
        borderTopWidth="1px"
        borderColor="border.default"
        justify="space-between"
        bg="bg.subtle"
        wrap="wrap"
        gap="3"
      >
        <Text fontSize="xs" color="fg.muted">
          Showing <Text as="span" fontWeight="600" color="fg.default">{startEntry}</Text> to{" "}
          <Text as="span" fontWeight="600" color="fg.default">{endEntry}</Text> of{" "}
          <Text as="span" fontWeight="600" color="fg.default">{totalItems}</Text> {entityName}
        </Text>

        {totalPages > 1 ? (
          <HStack gap="1.5">
            <IconButton
              size="xs"
              variant="outline"
              aria-label="Previous page"
              disabled={activePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              borderRadius="xs"
              borderColor="border.default"
            >
              <ChevronLeft size={13} />
            </IconButton>

            <HStack gap="1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= activePage - 1 && pageNum <= activePage + 1)
                ) {
                  const isActive = pageNum === activePage;
                  return (
                    <Button
                      key={pageNum}
                      size="xs"
                      variant={isActive ? "solid" : "ghost"}
                      colorPalette={isActive ? "blue" : "gray"}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                } else if (
                  (pageNum === 2 && activePage > 3) ||
                  (pageNum === totalPages - 1 && activePage < totalPages - 2)
                ) {
                  return (
                    <Text key={pageNum} fontSize="xs" color="fg.muted" px="0.5">
                      ...
                    </Text>
                  );
                }
                return null;
              })}
            </HStack>

            <IconButton
              size="xs"
              variant="outline"
              aria-label="Next page"
              disabled={activePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              borderColor="border.default"
            >
              <ChevronRight size={13} />
            </IconButton>
          </HStack>
        ) : (
          <Text fontSize="xs" color="fg.subtle">
            All records displayed
          </Text>
        )}
      </HStack>
    </Card.Root>
  );
}

export default DataTable;
