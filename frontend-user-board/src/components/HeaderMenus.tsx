import React from "react";
import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import { FiLogOut } from "react-icons/fi"; // 로그아웃 아이콘 사용 예시
import ModalButtonForLogin from "./Modal/ModalButtonForLogin";
import useUser from "@/hooks/useUser";
import ModalButtonForAddUser from "./Modal/ModalButtonForAddUser";

const HeaderMenus = () => {
    const { isLoggedIn, loginUser, logout } = useUser();

    return (
        <Flex
            justifyContent="space-between"
            alignItems="center"
            width="80%"
            height="60px"
            bg="ButtonFace"
            color="black"
            mx="auto"
            mt={2}
            px={5}
            borderRadius="md"
            boxShadow="0 2px 4px 0 rgba(0, 0, 0, 0.1)"
        >
            <Box>
                <Heading size="lg">
                    <Link href="/" color="#4267B2" _hover={{ textDecoration: "none" }}>
                        UserBoard
                    </Link>
                </Heading>
            </Box>
            {isLoggedIn ? (
                <Flex alignItems="center">
                    <Box fontSize="sm" fontWeight="bold">
                        {`안녕하세요, ${loginUser.email}님`}
                    </Box>
                    <Button
                        variant="outline"
                        size="sm"
                        colorScheme="blue"
                        borderColor="#4267B2"
                        leftIcon={<FiLogOut />}
                        ml={2}
                        onClick={logout} // 로그아웃 함수 연결
                    >
                        로그아웃
                    </Button>
                </Flex>
            ) : (
                <Box display={"flex"} gap={2}>
                    <ModalButtonForLogin buttonText="로그인" />
                    <ModalButtonForAddUser buttonText={'회원 가입'} />
                </Box>
            )}
        </Flex>
    );
};

export default HeaderMenus;
