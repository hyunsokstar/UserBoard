import React, { useState, useEffect, useMemo } from 'react';
import 'react-data-grid/lib/styles.css';
import { Box, Button, Center, Checkbox, Spacer, useToast } from '@chakra-ui/react';
import DataGrid, { Column, RenderCellProps, RenderCheckboxProps, RenderEditCellProps, RenderHeaderCellProps, RenderSortStatusProps, SelectCellFormatter, SortColumn, useRowSelection } from 'react-data-grid';
import { apiForGetAllUsers, apiForSaveOrUpdateUserInfoForChecked } from '../api/apiForUserBoard';
import styles from './styles.module.scss';
import { Direction, ITypeForResponseDataForGetAllUsers, IUser, Row } from '@/types/typeForUserBoard';
import { SelectColumnForRdg } from '@/components/Formatter/CheckBox/SelectColumnForRdg';
import TextEditorForDevLevel from '@/components/GridEditor/TextEditor/TextEditorForDevLevel';
import { ArrowForwardIcon, DeleteIcon, EmailIcon } from '@chakra-ui/icons';
import SelectBoxForGender from '@/components/GridEditor/SelectBox/SelectBoxForGender';
import SelectBoxForDevRole from '@/components/GridEditor/SelectBox/SelectBoxForDevRole';
import TextEditorForPhoneNumber from '@/components/GridEditor/TextEditor/TextEditorForPhoneNumber';
import { UseMutationOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useDeleteUsersMutation from '@/hooks/useDeleteUsersMutation';


const columns = [
  SelectColumnForRdg,
  // { key: 'id', name: 'id' },
  { key: 'email', name: 'Email', sortable: true, frozen: true },
  { key: 'nickname', name: 'Nickname' },
  {
    key: 'gender',
    name: 'Gender',
    renderEditCell: SelectBoxForGender
  },
  {
    key: 'phoneNumber',
    name: 'Phone Number',
    // formatter: FormatterForPhoneNumber,
    renderEditCell: TextEditorForPhoneNumber,
  },
  {
    key: 'role',
    name: 'Role',
    renderEditCell: SelectBoxForDevRole
  },
  {
    key: 'backEndLevel',
    name: 'backEndLevel',
    renderEditCell: TextEditorForDevLevel,
  },
  {
    key: 'frontEndLevel',
    name: 'frontEndLevel',
    renderEditCell: TextEditorForDevLevel,
  }
];

interface SummaryRow {
  id: string;
  totalCount: number;
  yesCount: number;
}

// 1122
const UserlistByDataGrid = () => {
  const toast = useToast();
  const [rows, setRows] = useState<IUser[]>([]);
  const deleteUsersMutation = useDeleteUsersMutation();

  const [pageNum, setPageNum] = useState(1);
  const [selectedRows, setSelectedRows] = useState((): ReadonlySet<number> => new Set());
  const [direction, setDirection] = useState<Direction>('ltr');
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);
  const queryClient = useQueryClient();

  console.log("rows : ", rows);


  const sortedRows = useMemo((): IUser[] => {
    if (sortColumns.length === 0) return rows;

    return [...rows].sort((a, b) => {
      for (const sort of sortColumns) {
        const comparator = getComparator(sort.columnKey);
        const compResult = comparator(a, b);
        if (compResult !== 0) {
          return sort.direction === 'ASC' ? compResult : -compResult;
        }
      }
      return 0;
    });
  }, [rows, sortColumns]);

  const { isLoading, error, data: dataForUserBoard } = useQuery<ITypeForResponseDataForGetAllUsers>({
    queryKey: ['apiForGetAllUsers', pageNum],
    queryFn: apiForGetAllUsers,
  });

  const SaveOrUpdateUserInfoForChecked = useMutation({
    mutationFn: apiForSaveOrUpdateUserInfoForChecked,
    onSuccess: (result: any) => {
      // 성공 시 처리할 내용
      console.log("result : ", result);

      queryClient.refetchQueries({ queryKey: ['apiForGetAllUsers'] })
      setSelectedRows(new Set());

      toast({
        title: "Update User Success",
        description: result.message,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      // 에러 발생 시 처리할 내용
    },
  });

  function handleSaveSelectedRows() {
    const selectedRowsData = rows.filter(row => selectedRows.has(row.id));
    SaveOrUpdateUserInfoForChecked.mutate(selectedRowsData)
  }

  function handleDeleteSelectedRows() {
    const checkedIds = Array.from(selectedRows).map((selectedId: number) => selectedId)

    deleteUsersMutation.mutate(checkedIds);
  }

  function rowKeyGetter(row: Row) {
    return row.id;
  }

  useEffect(() => {
    if (dataForUserBoard) {
      const userRows = dataForUserBoard.users.map((user) => ({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        frontEndLevel: user.frontEndLevel,
        backEndLevel: user.backEndLevel
      }));
      setRows(userRows);
    }
  }, [dataForUserBoard]);

  if (isLoading) return <Box>Loading...</Box>;
  if (error) return <Box>Error: {error.message}</Box>;

  return (
    <Box width={'80%'} mx={'auto'} mt={5}>
      <Box display={"flex"} justifyContent={"space-between"} mt={3} mx={"auto"} gap={2}>
        <Button
          size='sm'
          flex={0.1}
          mb={3}
          colorScheme={selectedRows.size === 0 ? "gray" : "red"}
          disabled={selectedRows.size === 0}
          leftIcon={<DeleteIcon />}
          onClick={handleDeleteSelectedRows}
        >
          delete
        </Button>
        <Spacer />
        {/* <Button size='sm' variant='outline' leftIcon={<EmailIcon />} flex={0.2} onClick={addNewRow} >
          New Row
        </Button> */}
        <Button
          size='sm'
          // variant='outline'
          rightIcon={<ArrowForwardIcon />}
          flex={0.1}
          disabled={selectedRows.size === 0}
          onClick={handleSaveSelectedRows}
          colorScheme={selectedRows.size === 0 ? "gray" : "green"}
        >
          Save
        </Button>
      </Box>

      <DataGrid
        columns={columns}
        sortColumns={sortColumns}
        onSortColumnsChange={setSortColumns}
        rows={sortedRows}
        rowKeyGetter={rowKeyGetter}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        onRowsChange={setRows}
        direction={direction}
        renderers={{ renderSortStatus, renderCheckbox }}
        className="fill-grid"
        style={{ maxWidth: '100%' }}
      />
    </Box>
  );
};

function renderCheckbox({ onChange, ...props }: RenderCheckboxProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.checked, (e.nativeEvent as MouseEvent).shiftKey);
  }
  return <input type="checkbox" {...props} onChange={handleChange} />;
}

function renderSortStatus({ sortDirection, priority }: RenderSortStatusProps) {
  return (
    <>
      {sortDirection !== undefined ? (sortDirection === 'ASC' ? '\u2B9D' : '\u2B9F') : null}
      <span className={styles.sortPriorityClassname}>{priority}</span>
    </>
  );
}

type Comparator = (a: Row, b: Row) => number;

function getComparator(sortColumn: string): Comparator {
  switch (sortColumn) {
    case 'email':
      // case 'priority':
      // case 'issueType':
      return (a, b) => {
        return a[sortColumn].localeCompare(b[sortColumn]);
      };
    // case 'complete':
    //   return (a, b) => {
    //     return a[sortColumn] - b[sortColumn];
    //   };
    default:
      throw new Error(`unsupported sortColumn: "${sortColumn}"`);
  }
}

export default UserlistByDataGrid;
