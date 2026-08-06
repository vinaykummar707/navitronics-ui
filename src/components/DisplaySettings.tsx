import { useForm, Controller } from "react-hook-form";
import {
  Button,
  Box,
  Flex,
  Heading,
  Grid,
  VStack,
  HStack,
  Input,
  Text,
  Badge,
  Tabs,
  createListCollection,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect } from "react";
import axiosInstance from "@/config/axios";
import { toast } from "react-toastify";
import { Icon } from "@iconify-icon/react";

interface TextSettings2 {
  fontHeight: string;
  fontFamily16: string;
  fontFamily8: string;
  x_offset: string;
  y_offset: string;
  spacing: string;
  scrollSpeed: string;
  scrollType: string;
  fontSize: string;
  position: string;
  fontWeight: string;
}

interface DisplaySettingsState {
  code: string;
  name: string;
  fontFile: string | null;
  fontFamily: string | null;
  config: {
    sideText: TextSettings2;
    text: TextSettings2;
    routeNumber1: TextSettings2;
    routeNumber2: TextSettings2;
    upperHalfText: TextSettings2;
    lowerHalfText: TextSettings2;
  };
}

const initialState: DisplaySettingsState = {
  code: "",
  name: "",
  fontFile: null,
  fontFamily: null,
  config: {
    sideText: {
      fontHeight: "",
      fontFamily16: "",
      fontFamily8: "",
      x_offset: "",
      y_offset: "",
      spacing: "",
      scrollSpeed: "",
      scrollType: "",
      fontSize: "",
      position: "",
      fontWeight: "",
    },
    routeNumber1: {
      fontHeight: "",
      fontFamily16: "",
      fontFamily8: "",
      x_offset: "",
      y_offset: "",
      spacing: "",
      scrollSpeed: "",
      scrollType: "",
      fontSize: "",
      position: "",
      fontWeight: "",
    },
    routeNumber2: {
      fontHeight: "",
      fontFamily16: "",
      fontFamily8: "",
      x_offset: "",
      y_offset: "",
      spacing: "",
      scrollSpeed: "",
      scrollType: "",
      fontSize: "",
      position: "",
      fontWeight: "",
    },
    text: {
      fontHeight: "",
      fontFamily16: "",
      fontFamily8: "",
      x_offset: "",
      y_offset: "",
      spacing: "",
      scrollSpeed: "",
      scrollType: "",
      fontSize: "",
      position: "",
      fontWeight: "",
    },
    upperHalfText: {
      fontHeight: "",
      fontFamily16: "",
      fontFamily8: "",
      x_offset: "",
      y_offset: "",
      spacing: "",
      scrollSpeed: "",
      scrollType: "",
      fontSize: "",
      position: "",
      fontWeight: "",
    },
    lowerHalfText: {
      fontHeight: "",
      fontFamily16: "",
      fontFamily8: "",
      x_offset: "",
      y_offset: "",
      spacing: "",
      scrollSpeed: "",
      scrollType: "",
      fontSize: "",
      position: "",
      fontWeight: "",
    },
  },
};

const LANGUAGE_OPTIONS = createListCollection({
  items: [
    { label: "English (en)", value: "en" },
    { label: "Hindi (hi)", value: "hi" },
    { label: "Bengali (bn)", value: "bn" },
    { label: "Telugu (te)", value: "te" },
    { label: "Tamil (ta)", value: "ta" },
    { label: "Marathi (mr)", value: "mr" },
    { label: "Gujarati (gu)", value: "gu" },
    { label: "Kannada (kn)", value: "kn" },
    { label: "Malayalam (ml)", value: "ml" },
    { label: "Punjabi (pa)", value: "pa" },
    { label: "Odia (or)", value: "or" },
    { label: "Assamese (as)", value: "as" },
    { label: "Sanskrit (sa)", value: "sa" },
    { label: "Kashmiri (ks)", value: "ks" },
    { label: "Nepali (ne)", value: "ne" },
    { label: "Sindhi (sd)", value: "sd" },
    { label: "Bodo (bo)", value: "bo" },
    { label: "Dogri (doi)", value: "doi" },
    { label: "Manipuri (mni)", value: "mni" },
    { label: "Konkani (kok)", value: "kok" },
    { label: "Maithili (mai)", value: "mai" },
    { label: "Santali (sat)", value: "sat" },
    { label: "Mizo (lus)", value: "lus" },
    { label: "Wancho (njz)", value: "njz" },
    { label: "Khasi (kha)", value: "kha" },
  ],
});

const FONT_WEIGHT_OPTIONS = createListCollection({
  items: [
    { label: "Regular", value: "normal" },
    { label: "Bold", value: "bold" },
  ],
});

const SCROLL_TYPE_OPTIONS = createListCollection({
  items: [
    { label: "Fixed", value: "Fixed" },
    { label: "Left To Right", value: "Left To Right" },
    { label: "Right To Left", value: "Right To Left" },
    { label: "Flicker", value: "Flicker" },
  ],
});

