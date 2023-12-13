import React, { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import 'react-data-grid/lib/styles.css';
import DataGrid from 'react-data-grid';
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

  const columns = [
    { key: 'id', name: 'ID' },
    { key: 'email', name: 'Email' },
    { key: 'nickname', name: 'Nickname' },
    { key: 'role', name: 'Role' },
    { key: 'gender', name: 'Gender' }, // gender 추가
    { key: 'phoneNumber', name: 'Phone Number' }, // phoneNumber 추가
  ];

  function rowKeyGetter(row: Row) {
    return row.id;
  }

  return (
    <Box width={'80%'} mx={'auto'} mt={5}>
      <DataGrid columns={columns} rows={rows} rowKeyGetter={rowKeyGetter} />
    </Box>
  );
};

export default ReactDataGrid;
