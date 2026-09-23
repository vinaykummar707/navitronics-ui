import FontSettingsDrawerWrapper from "@/components/FontSettingsDrawerWrapper";
import RBACPage from "@/components/RBACPage";
import { fontSettingsCrud, ITextConfig } from "@/types/ITextConfig";
import { Button, Drawer } from "@/ui";
import { ConfigurationDetailsView } from "@/ui/components/ConfigurationDetailsView";
import { LanguageItem } from "@/ui/components/LanguageItem";
import { FeatherPlus, FeatherRefreshCw } from "@subframe/core";
import React from "react";
import { toast } from "react-toastify";
import { sortByLatestCreated } from "@/utils/dateUtils";

const QUERY_OPTIONS = {
  orderBy: { column: "created_at", ascending: false },
};

export default function FontConfigurationPage() {
  const [showDrawer, setShowDrawer] = React.useState(false);
  const [editData, setEditData] = React.useState<ITextConfig>(null);
  const { data, refetch: refetchFontSettings } = fontSettingsCrud.useList(QUERY_OPTIONS);
  const { mutate: deleteFontSetting } = fontSettingsCrud.useDelete();

  const fontSettings = React.useMemo(() => {
    if (!data?.data) return [];
    const list = (data.data as ITextConfig[]).map((item) => ({
      ...item,
      config:
        typeof item.config === "string"
          ? JSON.parse(item.config)
          : item.config,
    }));
    return sortByLatestCreated(list);
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
      <div className="flex h-full w-full flex-col items-start gap-6 ">
        <div className="flex w-full flex-col items-start gap-1">
          <span className="w-full text-heading-2 font-heading-2 text-default-font">
            Font Configuration
          </span>
          <span className="text-body font-body text-subtext-color">
            Manage system font settings and language mappings (Super Admin only)
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
          <span className="text-caption font-caption text-subtext-color">
            Showing {fontSettings.length || 0} records
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="neutral-secondary"
              className="flex-1 sm:flex-none"
              icon={<FeatherRefreshCw />}
              onClick={async () => {
                try {
                  await refetchFontSettings();
                  toast.success("Refreshed font settings");
                } catch (err: any) {
                  toast.error(`Failed to refresh font settings: ${err.message || "Unknown error"}`);
                }
              }}
            >
              Refresh
            </Button>
            <Button
              className="flex-1 sm:flex-none"
              icon={<FeatherPlus />}
              onClick={() => {
                setShowDrawer(true);
                setEditData(null);
              }}
            >
              Add Language Setting
            </Button>
          </div>
        </div>

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
      </div>
    </RBACPage>
  );
}
