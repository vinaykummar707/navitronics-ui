"use client";
/*
 * Documentation:
 * Table — https://app.subframe.com/11b10bc240cf/library?component=Table_142dfde7-d0cc-48a1-a04c-a08ab2252633
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface CellProps extends React.TdHTMLAttributes<HTMLTableDataCellElement> {
  children?: React.ReactNode;
  className?: string;
}

const Cell = React.forwardRef<HTMLTableCellElement, CellProps>(function Cell(
  { children, className, ...otherProps }: CellProps,
  ref
) {
  const isCentered = className?.includes("justify-center") || className?.includes("text-center");
  const isEnd = className?.includes("justify-end") || className?.includes("text-right");

  return (
    <td
      className={SubframeUtils.twClassNames(
        className,
        isCentered && "text-center",
        isEnd && "text-right"
      )}
      ref={ref}
      {...otherProps}
    >
      <div
        className={SubframeUtils.twClassNames(
          "flex h-12 w-full items-center gap-1 px-3",
          className,
          "!flex",
          isCentered && "!justify-center !text-center mx-auto",
          isEnd && "!justify-end !text-right ml-auto"
        )}
      >
        {children}
      </div>
    </td>
  );
});

interface HeaderCellProps
  extends React.ThHTMLAttributes<HTMLTableHeaderCellElement> {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const HeaderCell = React.forwardRef<HTMLTableCellElement, HeaderCellProps>(
  function HeaderCell(
    { children, icon = null, className, ...otherProps }: HeaderCellProps,
    ref
  ) {
    const isCentered = className?.includes("justify-center") || className?.includes("text-center");
    const isEnd = className?.includes("justify-end") || className?.includes("text-right");

    return (
      <th
        className={SubframeUtils.twClassNames(
          className,
          isCentered && "text-center",
          isEnd && "text-right"
        )}
        ref={ref}
        {...otherProps}
      >
        <div
          className={SubframeUtils.twClassNames(
            "flex h-8 w-full items-center gap-1 px-3 text-left",
            className,
            "!flex",
            isCentered && "!justify-center !text-center mx-auto",
            isEnd && "!justify-end !text-right ml-auto"
          )}
        >
          {children ? (
            <span className="whitespace-nowrap text-caption-bold font-caption-bold text-subtext-color">
              {children}
            </span>
          ) : null}
          {icon ? (
            <SubframeCore.IconWrapper className="text-caption font-caption text-subtext-color">
              {icon}
            </SubframeCore.IconWrapper>
          ) : null}
        </div>
      </th>
    );
  }
);

interface HeaderRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children?: React.ReactNode;
  className?: string;
}

const HeaderRow = React.forwardRef<HTMLTableRowElement, HeaderRowProps>(
  function HeaderRow(
    { children, className, ...otherProps }: HeaderRowProps,
    ref
  ) {
    return (
      <tr className={className} ref={ref} {...otherProps}>
        {children}
      </tr>
    );
  }
);

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children?: React.ReactNode;
  clickable?: boolean;
  className?: string;
}

const Row = React.forwardRef<HTMLTableRowElement, RowProps>(function Row(
  { children, clickable = false, className, ...otherProps }: RowProps,
  ref
) {
  return (
    <tr
      className={SubframeUtils.twClassNames(
        "group/5d119f8d border-t border-solid border-neutral-border bg-sidebar-background transition-colors",
        { "hover:bg-neutral-100/60": clickable },
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {children}
    </tr>
  );
});

interface TableRootProps extends React.TableHTMLAttributes<HTMLTableElement> {
  header?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const TableRoot = React.forwardRef<HTMLTableElement, TableRootProps>(
  function TableRoot(
    { header, children, className, ...otherProps }: TableRootProps,
    ref
  ) {
    return (
      <table
        className={SubframeUtils.twClassNames("w-full bg-sidebar-background", className)}
        ref={ref}
        {...otherProps}
      >
        <thead className="bg-sidebar-background">{header}</thead>
        <tbody className="border-b border-solid border-neutral-border bg-sidebar-background">
          {children}
        </tbody>
      </table>
    );
  }
);

export const Table = Object.assign(TableRoot, {
  Cell,
  HeaderCell,
  HeaderRow,
  Row,
});
