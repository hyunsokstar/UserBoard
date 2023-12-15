import { Box } from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import DataGrid from 'react-data-grid';
import 'react-data-grid/lib/styles.css';

type IUserRow = {
    id: number;
    email: string;
    nickname: string;
    role: string;
    gender: string;
    phoneNumber: string;
    backEndLevel: number;
    frontEndLevel: number;
};

const sampleData = [
    {
        id: 1,
        email: "terecal1@daum.net",
        nickname: "tere1",
        role: 'frontend',
        gender: 'woman',
        phoneNumber: "01049038057",
        backEndLevel: 3,
        frontEndLevel: 2
    },
    {
        id: 2,
        email: "terecal2@daum.net",
        nickname: "tere2",
        role: 'frontend',
        gender: 'woman',
        phoneNumber: "01049038058",
        backEndLevel: 3,
        frontEndLevel: 2
    },
];

const HeaderFilter = () => {
    const [userRows, setUserRows] = useState<IUserRow[]>(sampleData);

    const columns = [
        { key: 'id', name: 'ID' },
        { key: 'email', name: 'Email' },
        { key: 'nickname', name: 'Nickname' },
        { key: 'role', name: 'Role' },
        { key: 'gender', name: 'Gender' },
        { key: 'backEndLevel', name: 'Backend Level' },
        { key: 'frontEndLevel', name: 'Frontend Level' }
    ];

    return (
        <Box width={"80%"} mt={3} mx={"auto"}>
            <DataGrid columns={columns} rows={userRows} />
        </Box>
    );
};

export default HeaderFilter;