const POSITION_OPTIONS = createListCollection({
  items: [
    { label: "Left", value: "Left" },
    { label: "Center", value: "Center" },
    { label: "Right", value: "Right" },
  ],
});

interface TextSettingsFormProps {
  title: string;
  iconName: string;
  configKey: string;
  register: any;
  control: any;
}

const TextSettingsForm = ({
  title,
  iconName,
  configKey,
  register,
  control,
}: TextSettingsFormProps) => {
  return (
    <Box bg="white" p="5" rounded="xl" borderWidth="1px" borderColor="gray.200" shadow="xs">
      <HStack gap="2" mb="4" align="center">
        <Icon icon={iconName} style={{ fontSize: '20px', color: '#2563eb' }} />
        <Heading size="sm" color="gray.900" fontWeight="bold">
          {title}
        </Heading>
      </HStack>

      <Grid templateColumns="repeat(3, 1fr)" gap="4">
        <Field label="Font Family (Height 16)">
          <Input
            type="text"
            size="sm"
            {...register(`${configKey}.fontFamily16`)}
            placeholder="e.g. gautami.ttf"
            bg="white"
          />
        </Field>

        <Field label="Font Family (Height 8)">
          <Input
            type="text"
            size="sm"
            {...register(`${configKey}.fontFamily8`)}
            placeholder="e.g. mangal.ttf"
            bg="white"
          />
        </Field>

        <Field label="Font Height (px)">
          <Input
            type="number"
            size="sm"
            {...register(`${configKey}.fontHeight`)}
            placeholder="16"
            bg="white"
          />
        </Field>

        <Field label="Width Aspect">
          <Input
            type="number"
            size="sm"
            {...register(`${configKey}.fontSize`)}
            placeholder="1"
            bg="white"
          />
        </Field>

        <Controller
          control={control}
          name={`${configKey}.fontWeight` as any}
          render={({ field }) => (
            <Field label="Font Weight">
              <SelectRoot
                collection={FONT_WEIGHT_OPTIONS}
                size="sm"
                value={field.value ? [field.value] : []}
                onValueChange={(e) => field.onChange(e.value[0] || "")}
              >
                <SelectTrigger bg="white">
                  <SelectValueText placeholder="Select Weight" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_WEIGHT_OPTIONS.items.map((item) => (
                    <SelectItem item={item} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </Field>
          )}
        />

        <Field label="Threshold">
          <Input
            type="number"
            size="sm"
            {...register(`${configKey}.spacing`)}
            placeholder="0"
            bg="white"
          />
        </Field>

        <Field label="Scroll Speed">
          <Input
            type="number"
            size="sm"
            min={1}
            max={10}
            {...register(`${configKey}.scrollSpeed`)}
            placeholder="5"
            bg="white"
          />
        </Field>

        <Controller
          control={control}
          name={`${configKey}.scrollType` as any}
          render={({ field }) => (
            <Field label="Scroll Type">
              <SelectRoot
                collection={SCROLL_TYPE_OPTIONS}
                size="sm"
                value={field.value ? [field.value] : []}
                onValueChange={(e) => field.onChange(e.value[0] || "")}
              >
                <SelectTrigger bg="white">
                  <SelectValueText placeholder="Select Scroll Type" />
                </SelectTrigger>
                <SelectContent>
                  {SCROLL_TYPE_OPTIONS.items.map((item) => (
                    <SelectItem item={item} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </Field>
          )}
        />

        <Controller
          control={control}
          name={`${configKey}.position` as any}
          render={({ field }) => (
            <Field label="Position Alignment">
              <SelectRoot
                collection={POSITION_OPTIONS}
                size="sm"
                value={field.value ? [field.value] : []}
                onValueChange={(e) => field.onChange(e.value[0] || "")}
              >
                <SelectTrigger bg="white">
                  <SelectValueText placeholder="Select Alignment" />
                </SelectTrigger>
                <SelectContent>
                  {POSITION_OPTIONS.items.map((item) => (
                    <SelectItem item={item} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </Field>
          )}
        />
      </Grid>
    </Box>
  );
};

interface DisplaySettingsProps {
  isEdit?: boolean;
  initialData?: DisplaySettingsState | null;
  onOperationComplete: () => void;
}

const DisplaySettings = ({
  isEdit = false,
  initialData,
  onOperationComplete,
}: DisplaySettingsProps) => {
  const { register, control, reset, handleSubmit } =
    useForm<DisplaySettingsState>({
      defaultValues: initialState,
    });

  useEffect(() => {
    if (initialData && isEdit) {
      reset(initialData);
    }
  }, [initialData, isEdit, reset]);

  const onSubmit = async (data: DisplaySettingsState) => {
    try {
      if (isEdit) {
        await axiosInstance.put(`/languages/${data.code}`, data);
        toast.success("Language updated successfully!");
      } else {
        await axiosInstance.post("/languages/create", data);
        toast.success("Language created successfully!");
      }
      onOperationComplete();
      reset(initialState);
    } catch (err) {
      toast.error("Error processing request!");
      console.error(err);
    }
  };

  return (
    <Box flex="1" overflowY="auto" pr="2">
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap="4" align="stretch">
          {/* Header Action Bar */}
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="md" color="gray.900" fontWeight="bold">
                Font & Display Configuration
              </Heading>
              <Text color="gray.500" fontSize="xs">
                Configure fonts, sizing, scroll behavior, and alignments per text region
              </Text>
            </Box>
            <HStack gap="3">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => reset(initialState)}
              >
                Reset Form
              </Button>
              <Button colorPalette="blue" size="sm" type="submit">
                <Icon icon={isEdit ? "solar:pen-bold" : "solar:add-circle-bold"} />
                {isEdit ? "Update Language Settings" : "Create Language Settings"}
              </Button>
            </HStack>
          </Flex>

          {/* Primary Language Settings Card */}
          <Box bg="white" p="5" rounded="xl" borderWidth="1px" borderColor="gray.200" shadow="xs">
            <HStack gap="2" mb="4" align="center">
              <Icon icon="solar:global-bold" style={{ fontSize: '20px', color: '#2563eb' }} />
              <Heading size="sm" color="gray.900" fontWeight="bold">
                Language Identity
              </Heading>
              {isEdit && (
                <Badge colorPalette="blue" variant="subtle" size="sm">
                  Editing: {initialData?.code}
                </Badge>
              )}
            </HStack>

            <Grid templateColumns="repeat(2, 1fr)" gap="4">
              <Controller
                control={control}
                name="code"
                render={({ field }) => (
                  <Field label="Language Code" required>
                    <SelectRoot
                      collection={LANGUAGE_OPTIONS}
                      size="sm"
                      disabled={isEdit}
                      value={field.value ? [field.value] : []}
                      onValueChange={(e) => field.onChange(e.value[0] || "")}
                    >
                      <SelectTrigger bg="white">
                        <SelectValueText placeholder="Select Language Code" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.items.map((item) => (
                          <SelectItem item={item} key={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                  </Field>
                )}
              />

              <Field label="Language Name" required>
                <Input
                  type="text"
                  size="sm"
                  {...register("name")}
                  placeholder="e.g. English"
                  bg="white"
                  required
                />
              </Field>
            </Grid>
          </Box>

          {/* Region Tabs */}
          <Tabs.Root defaultValue="route-numbers" variant="line">
            <Tabs.List bg="white" rounded="xl" p="1" borderWidth="1px" borderColor="gray.200">
              <Tabs.Trigger value="route-numbers">
                <HStack gap="2">
                  <Icon icon="solar:tag-horizontal-bold" />
                  Route Numbers
                </HStack>
              </Tabs.Trigger>
              <Tabs.Trigger value="main-text">
                <HStack gap="2">
                  <Icon icon="solar:text-bold" />
                  Main Text
                </HStack>
              </Tabs.Trigger>
              <Tabs.Trigger value="split-text">
                <HStack gap="2">
                  <Icon icon="solar:text-square-bold" />
                  Upper & Lower Split
                </HStack>
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="route-numbers">
              <VStack gap="4" align="stretch" pt="2">
                <TextSettingsForm
                  title="Route Number Text (Side Text)"
                  iconName="solar:tag-horizontal-bold"
                  configKey="config.sideText"
                  register={register}
                  control={control}
                />
                <TextSettingsForm
                  title="Route Number 1 (Primary)"
                  iconName="solar:text-number-bold"
                  configKey="config.routeNumber1"
                  register={register}
                  control={control}
                />
                <TextSettingsForm
                  title="Route Number 2 (Secondary)"
                  iconName="solar:text-number-bold"
                  configKey="config.routeNumber2"
                  register={register}
                  control={control}
                />
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="main-text">
              <VStack gap="4" align="stretch" pt="2">
                <TextSettingsForm
                  title="Main Destination Text"
                  iconName="solar:text-bold"
                  configKey="config.text"
                  register={register}
                  control={control}
                />
              </VStack>
            </Tabs.Content>

            <Tabs.Content value="split-text">
              <VStack gap="4" align="stretch" pt="2">
                <TextSettingsForm
                  title="Upper Half Text"
                  iconName="solar:text-bold"
                  configKey="config.upperHalfText"
                  register={register}
                  control={control}
                />
                <TextSettingsForm
                  title="Lower Half Text"
                  iconName="solar:text-bold"
                  configKey="config.lowerHalfText"
                  register={register}
                  control={control}
                />
              </VStack>
            </Tabs.Content>
          </Tabs.Root>
        </VStack>
      </form>
    </Box>
  );
};

export default DisplaySettings;
