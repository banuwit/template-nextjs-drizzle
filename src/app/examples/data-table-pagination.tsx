import type { ReactTable, RowData } from '@tanstack/react-table';
import type { MouseEvent } from 'react';

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import type { DataTableFeatures } from './data-table-features';

interface DataTablePaginationProps<TData extends RowData> {
    table: ReactTable<DataTableFeatures, TData>;
}

function getPageItems(
    currentPage: number,
    pageCount: number,
    maxVisible = 5,
): number[] {
    if (pageCount <= maxVisible) {
        return Array.from({ length: pageCount }, (_, index) => index + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = currentPage - half;
    let end = start + maxVisible - 1;

    if (start < 1) {
        start = 1;
        end = maxVisible;
    }

    if (end > pageCount) {
        end = pageCount;
        start = pageCount - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function DataTablePagination<TData extends RowData>({
    table,
}: DataTablePaginationProps<TData>) {
    const pageIndex = table.state.pagination.pageIndex;
    const pageSize = table.state.pagination.pageSize;
    const currentPage = pageIndex + 1;
    const pageCount = table.getPageCount();
    const canPreviousPage = table.getCanPreviousPage();
    const canNextPage = table.getCanNextPage();
    const totalRows = table.getFilteredRowModel().rows.length;
    const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
    const to = Math.min((pageIndex + 1) * pageSize, totalRows);

    function handlePageClick(
        event: MouseEvent<HTMLAnchorElement>,
        pageIndex: number,
    ) {
        event.preventDefault();
        table.setPageIndex(pageIndex);
    }

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:gap-6 lg:gap-8">
            <div className="text-muted-foreground sm:flex-1">
                Showing {from} - {to} of {totalRows} data
            </div>
            <div className="flex flex-row items-center gap-2">
                <div className="flex items-center gap-2">
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value));
                        }}
                    >
                        <SelectTrigger className="w-[60px]">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            <SelectGroup>
                                {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                                    <SelectItem
                                        key={pageSize}
                                        value={`${pageSize}`}
                                    >
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <Pagination className="mx-0 w-auto">
                    <PaginationContent className="flex-wrap justify-center">
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                text=""
                                aria-disabled={!canPreviousPage}
                                tabIndex={canPreviousPage ? undefined : -1}
                                className={cn(
                                    !canPreviousPage &&
                                        'pointer-events-none opacity-50',
                                )}
                                onClick={(event) => {
                                    event.preventDefault();

                                    if (canPreviousPage) {
                                        table.previousPage();
                                    }
                                }}
                            />
                        </PaginationItem>
                        {getPageItems(currentPage, pageCount).map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    href="#"
                                    isActive={page === currentPage}
                                    onClick={(event) =>
                                        handlePageClick(event, page - 1)
                                    }
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                text=""
                                aria-disabled={!canNextPage}
                                tabIndex={canNextPage ? undefined : -1}
                                className={cn(
                                    !canNextPage &&
                                        'pointer-events-none opacity-50',
                                )}
                                onClick={(event) => {
                                    event.preventDefault();

                                    if (canNextPage) {
                                        table.nextPage();
                                    }
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}
