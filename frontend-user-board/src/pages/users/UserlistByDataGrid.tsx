import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Center, Checkbox } from '@chakra-ui/react';
import 'react-data-grid/lib/styles.css';
import DataGrid, { Column, RenderCellProps, RenderCheckboxProps, RenderEditCellProps, RenderHeaderCellProps, RenderSortStatusProps, SelectCellFormatter, SortColumn, useRowSelection } from 'react-data-grid';
import { apiForGetAllUsers } from '../api/apiForUserBoard';
import { useQuery } from '@tanstack/react-query';
import styles from './styles.module.scss';
import TextEditor from '../../components/Editor/TextEditor';
import { Direction, ITypeForResponseDataForGetAllUsers, Row } from '@/types/typeForUserBoard';
import { SelectColumnForRdg } from '@/components/Formatter/CheckBox/SelectColumnForRdg';
import TextEditorForDevLevel from '@/components/Editor/TextEditorForDevLevel';
import { v4 as uuidv4 } from 'uuid';


const columns = [
  SelectColumnForRdg,
  { key: 'email', name: 'Email', sortable: true, frozen: true },
  { key: 'nickname', name: 'Nickname' },
  { key: 'role', name: 'Role' },
  { key: 'gender', name: 'Gender' },
  {
    key: 'phoneNumber',
    name: 'Phone Number',
    renderEditCell: TextEditor,
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

const UserlistByDataGrid = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [selectedRows, setSelectedRows] = useState((): ReadonlySet<number> => new Set());
  const [direction, setDirection] = useState<Direction>('ltr');
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);

  const sortedRows = useMemo((): readonly Row[] => {
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

  function handleDeleteSelectedRows() {
    const updatedRows = rows.filter((row) => !selectedRows.has(row.id));
    setRows(updatedRows);
    setSelectedRows(new Set());
  }

  function rowKeyGetter(row: Row) {
    return row.id;
  }

  function generateUniqueId() {
    return uuidv4(); // UUID v4 생성
  }

  function addNewRow() {
    const newRow: User = {
      id: generateUniqueId(), // generateUniqueId()는 UUID를 생성하는 함수여야 함
      email: '', // 빈 문자열 또는 기본값으로 설정
      nickname: '',
      role: '',
      gender: '',
      phoneNumber: '',
      frontEndLevel: 1, // 적절한 기본값으로 설정
      backEndLevel: 1, // 적절한 기본값으로 설정
    };
    setRows([...rows, newRow]); // 기존 행 배열에 새로운 행 추가
  }

  return (
    <Box width={'80%'} mx={'auto'} mt={5}>
      <Button mb={3} colorScheme="red" disabled={selectedRows.size === 0} onClick={handleDeleteSelectedRows}>
        선택된 항목 삭제
      </Button>

      <Button mb={3} colorScheme="red" onClick={addNewRow}>
        새로운 행 추가
      </Button>

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
