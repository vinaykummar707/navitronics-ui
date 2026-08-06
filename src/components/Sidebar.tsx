import { Link, useLocation, useNavigate } from 'react-router-dom';
import { OrganizationSelector } from './common/OrganizationSelector';
import useAuthStore from '@/store/authStore';
import RBAC from './RBAC';
import { ROLES } from '../constants/roles';
import { Icon } from '@iconify-icon/react';
import { Box, Flex, VStack, HStack, Text, Button, Image } from '@chakra-ui/react';

const Sidebar = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const navItems = [
    {
      label: 'Organizations',
      path: '/home/organizations',
      icon: 'solar:buildings-bold-duotone',
      roles: [ROLES.ORGANIZATION_ADMIN, ROLES.MASTER],
    },
    {
      label: 'Areas',
      path: '/home/areas',
      icon: 'solar:map-bold-duotone',
      roles: [ROLES.AREA_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.MASTER],
    },
    {
      label: 'Depots',
      path: '/home/depots',
      icon: 'solar:buildings-2-bold-duotone',
      roles: [ROLES.DEPOT_ADMIN, ROLES.AREA_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.MASTER],
    },
    {
      label: 'Routes',
      path: '/home/routes',
      icon: 'solar:routing-bold-duotone',
      roles: null,
    },
    {
      label: 'Roles',
      path: '/home/roles',
      icon: 'solar:shield-user-bold-duotone',
      roles: [ROLES.MASTER],
    },
    {
      label: 'Users',
      path: '/home/users',
      icon: 'solar:users-group-two-rounded-bold-duotone',
      roles: [ROLES.ORGANIZATION_ADMIN, ROLES.MASTER],
    },
    {
      label: 'Fonts',
      path: '/home/fonts',
      icon: 'solar:text-square-bold-duotone',
      roles: [ROLES.MASTER],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      as="aside"
      w="64"
      bg="white"
      borderRightWidth=""
      borderColor="gray.200"
      h="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      flexShrink={0}
      userSelect="none"
      shadow="xs"
    >
      {/* Top Branding & Navigation */}
      <VStack gap="5" p="4" align="stretch" overflowY="auto">
        {/* Brand Header */}
        <Link to="/home" style={{ textDecoration: 'none' }}>
          <HStack gap="3" px="2" py="1">
            <Image
              src="/assets/navitronix.jpeg"
              alt="Navitronix Logo"
              boxSize="10"
              objectFit="contain"
              rounded="lg"
              borderWidth="1px"
              borderColor="gray.100"
            />
            <VStack align="flex-start" gap="0">
              <Text fontSize="md" fontWeight="bold" color="gray.900" letterSpacing="tight">
                NAVITRONIX
              </Text>
              <Text fontSize="2xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                PIS Module
              </Text>
            </VStack>
          </HStack>
        </Link>

        {/* Organization Selector Container */}
        <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" rounded="lg" p="2">
          <VStack align="stretch" gap="1.5">
            <HStack gap="1.5" color="gray.500" fontSize="2xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
              <Icon icon="solar:building-3-bold" fontSize="14px" />
              <Text as="span">Organization</Text>
            </HStack>
            <OrganizationSelector />
          </VStack>
        </Box>

        {/* Navigation Section */}
        <VStack align="stretch" gap="1">
          <Text fontSize="2xs" fontWeight="semibold" color="gray.400" textTransform="uppercase" letterSpacing="wider" px="3" mb="1">
            Navigation Menu
          </Text>

          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path.split('/home/')[1]);

            const linkElement = (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <HStack
                  gap="3"
                  px="3"
                  py="2.5"
                  rounded="lg"
                  fontSize="sm"
                  fontWeight={isActive ? "semibold" : "medium"}
                  bg={isActive ? "blue.600" : "transparent"}
                  color={isActive ? "white" : "gray.600"}
                  _hover={{
                    bg: isActive ? "blue.600" : "gray.100",
                    color: isActive ? "white" : "gray.900",
                  }}
                  transition="all 0.15s ease-in-out"
                >
                  <Icon
                    icon={item.icon}
                    style={{ fontSize: '18px', color: isActive ? 'white' : '#94a3b8' }}
                  />
                  <Text>{item.label}</Text>
                </HStack>
              </Link>
            );

            if (item.roles) {
              return (
                <RBAC key={item.path} roles={item.roles}>
                  {linkElement}
                </RBAC>
              );
            }

            return linkElement;
          })}
        </VStack>
      </VStack>

      {/* Bottom User Profile & Logout Section */}
      <VStack p="4" borderTopWidth="1px" borderColor="gray.100" bg="gray.50" gap="3" align="stretch">
        {/* User Badge */}
        <HStack gap="3" px="3" py="2" bg="white" borderWidth="1px" borderColor="gray.200" rounded="lg">
          <Flex
            boxSize="8"
            rounded="full"
            bg="blue.50"
            borderWidth="1px"
            borderColor="blue.200"
            align="center"
            justify="center"
            color="blue.700"
            fontWeight="bold"
            fontSize="xs"
            flexShrink={0}
          >
            {user?.userName ? user.userName.charAt(0).toUpperCase() : 'U'}
          </Flex>
          <VStack align="flex-start" gap="0" overflow="hidden" flex="1">
            <Text fontSize="xs" fontWeight="semibold" color="gray.800" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap" w="full">
              {user?.userName || 'User'}
            </Text>
            <Text fontSize="2xs" fontWeight="medium" color="gray.500" textTransform="uppercase" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap" w="full">
              {user?.userRole || 'Role'}
            </Text>
          </VStack>
        </HStack>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          size="sm"
          colorPalette="gray"
          variant="solid"
          w="full"
          justifyContent="center"
          gap="2"
        >
          <Icon icon="solar:logout-3-bold" fontSize="16px" />
          <Text fontSize="xs" fontWeight="semibold">Logout</Text>
        </Button>
      </VStack>
    </Box>
  );
};

export default Sidebar;
