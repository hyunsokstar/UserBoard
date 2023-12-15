import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Center, Checkbox, Spacer } from '@chakra-ui/react';
import 'react-data-grid/lib/styles.css';
import DataGrid, { Column, RenderCellProps, RenderCheckboxProps, RenderEditCellProps, RenderHeaderCellProps, RenderSortStatusProps, SelectCellFormatter, SortColumn, useRowSelection } from 'react-data-grid';
import { apiForGetAllUsers } from '../api/apiForUserBoard';
import { useQuery } from '@tanstack/react-query';
import styles from './styles.module.scss';
import { Direction, ITypeForResponseDataForGetAllUsers, IUser, Row } from '@/types/typeForUserBoard';
import { SelectColumnForRdg } from '@/components/Formatter/CheckBox/SelectColumnForRdg';
import TextEditorForDevLevel from '@/components/GridEditor/TextEditor/TextEditorForDevLevel';
import { v4 as uuidv4 } from 'uuid';
import { ArrowForwardIcon, DeleteIcon, EmailIcon } from '@chakra-ui/icons';
import SelectBoxForGender from '@/components/GridEditor/SelectBox/SelectBoxForGender';
import SelectBoxForDevRole from '@/components/GridEditor/SelectBox/SelectBoxForDevRole';
import TextEditorForPhoneNumber from '@/components/GridEditor/TextEditor/TextEditorForPhoneNumber';


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

const UserlistByDataGrid = () => {
  const [rows, setRows] = useState<IUser[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [selectedRows, setSelectedRows] = useState((): ReadonlySet<number> => new Set());
  const [direction, setDirection] = useState<Direction>('ltr');
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);

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
    const updatedRows = rows.filter((row: any) => !selectedRows.has(row.id));
    setRows(updatedRows);
    setSelectedRows(new Set());
  }

  function rowKeyGetter(row: Row) {
    return row.id;
  }

  function generateRandomId(): number {
    const now = new Date();
    const minute = now.getMinutes(); // 현재 분
    const second = now.getSeconds(); // 현재 초

    // 분과 초를 조합하여 랜덤 아이디 생성
    return parseInt(`${minute}${second}${Math.floor(Math.random() * 10000)}`);
  }

  // function addNewRow() {
  //   const newRow: IUser = {
  //     id: generateRandomId(),
  //     email: '', // 빈 문자열 또는 기본값으로 설정
  //     nickname: '',
  //     role: '',
  //     gender: '',
  //     phoneNumber: '',
  //     frontEndLevel: 1, // 적절한 기본값으로 설정
  //     backEndLevel: 1, // 적절한 기본값으로 설정
  //   };
  //   setRows([...rows, newRow]); // 기존 행 배열에 새로운 행 추가
  // }

  function handleSaveSelectedRows() {
    // 선택된 행들의 데이터를 가져와서 새로운 배열에 저장
    const selectedRowsData = rows.filter(row => selectedRows.has(row.id));

    console.log("selectedRowsData : ", selectedRowsData);

    // 서버로 보내는 로직
    // 예를 들어, axios를 사용한 POST 요청으로 보낸다고 가정하면:
    // axios.post('/save-selected-rows', { selectedRowsData })
    //   .then(response => {
    //     // 성공적으로 저장되었을 때의 처리
    //     console.log('선택된 행들이 저장되었습니다.');
    //   })
    //   .catch(error => {
    //     // 저장 중 오류 발생 시의 처리
    //     console.error('행을 저장하는 중 오류가 발생했습니다:', error);
    //   });
  }

  return (
    <Box width={'80%'} mx={'auto'} mt={5}>
      {/* <Button mb={3} colorScheme="red" disabled={selectedRows.size === 0} onClick={handleDeleteSelectedRows}>
        선택된 항목 삭제
      </Button>

      <Button mb={3} ml={3} colorScheme="red" onClick={addNewRow}>
        새로운 행 추가
      </Button>

      <Button mb={3} ml={3} colorScheme="green" disabled={selectedRows.size === 0} onClick={handleSaveSelectedRows}>
        선택된 항목 저장
      </Button> */}

      <Box display={"flex"} justifyContent={"space-between"} mt={3} mx={"auto"} gap={2}>
        <Button
          size='sm'
          flex={0.2}
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
        <Button size='sm' variant='outline' rightIcon={<ArrowForwardIcon />} flex={0.2} disabled={selectedRows.size === 0} onClick={handleSaveSelectedRows} >
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
        // topSummaryRows={summaryRows}
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
