"use client";

import React from "react";
import { Button } from "@/ui/components/Button";
import { TextField } from "@/ui/components/TextField";
import { FeatherSave, FeatherType } from "@subframe/core";
import { FontConfigDrawer } from "@/ui/components/FontConfigDrawer";
import { ControlAccordion } from "@/ui/components/ControlAccordion";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { defaultTextConfig, fontSettingsCrud, ITextConfig, ITextConfigCreate } from "@/types/ITextConfig";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

interface FontSettingsDrawerWrapperProps {
    initialData?: ITextConfig;
    onSuccess?: () => void;
    onCancel?: () => void;
}

function FontSettingsDrawerWrapper({ initialData, onSuccess, onCancel }: FontSettingsDrawerWrapperProps) {

    const { useCreate, useUpdate } = fontSettingsCrud;
    const { mutate: createFontSetting, isPending: isCreating } = useCreate();
    const { mutate: updateFontSetting, isPending: isUpdating } = useUpdate();

    const { reset, setValue, watch, handleSubmit } = useForm<ITextConfigCreate | ITextConfig>({
        defaultValues: initialData ? {
            code: initialData.code,
            name: initialData.name,
            config: initialData.config
        } : defaultTextConfig
    });


    const onSubmit = (data) => {
        console.log("Form data:", data);
        if (initialData) {
            updateFontSetting({ id: initialData.id, payload: data }, {
                onSuccess: () => {
                    toast.success("Font configuration updated successfully");
                    if (onSuccess) {
                        onSuccess();
                    }
                },
                onError: (error) => {
                    toast.error("Failed to update font configuration");
                    console.error("Update error:", error);
                }
            });
        } else {
            createFontSetting(data, {
                onSuccess: () => {
                    toast.success("Font configuration created successfully");
                    reset(defaultTextConfig);
                    if (onSuccess) {
                        onSuccess();
                    }
                },
                onError: (error) => {
                    toast.error("Failed to create font configuration");
                    console.error("Creation error:", error);
                }
            });

        }
    };



        return (
            <form className="h-full w-[420px] mobile:w-full" onSubmit={handleSubmit(onSubmit)}>
                <FontConfigDrawer
                    title="Display Configuration"
                    description="Configure text properties for the LED display board"
                    languageFields={
                        <>
                            <TextField
                                className="h-24 w-full flex-none"
                                disabled={false}
                                error={false}
                                variant="outline"
                                label="Language Code"
                                helpText="Indian Language Code"
                                icon={null}
                                iconRight={null}
                            >
                                <TextField.Input
                                    placeholder="ex: hi"
                                    value={watch("code")}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue("code", event.target.value)}
                                />
                            </TextField>
                            <TextField
                                className="h-24 w-full flex-none"
                                disabled={false}
                                error={false}
                                variant="outline"
                                label="Language Name"
                                helpText="Full language Name"
                                icon={null}
                                iconRight={null}
                            >
                                <TextField.Input
                                    placeholder="ex: hindi"
                                    value={watch("name")}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue("name", event.target.value)}
                                />
                            </TextField>
                        </>
                    }
                    sideTextAccordion={
                        <ControlAccordion
                            title="Side Text"
                            controls={
                                <div className="flex w-full flex-col items-start gap-6">
                                    <div className="w-full flex-col items-start gap-4 grid grid-cols-2">
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Height"
                                            helpText="Comma-separated heights (e.g. 7,8,10)"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="7,8,10"
                                                value={watch("config.sideText.fontHeight")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.sideText.fontHeight", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (8px)"
                                            helpText="8 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.sideText.fontFamily8")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.sideText.fontFamily8", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (16px)"
                                            helpText="16 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.sideText.fontFamily16")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.sideText.fontFamily16", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (32px)"
                                            helpText="32 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.sideText.fontFamily32")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.sideText.fontFamily32", event.target.value)}
                                            />
                                        </TextField>
                                    </div>
                                </div>
                            }
                            icon={
                                <IconWithBackground
                                    variant="brand"
                                    size="small"
                                    icon={<FeatherType />}
                                    square={false}
                                />
                            }
                        />
                    }
                    mainTextAccordion={
                        <ControlAccordion
                            title="Main Text"
                            controls={
                                <div className="flex w-full flex-col items-start gap-6">
                                    <div className="w-full flex-col items-start gap-4 grid grid-cols-2">
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Height"
                                            helpText="Comma-separated heights (e.g. 7,8,10)"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="7,8,10"
                                                value={watch("config.text.fontHeight")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.text.fontHeight", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (8px)"
                                            helpText="8 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.text.fontFamily8")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.text.fontFamily8", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (16px)"
                                            helpText="16 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.text.fontFamily16")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.text.fontFamily16", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (32px)"
                                            helpText="32 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.text.fontFamily32")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.text.fontFamily32", event.target.value)}
                                            />
                                        </TextField>
                                    </div>
                                </div>
                            }
                            icon={
                                <IconWithBackground
                                    variant="error"
                                    size="small"
                                    icon={<FeatherType />}
                                    square={false}
                                />
                            }
                        />
                    }
                    upperHalfTextAccordion={
                        <ControlAccordion
                            title="Upper Half Text"
                            controls={
                                <div className="flex w-full flex-col items-start gap-6">
                                    <div className="w-full flex-col items-start gap-4 grid grid-cols-2">
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Height"
                                            helpText="Comma-separated heights (e.g. 7,8,10)"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="7,8,10"
                                                value={watch("config.upperHalfText.fontHeight")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.upperHalfText.fontHeight", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (8px)"
                                            helpText="8 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.upperHalfText.fontFamily8")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.upperHalfText.fontFamily8", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (16px)"
                                            helpText="16 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.upperHalfText.fontFamily16")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.upperHalfText.fontFamily16", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (32px)"
                                            helpText="32 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.upperHalfText.fontFamily32")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.upperHalfText.fontFamily32", event.target.value)}
                                            />
                                        </TextField>
                                    </div>
                                </div>
                            }
                            icon={
                                <IconWithBackground
                                    variant="neutral"
                                    size="small"
                                    icon={<FeatherType />}
                                    square={false}
                                />
                            }
                        />
                    }
                    lowerHalfTextAccordion={
                        <ControlAccordion
                            title="Lower Half Text"
                            controls={
                                <div className="flex w-full flex-col items-start gap-6">
                                    <div className="w-full flex-col items-start gap-4 grid grid-cols-2">
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Height"
                                            helpText="Comma-separated heights (e.g. 7,8,10)"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="7,8,10"
                                                value={watch("config.lowerHalfText.fontHeight")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.lowerHalfText.fontHeight", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (8px)"
                                            helpText="8 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.lowerHalfText.fontFamily8")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.lowerHalfText.fontFamily8", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (16px)"
                                            helpText="16 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.lowerHalfText.fontFamily16")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.lowerHalfText.fontFamily16", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (32px)"
                                            helpText="32 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.lowerHalfText.fontFamily32")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.lowerHalfText.fontFamily32", event.target.value)}
                                            />
                                        </TextField>
                                    </div>
                                </div>
                            }
                            icon={
                                <IconWithBackground
                                    variant="warning"
                                    size="small"
                                    icon={<FeatherType />}
                                    square={false}
                                />
                            }
                        />
                    }
                    routeNumber1Accordion={
                        <ControlAccordion
                            title="Route Number 1"
                            controls={
                                <div className="flex w-full flex-col items-start gap-6">
                                    <div className="w-full flex-col items-start gap-4 grid grid-cols-2">
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Height"
                                            helpText="Comma-separated heights (e.g. 7,8,10)"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="7,8,10"
                                                value={watch("config.routeNumber1.fontHeight")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.routeNumber1.fontHeight", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (8px)"
                                            helpText="8 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.routeNumber1.fontFamily8")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.routeNumber1.fontFamily8", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (16px)"
                                            helpText="16 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.routeNumber1.fontFamily16")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.routeNumber1.fontFamily16", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (32px)"
                                            helpText="32 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.routeNumber1.fontFamily32")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.routeNumber1.fontFamily32", event.target.value)}
                                            />
                                        </TextField>
                                    </div>
                                </div>
                            }
                            icon={
                                <IconWithBackground
                                    variant="error"
                                    size="small"
                                    icon={<FeatherType />}
                                    square={false}
                                />
                            }
                        />
                    }
                    routeNumber2Accordion={
                        <ControlAccordion
                            title="Route Number 2"
                            controls={
                                <div className="flex w-full flex-col items-start gap-6">
                                    <div className="w-full flex-col items-start gap-4 grid grid-cols-2">
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Height"
                                            helpText="Comma-separated heights (e.g. 7,8,10)"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="7,8,10"
                                                value={watch("config.routeNumber2.fontHeight")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.routeNumber2.fontHeight", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (8px)"
                                            helpText="8 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.routeNumber2.fontFamily8")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.routeNumber2.fontFamily8", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (16px)"
                                            helpText="16 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.routeNumber2.fontFamily16")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.routeNumber2.fontFamily16", event.target.value)}
                                            />
                                        </TextField>
                                        <TextField
                                            className="h-24 w-auto flex-none"
                                            disabled={false}
                                            error={false}
                                            variant="outline"
                                            label="Font Family (32px)"
                                            helpText="32 height font family"
                                            icon={null}
                                            iconRight={null}
                                        >
                                            <TextField.Input
                                                placeholder="Arial"
                                                value={watch("config.routeNumber2.fontFamily32")}
                                                onChange={(
                                                    event: React.ChangeEvent<HTMLInputElement>
                                                ) => setValue("config.routeNumber2.fontFamily32", event.target.value)}
                                            />
                                        </TextField>
                                    </div>
                                </div>
                            }
                            icon={
                                <IconWithBackground
                                    size="small"
                                    icon={<FeatherType />}
                                    square={false}
                                />
                            }
                        />
                    }
                    actions={
                        <>
                            <Button
                                className="h-9 w-full flex-none"
                                variant="neutral-secondary"
                                size="medium"
                                icon={null}
                                iconRight={null}
                                loading={false}
                                onClick={() => {
                                    if (onCancel) {
                                        onCancel();
                                    }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="h-9 w-full flex-none"
                                variant="brand-primary"
                                size="medium"
                                icon={<FeatherSave />}
                                type="submit"
                                iconRight={null}
                                loading={false}

                            >
                                {isCreating ? "Creating..." : isUpdating ? "Updating..." : initialData ? "Update" : "Create"}
                            </Button>
                        </>
                    }
                />
            </form>
        );
    }

    export default FontSettingsDrawerWrapper;