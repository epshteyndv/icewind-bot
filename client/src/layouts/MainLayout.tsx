import {Outlet} from "react-router";
import {Box, Button, Flex, HStack} from "@chakra-ui/react";
import {useColorModeValue} from "@/components/ui/color-mode.tsx";
import {useMutation} from "@tanstack/react-query";
import {articlesApi} from "@/features/articles/api.ts";

export function MainLayout() {
  const mutation = useMutation({
    mutationFn: articlesApi.create,
  });

  const updateArticles = () => {
    mutation.mutate();
  }

  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <HStack alignItems={'center'}>
            <HStack as={'nav'} display={{base: 'none', md: 'flex'}}>
              <Button asChild>
                <a href="/logs">Логи</a>
              </Button>

              <Button asChild>
                <a href="/logs/create">Новый лог</a>
              </Button>

              <Button asChild>
                <a href="/articles">Статьи</a>
              </Button>

              <Button onClick={updateArticles}>Обновить статьи</Button>
            </HStack>
          </HStack>
        </Flex>
      </Box>

      <Box p={4} as="main">
        <Outlet/>
      </Box>
    </>
  )
}