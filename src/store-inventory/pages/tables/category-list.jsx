'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Eye, Info, Search, SquarePen, Trash, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardFooter,
  CardHeader,
  CardTable,
  CardToolbar,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/components/ui/data-grid-table';
import { Input, InputWrapper } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { CategoryDetailsEditSheet } from '../components/category-details-edit-sheet';
import { CategoryFormSheet } from '../components/category-form-sheet';

const mockData = [
  {
    id: '1',
    productInfo: {
      image: 'running-shoes.svg',
      title: 'Running Shoes',
      label: 'WM-8421',
    },
    productsQty: '120',
    totalEarnings: '$2,583.00',
    status: { label: 'Active', variant: 'success' },
    featured: true,
  },
  {
    id: '2',
    productInfo: {
      image: 'flip-flops.svg',
      title: 'Flip-flops',
      label: 'UC-3990',
    },
    productsQty: '245',
    totalEarnings: '$10,110.00',
    status: { label: 'Active', variant: 'success' },
    featured: false,
  },
  
];

export function CategoryListTable({ mockData: propsMockData, displaySheet }) {
  const data = propsMockData || mockData;
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([{ id: 'id', desc: false }]);
  const [featuredState, setFeaturedState] = useState(() =>
    Object.fromEntries(data.map((item) => [item.id, item.featured])),
  );

  // Modal state
  const [isCategoryDetailsEditOpen, setIsCategoryDetailsEditOpen] =
    useState(false);
  const [, setSelectedCategory] = useState(undefined);

  // Sheet state for displaySheet prop
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);

  // Auto-open sheet based on displaySheet prop
  useEffect(() => {
    if (displaySheet) {
      switch (displaySheet) {
        case 'categoryDetails':
          setIsCategoryDetailsEditOpen(true);
          break;
        case 'createCategory':
          setIsCreateCategoryOpen(true);
          break;
        case 'editCategory':
          setIsEditCategoryOpen(true);
          break;
      }
    }
  }, [displaySheet]);

  const ColumnInputFilter = ({ column }) => {
    return (
      <Input
        placeholder="Filter..."
        value={column.getFilterValue() ?? ''}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className="w-40"
      />
    );
  };

  const handleFeaturedChange = (id, checked) => {
    setFeaturedState((prev) => ({ ...prev, [id]: checked }));

    // Show toaster notification with custom Alert style
    if (checked) {
      toast.custom(
        (t) => (
          <Alert
            variant="mono"
            icon="success"
            close={true}
            onClose={() => toast.dismiss(t)}
          >
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>Category marked as featured successfully.</AlertTitle>
          </Alert>
        ),

        {
          duration: 5000,
        },
      );
    } else {
      toast.custom(
        (t) => (
          <Alert
            variant="mono"
            icon="success"
            close={true}
            onClose={() => toast.dismiss(t)}
          >
            <AlertIcon>
              <Info />
            </AlertIcon>
            <AlertTitle>Category removed from featured status.</AlertTitle>
          </Alert>
        ),

        {
          duration: 5000,
        },
      );
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsCategoryDetailsEditOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        accessorFn: (row) => row.id,
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 23,
        meta: {
          cellClassName: '',
        },
      },
      {
        id: 'productInfo',
        accessorFn: (row) => row.productInfo,
        header: ({ column }) => (
          <DataGridColumnHeader title="Category" column={column} />
        ),

        cell: (info) => {
          const productInfo = info.row.getValue('productInfo');
          return (
            <div className="flex items-center gap-2.5">
              <Card className="flex items-center justify-center rounded-md bg-accent/50 h-[40px] w-[50px] shadow-none shrink-0">
                <img
                  src={toAbsoluteUrl(
                    `/media/store/client/icons/light/${productInfo.image}`,
                  )}
                  className="cursor-pointer h-[30px] dark:hidden"
                  alt="image"
                />

                <img
                  src={toAbsoluteUrl(
                    `/media/store/client/icons/dark/${productInfo.image}`,
                  )}
                  className="cursor-pointer h-[30px] light:hidden"
                  alt="image"
                />
              </Card>
              <div className="flex flex-col gap-1">
                <Link
                  to="#"
                  onClick={() => handleCategoryClick(info.row.original)}
                  className="text-sm font-medium tracking-[-1%] cursor-pointer hover:text-primary"
                >
                  {productInfo.title}
                </Link>
                <span className="text-xs text-muted-foreground">
                  Category ID:{' '}
                  <span className="text-xs font-medium text-foreground">
                    {productInfo.label}
                  </span>
                </span>
              </div>
            </div>
          );
        },
        enableSorting: true,
        size: 150,
      },
      {
        id: 'productsQty',
        accessorFn: (row) => row.productsQty,
        header: ({ column }) => (
          <DataGridColumnHeader title="Products QTY" column={column} />
        ),

        cell: (info) => info.getValue(),
        enableSorting: true,
        size: 65,
      },
      {
        id: 'totalEarnings',
        accessorFn: (row) => row.totalEarnings,
        header: ({ column }) => (
          <DataGridColumnHeader title="Total Earnings" column={column} />
        ),

        cell: (info) => info.getValue(),
        enableSorting: true,
        size: 80,
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),

        cell: (info) => {
          const status = info.row.original.status;
          const variant = status.variant;
          return (
            <Badge variant={variant} appearance="light">
              {status.label}
            </Badge>
          );
        },
        enableSorting: true,
        size: 80,
      },
      {
        id: 'featured',
        header: ({ column }) => (
          <DataGridColumnHeader title="Featured" column={column} />
        ),

        enableSorting: true,
        cell: (info) => {
          const id = info.row.getValue('id');
          return (
            <div className="flex justify-center">
              <Checkbox
                size="sm"
                id={`featured-${id}`}
                checked={!!featuredState[id]}
                onCheckedChange={(checked) =>
                  handleFeaturedChange(id, Boolean(checked))
                }
              />
            </div>
          );
        },
        size: 45,
      },
      {
        id: 'actions',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => {
          const categoryId = row.getValue('id');
          const categoryTitle = row.original.productInfo.title;

          const handleView = () => {
            console.log('View category:', categoryId);
          };

          const handleEdit = () => {
            setIsEditCategoryOpen(true);
            console.log('Edit category:', categoryId);
          };

          const handleDelete = () => {
            toast.error(`Deleting category: ${categoryTitle}`);
            console.log('Delete category:', categoryId);
          };

          return (
            <div className="flex items-center gap-1">
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleView}
                title="View category"
              >
                <Eye />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleEdit}
                title="Edit category"
              >
                <SquarePen />
              </Button>
              <Button
                variant="dim"
                mode="icon"
                size="sm"
                onClick={handleDelete}
                title="Delete category"
              >
                <Trash />
              </Button>
            </div>
          );
        },
        size: 60,
      },
    ],

    [featuredState],
  );

  const filteredData = useMemo(() => {
    let result = [...data];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.productInfo.title.toLowerCase().includes(query),
      );
    }
    return result;
  }, [data, searchQuery]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination,
      sorting,
      rowSelection,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      {/* Category List Table */}
      <DataGrid
        table={table}
        recordCount={filteredData?.length || 0}
        tableLayout={{
          columnsPinnable: true,
          columnsMovable: true,
          columnsVisibility: true,
          cellBorder: true,
        }}
      >
        <Card>
          <CardHeader className="py-3.5">
            <CardToolbar className="flex items-center gap-2">
              <InputWrapper className="w-full lg:w-[200px]">
                <Search />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {searchQuery && (
                  <Button
                    variant="dim"
                    size="sm"
                    className="-me-3.5"
                    onClick={() => setSearchQuery('')}
                  >
                    {searchQuery && <X />}
                  </Button>
                )}
              </InputWrapper>
            </CardToolbar>
          </CardHeader>
          <CardTable>
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>
          <CardFooter>
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>

      {/* Category Details Edit Sheet */}
      <CategoryDetailsEditSheet
        open={isCategoryDetailsEditOpen}
        onOpenChange={setIsCategoryDetailsEditOpen}
      />

      {/* Edit Category Sheet */}
      <CategoryFormSheet
        mode="edit"
        open={isEditCategoryOpen}
        onOpenChange={setIsEditCategoryOpen}
      />

      {/* Create Category Sheet */}
      <CategoryFormSheet
        mode="new"
        open={isCreateCategoryOpen}
        onOpenChange={setIsCreateCategoryOpen}
      />
    </>
  );
}
