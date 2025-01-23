import { Box, Card, CardHeader, CardRoot, Container, Flex, Heading, HStack, SimpleGrid, VStack } from "@chakra-ui/react";

export const HomeChakra = () => {
    return (
        <Flex overflow={'hidden'} direction={'column'}  w={'100vw'} h={'100vh'}>
            <Box borderBottomWidth={0.2}   h={'60px'} bg={{_light: 'bg', _dark: 'bg.subtle'}}  >

        </Box>
            <Flex overflow={'hidden'} direction={'row'} flex={1}>
                {/* <Box borderRightWidth={0.2} w={'230px'} bg={{_light: 'bg', _dark: 'bg.subtle'}}  >

                </Box> */}

                <Box overflow={'auto'} bg={{_light: 'bg.subtle', _dark: 'bg'}} flex={1} padding={'8'}   >

                    <Container  maxW={'6xl'}>
                        {/* <Heading size={'xl'}>Organizations</Heading> */}
                        <SimpleGrid gap={'2'} columns={{ base: 1, md: 2, lg: 4 }} >
                     {
                        Array.from({ length: 5 }).map((_, index) => (
                            <CardRoot padding={'8'} key={index}>
                                    <Heading size="md">Card {index + 1}</Heading>
                            </CardRoot>
                        ))
                     }
                        </SimpleGrid>
                    </Container>

                  



                </Box>
            </Flex >
        </Flex>
    );
};