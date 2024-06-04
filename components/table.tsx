'use client';

import { useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, LucideFileText, LucideFolder, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { File } from '@/types/type';
import { ShareModal } from './modal/share-modal';
import { DeleteModal } from './modal/delete-modal';
import Link from 'next/link';
import { fileDownload, fileMoveFolder } from '@/api/file-api';
import { useFile } from '@/context/file-context';
import { folderMoveFolder } from '@/api/folder-api';

export const columns: ColumnDef<File>[] = [
  {
    accessorKey: 'originalFileName',
    header: '이름',
    cell: ({ row }) => {
      if (row.original.type == 'FILE') {
        return (
          <div
            className='flex items-center gap-2 hover:underline underline-offset-2 cursor-pointer'
            onDoubleClick={() => {
              if (row.original.type == 'FILE') fileDownload(row.original.id, row.original.originalFileName);
            }}
          >
            <LucideFileText />
            {row.getValue('originalFileName')}
          </div>
        );
      } else
        return (
          <Link
            href={`/home/${row.original.id}`}
            className='flex items-center gap-2 hover:underline underline-offset-2 cursor-pointer'
          >
            <LucideFolder />
            {row.getValue('originalFileName')}
          </Link>
        );
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => {
      return (
        <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          수정한 날짜
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => <div className='lowercase'>{row.getValue('updatedAt')}</div>,
  },
  {
    accessorKey: 'username',
    header: () => <div className=''>수정한 사람</div>,
    cell: ({ row }) => <div>{row.getValue('username')}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>메뉴</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <ShareModal fileId={row.original.id} shareCode={row.original.code} />
            </DropdownMenuItem>
            <DropdownMenuItem>
              <DeleteModal id={row.original.id} type={row.original.type} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function DataTableDemo({ data }: { data: any }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [selectedRow, setSelectedRow] = useState('');
  const [hoverRow, setHoverRow] = useState('');
  const { refreshFolder } = useFile();

  const handleFolderChange = async () => {
    if (hoverRow == selectedRow) return;

    if (data[hoverRow].type == 'FOLDER' && data[selectedRow].type == 'FOLDER') {
      const isSuccess = await folderMoveFolder(data[selectedRow].id, data[hoverRow].id);
      if (isSuccess) refreshFolder();
    }

    if (data[hoverRow].type == 'FOLDER' && data[selectedRow].type == 'FILE') {
      const isSuccess = await fileMoveFolder(data[selectedRow].id, data[hoverRow].id);
      if (isSuccess) refreshFolder();
    }
  };

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className='w-full pr-5'>
      <div className='flex items-center py-4'>
        <Input
          placeholder='이름 검색...'
          value={(table.getColumn('originalFileName')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('originalFileName')?.setFilterValue(event.target.value)}
          className='max-w-sm'
        />
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  draggable
                  onDragStart={(e) => {
                    setSelectedRow(row.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setHoverRow(row.id);
                    console.log(row.id, row.id == selectedRow);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFolderChange();
                  }}
                  onDragEnd={() => {
                    setSelectedRow('-1');
                    setHoverRow('-1');
                  }}
                  className={`${
                    row.id == hoverRow && hoverRow != selectedRow && 'border-2 border-secondary border-dashed'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
