import { Box, Button, Card, CardHeader, CardRoot, Container, Flex, Group, Heading, HStack, IconButton, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { Avatar } from "./ui/avatar";
import { LuEllipsis, LuMenu, LuSearch } from "react-icons/lu";

export const HomeChakra = () => {
    return (
        <Flex overflow={'hidden'} direction={'column'} w={'100vw'} h={'100vh'}>
            <Box borderBottomWidth={0.2} h={'60px'} bg={{ _light: 'bg', _dark: 'bg.subtle' }}  >

            </Box>
            <Flex overflow={'hidden'} direction={'row'} flex={1}>
                <Box borderRightWidth={0.2} w={'220px'} bg={{ _light: 'bg', _dark: 'bg.subtle' }}  >

                </Box>

                <Box overflow={'auto'} bg={{ _light: 'bg.subtle', _dark: 'bg' }} flex={1} padding={'8'}   >

                    <Container maxW={'5xl'}>




                        <HStack>
                        <Heading size={'xl'}>Organizations</Heading>

                        </HStack>



                        

                        <SimpleGrid gap={'0'}  columns={{ base: 1, md: 2, lg: 1 }} >
                            {
                                Array.from({ length: 10 }).map((_, index) => (
                                    <Card.Root borderRadius={'xl'} size={'md'} mt={'3'}>
                            <Card.Body display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                <HStack gap={'3'} alignItems={'center'} >
                                    <Avatar
                                        variant="solid"
                                        colorPalette={'red'}
                                        name="Orange Travels"
                                        size="md"
                                        shape="full"
                                    />
                                    <Card.Title >
                                        <VStack gap={'0'} justifyContent={'start'} alignItems={'start'}>
                                            <Heading color={'gray.fg'} size={'md'}>Orange Travels Corporation</Heading>
                                            <Text fontWeight={'normal'} color={'gray.400'} textStyle={'xs'} >admin@orange.com</Text>
                                        </VStack>
                                    </Card.Title>
                                </HStack>
                                <Group>
                                    <Button minWidth={'20'} colorPalette={'purple'} size={'sm'} variant="surface">Edit</Button>
                                    {/* /<Button minWidth={'20'} colorPalette={'red'} size={'sm'} variant={'outline'}>Delete</Button> */}
                                    <IconButton variant={'outline'} size={'sm'} aria-label="Search database">
                                        <LuEllipsis />
                                    </IconButton>
                                </Group>
                            </Card.Body>
                        </Card.Root>
                                ))
                            }
                        </SimpleGrid>
                    </Container>





                </Box>
            </Flex >
        </Flex>
    );
};