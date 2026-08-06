import axiosInstance from '@/config/axios';
import { useState, useEffect, useMemo } from 'react';
import DisplaySettings from './DisplaySettings';
import { toast } from 'react-toastify';
import {
  Container,
  Flex,
  Heading,
  Button,
  Table,
  IconButton,
  Box,
  Skeleton,
  Stack,
  HStack,
  Text,
  Badge,
  Input,
  VStack,
} from '@chakra-ui/react';
import { Icon } from '@iconify-icon/react';

const LanguageManagement = () => {
  const [languages, setLanguages] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/languages/all`);
      setLanguages(response.data);
      toast.success('Languages fetched successfully!');
    } catch (err: any) {
      toast.error('Failed to fetch languages!');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLanguage = async (code: string) => {
    try {
      await axiosInstance.delete(`/languages/${code}`);
      await fetchLanguages();
      if (selectedLanguage?.code === code) {
        setSelectedLanguage(null);
        setIsEditing(false);
      }
      toast.success('Language deleted successfully!');
    } catch (err: any) {
      toast.error('Failed to delete language!');
    }
  };

  const handleEdit = (language: any) => {
    setIsEditing(true);
    setSelectedLanguage(language);
  };

  const handleDelete = (code: string) => {
    if (window.confirm(`Are you sure you want to delete language code "${code}"?`)) {
      deleteLanguage(code);
    }
  };

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return languages;
    const q = searchQuery.toLowerCase();
    return languages.filter(
      (lang) =>
        lang.code.toLowerCase().includes(q) ||
        lang.name.toLowerCase().includes(q)
    );
  }, [languages, searchQuery]);

  return (
    <Container overflow="auto" fluid py="4">
      <VStack gap="6" align="stretch">
        {/* Top Card: Configured Languages Directory */}
        <Box bg="white" p="5" rounded="xl" borderWidth="1px" borderColor="gray.200" shadow="xs">
          <Flex justify="space-between" align="center" mb="4" flexWrap="wrap" gap="3">
            <HStack gap="3">
              <Heading size="md" color="gray.900" fontWeight="bold">
                Configured Languages
              </Heading>
              <Badge colorPalette="blue" variant="subtle" size="sm">
                {languages.length} Total
              </Badge>
            </HStack>

            <HStack gap="3">
              <Input
                size="sm"
                placeholder="Search language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                w="240px"
                bg="white"
              />
              <Button
                size="sm"
                colorPalette="blue"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedLanguage(null);
                }}
              >
                <Icon icon="solar:add-circle-bold" />
                Add New Language
              </Button>
            </HStack>
          </Flex>

          {/* Languages Table */}
          {isLoading ? (
            <Stack gap="3" py="2">
              <Skeleton height="36px" borderRadius="lg" />
              <Skeleton height="48px" borderRadius="lg" />
            </Stack>
          ) : (
            <Box overflowX="auto" borderWidth="1px" borderColor="gray.200" rounded="lg">
              <Table.Root variant="outline" size="sm" interactive>
                <Table.Header bg="gray.50">
                  <Table.Row>
                    <Table.ColumnHeader>Language Code</Table.ColumnHeader>
                    <Table.ColumnHeader>Language Name</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredLanguages && filteredLanguages.length > 0 ? (
                    filteredLanguages.map((language) => {
                      const isSelected = selectedLanguage?.code === language.code;

                      return (
                        <Table.Row
                          key={language.code}
                          bg={isSelected ? "blue.50/70" : undefined}
                          _hover={{ bg: isSelected ? "blue.50" : "gray.50" }}
                        >
                          <Table.Cell fontWeight="bold" color="blue.700">
                            {language.code}
                          </Table.Cell>
                          <Table.Cell color="gray.900" fontWeight="medium">
                            {language.name}
                          </Table.Cell>
                          <Table.Cell>
                            {isSelected ? (
                              <Badge colorPalette="blue" variant="solid" size="sm">
                                Active Edit
                              </Badge>
                            ) : (
                              <Badge colorPalette="green" variant="subtle" size="sm">
                                Configured
                              </Badge>
                            )}
                          </Table.Cell>
                          <Table.Cell textAlign="right">
                            <HStack justify="flex-end" gap="2">
                              <Button
                                size="xs"
                                variant={isSelected ? "solid" : "outline"}
                                colorPalette="blue"
                                onClick={() => handleEdit(language)}
                              >
                                <Icon icon="solar:pen-bold" />
                                {isSelected ? "Editing" : "Edit Config"}
                              </Button>
                              <IconButton
                                aria-label="Delete Language"
                                size="xs"
                                variant="ghost"
                                colorPalette="red"
                                onClick={() => handleDelete(language.code)}
                              >
                                <Icon icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </HStack>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })
                  ) : (
                    <Table.Row>
                      <Table.Cell colSpan={4} textAlign="center" color="gray.500" py="6">
                        <Text fontSize="sm">No languages configured yet</Text>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
            </Box>
          )}
        </Box>

        {/* Main Display Settings Form below */}
        <DisplaySettings
          isEdit={isEditing}
          initialData={selectedLanguage}
          onOperationComplete={fetchLanguages}
        />
      </VStack>
    </Container>
  );
};

export default LanguageManagement;
