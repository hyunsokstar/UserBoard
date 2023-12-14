// pages/index.tsx

import { Box, Text } from '@chakra-ui/react';
import Link from 'next/link';

const Home = () => {
    return (
        <Box width="50%" margin="auto" mt={5} border="0px solid red">
            <Box display="flex" flexDirection="column" border="0px solid green">
                {[
                    { href: '/users', text: '회원 관리 (기본)' },
                    { href: '/users/UserlistByDataGrid', text: '회원 관리(react-data-grid)' },
                    { href: '/users-by-rbd', text: '회원 관리(react-beautiful-dnd)' },
                    { href: '/chatting', text: '채팅' },
                    { href: '/payment', text: '결제' },
                ].map((link, index) => (
                    <Box
                        key={index}
                        as={Link}
                        href={link.href}
                        width="100%"
                        p={4}
                        my={2}
                        borderRadius="md"
                        bg="#1DA1F2"
                        color="white"
                        textAlign="center"
                        _hover={{ bg: '#0B7BC8' }}
                        cursor="pointer"
                    >
                        <Text>{link.text}</Text>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default Home;
