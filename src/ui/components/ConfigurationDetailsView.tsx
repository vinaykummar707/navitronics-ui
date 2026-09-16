"use client";
/*
 * Documentation:
 * ConfigurationDetailsView — https://app.subframe.com/11b10bc240cf/library?component=ConfigurationDetailsView_7c79be72-c327-4b10-b7e8-d9abc7e47c15
 * LanguageDetailsPanel — https://app.subframe.com/11b10bc240cf/library?component=LanguageDetailsPanel_6d1eb0b2-d3f5-49cc-93bf-dc4019d9c358
 * OptionsDropdown — https://app.subframe.com/11b10bc240cf/library?component=OptionsDropdown_bc577ea2-ce5e-4b95-8b05-1eab56f8b728
 * TextDetailsCard — https://app.subframe.com/11b10bc240cf/library?component=TextDetailsCard_2a4b614e-de93-452a-ae4f-11b677c52738
 */

import React from "react";
import { FeatherAlignLeft } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { LanguageDetailsPanel } from "./LanguageDetailsPanel";
import { OptionsDropdown } from "./OptionsDropdown";
import { TextDetailsCard } from "./TextDetailsCard";
import { ITextConfig } from "@/types/ITextConfig";
import { LanguageItem } from "./LanguageItem";

interface ConfigurationDetailsViewRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  sidebarTitle?: React.ReactNode;
  sidebarDescription?: React.ReactNode;
  configurationList?: React.ReactNode;
  languageName?: React.ReactNode;
  className?: string;
  fontSettings?: ITextConfig[];
  onEditConfig?: (config: ITextConfig) => void;
  onDeleteConfig?: (configId: string) => void;
}

const ConfigurationDetailsViewRoot = React.forwardRef<
  HTMLDivElement,
  ConfigurationDetailsViewRootProps
>(function ConfigurationDetailsViewRoot(
  {
    sidebarTitle,
    sidebarDescription,
    configurationList,
    languageName,
    className,
    fontSettings,
    onEditConfig,
    onDeleteConfig,
    ...otherProps
  }: ConfigurationDetailsViewRootProps,
  ref
) {

  const [selectedConfig, setSelectedConfig] = React.useState<ITextConfig>(null);

   React.useEffect(() => {
    if (fontSettings && fontSettings.length > 0) {
      setSelectedConfig(fontSettings[0]);
    } else {
      setSelectedConfig(null);
    }
  }, [fontSettings]);


  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-full flex-col md:flex-row items-start rounded-md border border-solid border-neutral-border bg-neutral-50 overflow-hidden",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full md:w-64 flex-none flex-col items-start gap-4 self-stretch border-b md:border-b-0 md:border-r border-solid border-neutral-border px-4 py-4 overflow-hidden">
        <div className="flex w-full flex-col items-start gap-2">
          {sidebarTitle ? (
            <span className="text-heading-3 md:text-heading-2 font-heading-2 text-default-font">
              {sidebarTitle}
            </span>
          ) : null}
          {sidebarDescription ? (
            <span className="text-caption font-caption text-subtext-color">
              {sidebarDescription}
            </span>
          ) : null}
        </div>
       
          <div className="flex w-full flex-row md:flex-col items-start gap-1 overflow-x-auto md:overflow-y-auto touch-scroll-x py-1">
            {fontSettings && fontSettings.map((setting) => (
            <LanguageItem className={`${selectedConfig?.id !== setting.id && "bg-neutral-50"} cursor-pointer flex-none md:w-full`} onClick={() => setSelectedConfig(setting)} key={setting.id} language={setting.name} code={setting.code} />
          ))}
          </div>
        
      </div>
       {selectedConfig && <LanguageDetailsPanel
        className="w-full flex-1 overflow-y-auto p-3 sm:p-4"
        languageName={languageName}
        optionsMenu={<OptionsDropdown onEdit={() => onEditConfig && onEditConfig(selectedConfig)} onDelete={() => {
          setSelectedConfig(null);
          onDeleteConfig && onDeleteConfig(selectedConfig?.id)}} />}
        detailsCards={
          <>
            {Object.keys(selectedConfig?.config || {}).map((key) => (
              <TextDetailsCard
              
                key={key}
                icon={<FeatherAlignLeft />}
                title={key}
                items={
                  <>
                    <div className="flex w-full items-center justify-between py-2">
                    <span className="text-caption font-body text-subtext-color">
                      Font Height
                    </span>
                    <span className="text-caption font-body text-default-font">
                      {selectedConfig?.config[key].fontHeight}
                    </span>
                  </div>
                  <div className="flex w-full items-center justify-between py-2">
                    <span className="text-caption font-body text-subtext-color">
                      Font Family 8
                    </span>
                    <span className="text-caption font-body text-default-font">
                      {selectedConfig?.config[key].fontFamily8}
                    </span>
                  </div>
                  <div className="flex w-full items-center justify-between py-2">
                    <span className="text-caption font-body text-subtext-color">
                      Font Family 16
                    </span>
                    <span className="text-caption font-body text-default-font">
                      {selectedConfig?.config[key].fontFamily16}
                    </span>
                  </div>
                  <div className="flex w-full items-center justify-between py-2">
                    <span className="text-caption font-body text-subtext-color">
                      Font Family 32
                    </span>
                    <span className="text-caption font-body text-default-font">
                      {selectedConfig?.config[key].fontFamily32}
                    </span>
                  </div>
                </>
              }
            />))}
           
          </>
        }
      />}
    </div>
  );
});

export const ConfigurationDetailsView = ConfigurationDetailsViewRoot;
