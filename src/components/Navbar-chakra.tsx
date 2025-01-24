import { Box, Button, Card, CardHeader, CardRoot, Container, Flex, Group, Heading, HStack, IconButton, Link, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { Avatar } from "./ui/avatar";
import { LuEllipsis, LuMenu, LuSearch } from "react-icons/lu";
import { Icon } from '@iconify-icon/react';
import { useLocation, useNavigation } from "react-router-dom";
import { Tabs } from "@chakra-ui/react"

export const HomeChakra = () => {


    const sideBarNavLinks = [
        {
            name: 'Organizations',
            icon: 'solar:widget-bold-duotone',
            navLink: '/organizations'
        },
        {
            name: 'Areas',
            icon: 'solar:streets-map-point-bold-duotone',
            navLink: '/areas'
        },
        {
            name: 'Depots',
            icon: 'solar:map-point-wave-bold-duotone',
            navLink: '/depots'
        },
        {
            name: 'Routes',
            icon: 'solar:route-bold-duotone',
            navLink: '/routes'
        },
        {
            name: 'Users',
            icon: 'solar:user-bold-duotone',
            navLink: '/users'
        },
        {
            name: 'Roles',
            icon: 'solar:lock-password-bold-duotone',
            navLink: '/roles'
        },
        {
            name: 'Settings',
            icon: 'solar:settings-bold-duotone',
            navLink: '/settings'
        },
    ]

    return (
        <Flex overflow={'hidden'} direction={'column'} w={'100vw'} h={'100vh'}>
            <Box borderBottomWidth={0.2} h={'50px'} bg={{ _light: 'bg', _dark: 'bg.subtle' }}  >

            </Box>
            <Box borderBottomWidth={0.2} bg={{ _light: 'bg', _dark: 'bg.subtle' }}  >
               <Container maxW={'6xl'}>
               <Tabs.Root h={'50px'} defaultValue="members">
                    <Tabs.List h={'50px'}>
                    <Tabs.Trigger value="members" asChild>
          <Link unstyled href="#members">
            Members
          </Link>
        </Tabs.Trigger>
                        <Tabs.Trigger h={'50px'} value="projects">
                            Projects
                        </Tabs.Trigger>
                        <Tabs.Trigger h={'50px'} value="tasks">
                            Settings
                        </Tabs.Trigger>
                    </Tabs.List>
                </Tabs.Root>
               </Container>
            </Box>
            <Flex overflow={'hidden'} direction={'row'} flex={1}>
                {/* <Box borderRightWidth={0.2} paddingY={'4'} paddingX={'3'} w={'240px'} bg={{ _light: 'bg', _dark: 'bg.subtle' }}  >

                    <VStack gap={1} >
                        {/* <HStack w={'100%'}   bg={{_light: 'purple', _dark: 'purple' }} paddingY={2} paddingX={"4"} borderRadius={'md'}>
                           <Icon width={20}  height={20} style={{ color: 'white' }} icon={'solar:widget-bold-duotone'}/> <Text color={'white'} textStyle={'sm'}>Organizations</Text>
                        </HStack>
                        <HStack w={'100%'} bg={{_hover: 'bg.muted'}}   paddingY={2} paddingX={"4"} borderRadius={'md'}>
                           <Icon width={20} height={20} icon={'solar:streets-map-point-bold-duotone'}/> <Text textStyle={'sm'}>Areas   </Text>
                        </HStack> 
                        {
                            sideBarNavLinks.map((item, index) => (
                                <HStack key={index} w={'100%'} bg={{ _hover: 'bg.muted', _light: index==0 && 'purple.muted' }} paddingY={2} paddingX={"4"} borderRadius={'md'}>
                                    <Icon width={20} height={20} icon={item.icon} /> <Text textStyle={'sm'}>{item.name}</Text>
                                </HStack>
                            ))
                        }
                    </VStack>

                </Box> */}

                <Box overflow={'auto'} bg={{ _light: 'bg.subtle', _dark: 'bg' }} flex={1} padding={'8'}   >

                    {/* <Container maxW={'5xl'}>




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
                                            <Heading color={'stone.fg'} size={'md'}>Orange Travels Corporation</Heading>
                                            <Text fontWeight={'normal'} color={'stone.400'} textStyle={'xs'} >admin@orange.com</Text>
                                        </VStack>
                                    </Card.Title>
                                </HStack>
                                <Group>
                                    <Button minWidth={'20'} colorPalette={'purple'} size={'sm'} variant="surface">Edit</Button>
                                    {/* /<Button minWidth={'20'} colorPalette={'red'} size={'sm'} variant={'outline'}>Delete</Button> 
                                    <IconButton variant={'outline'} size={'sm'} aria-label="Search database">
                                        <LuEllipsis />
                                    </IconButton>
                                </Group>
                            </Card.Body>
                        </Card.Root>
                                ))
                            }
                        </SimpleGrid>
                    </Container> */}





                </Box>
            </Flex >
        </Flex>
    );
};