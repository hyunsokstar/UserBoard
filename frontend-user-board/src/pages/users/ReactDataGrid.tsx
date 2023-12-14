import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Center, Checkbox } from '@chakra-ui/react';
import 'react-data-grid/lib/styles.css';
import DataGrid, { Column, RenderCellProps, RenderCheckboxProps, RenderEditCellProps, RenderHeaderCellProps, RenderSortStatusProps, SelectCellFormatter, SortColumn, useRowSelection } from 'react-data-grid';
import { apiForGetAllUsers } from '../api/apiForUserBoard';
import { useQuery } from '@tanstack/react-query';
import styles from './styles.module.scss';

type User = {
  id: number;
  email: string;
  password: string;
  nickname: string;
  role: string;
  gender: string;
  phoneNumber: string | null;
};

type UserBoardData = {
  users: User[];
  totalCount: number;
  perPage: number;
};

function autoFocusAndSelect(input: HTMLInputElement | null) {
  input?.focus();
  input?.select();
}

function textEditor<TRow, TSummaryRow>({
  row,
  column,
  onRowChange,
  onClose
}: RenderEditCellProps<TRow, TSummaryRow>) {

  const [isFocused, setIsFocused] = useState(false);

  const inputStyle: React.CSSProperties = {
    appearance: 'none',
    boxSizing: 'border-box',
    inlineSize: '100%',
    blockSize: '100%',
    paddingBlock: 0,
    paddingInline: 6,
    border: '2px solid #ccc',
    verticalAlign: 'top',
    color: 'var(--rdg-color)',
    backgroundColor: 'var(--rdg-background-color)',
    fontFamily: 'inherit',
    fontSize: 'var(--rdg-font-size)',
    outline: 'none',
  };


  if (isFocused) {
    inputStyle.borderColor = 'var(--rdg-selection-color)';
  }

  return (
    <input
      ref={autoFocusAndSelect}
      value={row[column.key as keyof TRow] as unknown as string}
      onChange={(event) => onRowChange({ ...row, [column.key]: event.target.value })}
      onBlur={() => onClose(true, false)}
      className={styles.inputStyle} // styles 객체에서 해당 클래스를 가져와서 적용
    />
  );
}


function HeaderRenderer(props: RenderHeaderCellProps<unknown>) {
  const [isRowSelected, onRowSelectionChange] = useRowSelection();

  return (
    <SelectCellFormatter
      aria-label="Select All"
      tabIndex={props.tabIndex}
      value={isRowSelected}
      onChange={(checked) => {
        onRowSelectionChange({ type: 'HEADER', checked });
      }}
    />
  );
}

function SelectFormatter(props: RenderCellProps<unknown>) {
  const [isRowSelected, onRowSelectionChange] = useRowSelection();

  return (
    <SelectCellFormatter
      aria-label="Select"
      tabIndex={props.tabIndex}
      value={isRowSelected}
      onChange={(checked, isShiftClick) => {
        onRowSelectionChange({ type: 'ROW', row: props.row, checked, isShiftClick });
      }}

    />
  );
}

export const SelectColumn: Column<any, any> = {
  key: "select-row",
  name: '',
  width: 35,
  minWidth: 35,
  maxWidth: 35,
  resizable: false,
  sortable: false,
  frozen: true,
  renderHeaderCell(props) {
    return <HeaderRenderer {...props} />;
  },
  renderCell(props) {
    return <SelectFormatter {...props} />;
  },
};

const columns = [
  // { key: 'id', name: 'ID' },
  SelectColumn,
  { key: 'email', name: 'Email', sortable: true },
  { key: 'nickname', name: 'Nickname' },
  { key: 'role', name: 'Role' },
  { key: 'gender', name: 'Gender' }, // gender 추가
  {
    key: 'phoneNumber', name: 'Phone Number',
    // frozen: true,
    renderEditCell: textEditor,
  }, // phoneNumber 추가
];

type Row = {
  id: number;
  email: string;
  nickname: string;
  role: string;
  gender: string;
  phoneNumber: string | null;
};

export type Direction = 'ltr' | 'rtl';

const ReactDataGrid = () => {
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

  const { isLoading, error, data: dataForUserBoard } = useQuery<UserBoardData>({
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

  return (
    <Box width={'80%'} mx={'auto'} mt={5}>

      <Box mb={4}>
        <p>선택된 행의 ID:</p>
        <ul>
          {Array.from(selectedRows).map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </Box>

      <Button mb={3} colorScheme="red" disabled={selectedRows.size === 0} onClick={handleDeleteSelectedRows}>
        선택된 항목 삭제
      </Button>

      <DataGrid
        // className={styles.gridStyle}
        columns={columns}
        sortColumns={sortColumns}

        onSortColumnsChange={setSortColumns}

        // rows={rows}
        rows={sortedRows}

        rowKeyGetter={rowKeyGetter}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        onRowsChange={setRows}
        direction={direction}
        renderers={{ renderSortStatus, renderCheckbox }}
        className="fill-grid"
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

export default ReactDataGrid;
