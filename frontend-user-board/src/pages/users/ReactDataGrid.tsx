import React, { useState, useEffect } from 'react';
import { Box, Center, Checkbox } from '@chakra-ui/react';
import 'react-data-grid/lib/styles.css';
import DataGrid, { Column, RenderCellProps, RenderHeaderCellProps, SelectCellFormatter, useRowSelection } from 'react-data-grid';
import { apiForGetAllUsers } from '../api/apiForUserBoard';
import { useQuery } from '@tanstack/react-query';

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
  { key: 'email', name: 'Email' },
  { key: 'nickname', name: 'Nickname' },
  { key: 'role', name: 'Role' },
  { key: 'gender', name: 'Gender' }, // gender 추가
  { key: 'phoneNumber', name: 'Phone Number' }, // phoneNumber 추가
];

type Row = {
  id: number;
  email: string;
  nickname: string;
  role: string;
  gender: string;
  phoneNumber: string | null;
};

const ReactDataGrid = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [selectedRows, setSelectedRows] = useState((): ReadonlySet<number> => new Set());

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

      <DataGrid
        columns={columns}
        rows={rows}
        rowKeyGetter={rowKeyGetter}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        onRowsChange={setRows}
        className="fill-grid"
      />
    </Box>
  );
};

export default ReactDataGrid;
