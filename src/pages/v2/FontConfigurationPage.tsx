import FontSettingsDrawerWrapper from "@/components/FontSettingsDrawerWrapper";
import RBACPage from "@/components/RBACPage";
import { fontSettingsCrud, ITextConfig } from "@/types/ITextConfig";
import { Button, Drawer } from "@/ui";
import { ConfigurationDetailsView } from "@/ui/components/ConfigurationDetailsView";
import { LanguageItem } from "@/ui/components/LanguageItem";
import { FeatherPlus, FeatherRefreshCw } from "@subframe/core";
import React from "react";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import { Box, HStack } from "@chakra-ui/react";

const QUERY_OPTIONS = { filters: { deleted: false } };

export default function FontConfigurationPage() {
  const [showDrawer, setShowDrawer] = React.useState(false);
  const [editData, setEditData] = React.useState<ITextConfig>(null);
  const { data, refetch: refetchFontSettings } = fontSettingsCrud.useList(QUERY_OPTIONS);
  const { mutate: deleteFontSetting } = fontSettingsCrud.useDelete();

  const fontSettings = React.useMemo(() => {
    if (!data?.data) return [];
    return (data.data as ITextConfig[]).map((item) => ({
      ...item,
      config:
        typeof item.config === "string"
          ? JSON.parse(item.config)
          : item.config,
    }));
  }, [data]);

  const handleDelete = React.useCallback(
    (id: string) => {
      deleteFontSetting(id, {
        onSuccess: () => {
          toast.success("Font configuration deleted successfully");
          refetchFontSettings();
        },
        onError: (error) => {
          toast.error(`Failed to delete font configuration: ${error.message}`);
        },
      });
    },
    [deleteFontSetting, refetchFontSettings]
  );

  return (
    <RBACPage roles={["master"]} features={[]}>
      <Box w="full" mb="4">
        <PageHeader
          title="Font & Language Configurations"
          description="Manage system font settings, LED matrix typography, and Indic script language mappings (Super Admin only)."
          breadcrumbs={[
            { label: "Home", href: "/home" },
            { label: "Font Configuration" },
          ]}
          badge={`${fontSettings.length || 0} Records`}
          badgeColorPalette="blue"
          actions={
            <HStack gap="2">
              <Button
                variant="neutral-secondary"
                icon={<FeatherRefreshCw />}
                onClick={() => {
                  toast.success("Refreshed font settings");
                  refetchFontSettings();
                }}
              >
                Refresh
              </Button>
              <Button
                icon={<FeatherPlus />}
                onClick={() => {
                  setShowDrawer(true);
                  setEditData(null);
                }}
              >
                Add Language Setting
              </Button>
            </HStack>
          }
        />
      </Box>

        <ConfigurationDetailsView
          sidebarTitle="Configurations"
          sidebarDescription="Select a configuration to view details"
          fontSettings={fontSettings}
          onEditConfig={(config) => {
            setEditData(config);
            setShowDrawer(true);
          }}
          onDeleteConfig={(configId) => {
            handleDelete(configId);
          }}
        />

        <Drawer open={showDrawer} onOpenChange={(open) => setShowDrawer(open)}>
          <Drawer.Content>
            <FontSettingsDrawerWrapper
              initialData={editData}
              onSuccess={() => {
                setShowDrawer(false);
                refetchFontSettings();
              }}
              onCancel={() => {
                setShowDrawer(false);
              }}
            />
          </Drawer.Content>
        </Drawer>
    </RBACPage>
  );
}
