import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
  defineSlotRecipe,
} from "@chakra-ui/react";

// ─── Component Recipes (Single-part components) ───────────────────────────────

const badgeRecipe = defineRecipe({
  className: "chakra-badge",
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "1.5",
    borderRadius: "full",
    fontWeight: "semibold",
    fontSize: "xs",
    lineHeight: "1.25rem",
    px: "2.5",
    py: "0.5",
    whiteSpace: "nowrap",
    userSelect: "none",
  },
  variants: {
    variant: {
      subtle: {
        bg: "colorPalette.subtle",
        color: "colorPalette.fg",
      },
      solid: {
        bg: "colorPalette.solid",
        color: "colorPalette.contrast",
      },
      outline: {
        borderWidth: "1px",
        borderColor: "colorPalette.border",
        color: "colorPalette.fg",
      },
      surface: {
        bg: "colorPalette.subtle",
        color: "colorPalette.fg",
        borderWidth: "1px",
        borderColor: "colorPalette.muted",
      },
      plain: {
        color: "colorPalette.fg",
      },
    },
    size: {
      xs: {
        fontSize: "2xs",
        px: "2",
        py: "0.5",
      },
      sm: {
        fontSize: "xs",
        px: "2.5",
        py: "0.5",
      },
      md: {
        fontSize: "xs",
        px: "3",
        py: "1",
      },
      lg: {
        fontSize: "sm",
        px: "3.5",
        py: "1",
      },
    },
  },
  defaultVariants: {
    variant: "subtle",
    size: "sm",
  },
});

const buttonRecipe = defineRecipe({
  className: "chakra-button",
  base: {
    display: "inline-flex",
    appearance: "none",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    position: "relative",
    borderRadius: "full",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
    cursor: "button",
    flexShrink: "0",
    outline: "0",
    fontWeight: "600",
    shadow: "none",
    boxShadow: "none",
    transitionProperty: "common",
    transitionDuration: "moderate",
    _disabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
  variants: {
    variant: {
      solid: {
        bg: "colorPalette.solid",
        color: "colorPalette.contrast",
        _hover: {
          bg: "colorPalette.solid/90",
        },
      },
      subtle: {
        bg: "colorPalette.subtle",
        color: "colorPalette.fg",
        _hover: {
          bg: "colorPalette.muted",
        },
      },
      outline: {
        borderWidth: "1px",
        borderColor: "border.subtle",
        color: "fg.default",
        bg: "transparent",
        _hover: {
          bg: "bg.subtle",
          borderColor: "border.default",
        },
      },
      ghost: {
        bg: "transparent",
        color: "fg.muted",
        _hover: {
          bg: "bg.subtle",
          color: "fg.default",
        },
      },
      plain: {
        color: "colorPalette.fg",
      },
    },
    size: {
      xs: {
        h: "7",
        minW: "7",
        textStyle: "xs",
        px: "2.5",
        gap: "1.5",
      },
      sm: {
        h: "8",
        minW: "8",
        textStyle: "xs",
        px: "3.5",
        gap: "2",
      },
      md: {
        h: "9",
        minW: "9",
        textStyle: "sm",
        px: "4",
        gap: "2",
      },
      lg: {
        h: "10",
        minW: "10",
        textStyle: "md",
        px: "5",
        gap: "2.5",
      },
    },
  },
  defaultVariants: {
    variant: "solid",
    size: "sm",
  },
});

const inputRecipe = defineRecipe({
  className: "chakra-input",
  base: {
    width: "100%",
    minWidth: "0",
    outline: "0",
    borderRadius: "full",
    borderColor: "border.subtle",
    bg: "bg.panel",
    fontSize: "sm",
    shadow: "none",
    boxShadow: "none",
    _hover: {
      borderColor: "border.default",
    },
    _focus: {
      borderColor: "brand.500",
      boxShadow: "none",
    },
  },
  variants: {
    variant: {
      outline: {
        bg: "bg.panel",
        borderWidth: "1px",
        borderColor: "border.subtle",
        borderRadius: "full",
      },
      subtle: {
        bg: "bg.subtle",
        borderWidth: "1px",
        borderColor: "transparent",
        borderRadius: "full",
      },
    },
    size: {
      xs: {
        h: "7",
        px: "2.5",
        fontSize: "xs",
      },
      sm: {
        h: "8",
        px: "3.5",
        fontSize: "sm",
      },
      md: {
        h: "9",
        px: "4",
        fontSize: "sm",
      },
      lg: {
        h: "10",
        px: "4.5",
        fontSize: "md",
      },
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "sm",
  },
});

// ─── Slot Recipes (Multi-part components) ─────────────────────────────────────

const cardSlotRecipe = defineSlotRecipe({
  slots: ["root", "header", "body", "footer", "title", "description"],
  className: "chakra-card",
  base: {
    root: {
      display: "flex",
      flexDirection: "column",
      position: "relative",
      minWidth: "0",
      wordWrap: "break-word",
      borderRadius: "2xl",
      color: "fg",
      textAlign: "start",
      bg: "bg.panel",
      borderWidth: "1px",
      borderColor: "border.subtle",
      shadow: "none",
      boxShadow: "none",
      overflow: "hidden",
    },
    title: {
      fontWeight: "700",
      fontSize: "sm",
      color: "fg.default",
    },
    description: {
      color: "fg.muted",
      fontSize: "xs",
      lineHeight: "1.4",
    },
    header: {
      paddingInline: "5",
      paddingTop: "4",
      paddingBottom: "2",
      display: "flex",
      flexDirection: "column",
      gap: "1",
    },
    body: {
      paddingInline: "5",
      paddingBlock: "4",
      flex: "1",
      display: "flex",
      flexDirection: "column",
    },
    footer: {
      display: "flex",
      alignItems: "center",
      gap: "2",
      paddingInline: "5",
      paddingBlock: "3",
      borderTopWidth: "1px",
      borderColor: "border.subtle",
    },
  },
  variants: {
    variant: {
      outline: {
        root: {
          bg: "bg.panel",
          borderWidth: "1px",
          borderColor: "border.subtle",
          shadow: "none",
          boxShadow: "none",
        },
      },
      elevated: {
        root: {
          bg: "bg.panel",
          borderWidth: "1px",
          borderColor: "border.subtle",
          shadow: "none",
          boxShadow: "none",
        },
      },
      subtle: {
        root: {
          bg: "bg.subtle",
          borderWidth: "1px",
          borderColor: "border.subtle",
          shadow: "none",
          boxShadow: "none",
        },
      },
    },
    size: {
      sm: {
        root: { borderRadius: "2xl" },
        header: { paddingInline: "4", paddingTop: "3", paddingBottom: "2" },
        body: { paddingInline: "4", paddingBlock: "3" },
        footer: { paddingInline: "4", paddingBlock: "2.5" },
      },
      md: {
        root: { borderRadius: "2xl" },
        header: { paddingInline: "5", paddingTop: "4", paddingBottom: "2" },
        body: { paddingInline: "5", paddingBlock: "4" },
        footer: { paddingInline: "5", paddingBlock: "3" },
      },
      lg: {
        root: { borderRadius: "3xl" },
        header: { paddingInline: "6", paddingTop: "5", paddingBottom: "2.5" },
        body: { paddingInline: "6", paddingBlock: "5" },
        footer: { paddingInline: "6", paddingBlock: "3.5" },
      },
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
});

const tableSlotRecipe = defineSlotRecipe({
  slots: [
    "root",
    "header",
    "body",
    "row",
    "columnHeader",
    "cell",
    "footer",
    "caption",
  ],
  className: "chakra-table",
  base: {
    root: {
      width: "full",
      borderCollapse: "separate",
      borderSpacing: "0",
      textAlign: "start",
      verticalAlign: "top",
      borderRadius: "2xl",
      borderWidth: "1px",
      borderColor: "border.subtle",
      bg: "bg.panel",
      shadow: "none",
      boxShadow: "none",
      overflow: "hidden",
    },
    header: {
      bg: "bg.subtle",
    },
    body: {
      bg: "transparent",
    },
    columnHeader: {
      fontWeight: "semibold",
      fontSize: "xs",
      textTransform: "uppercase",
      letterSpacing: "wider",
      color: "fg.muted",
      py: "3.5",
      px: "4.5",
      borderBottomWidth: "1px",
      borderColor: "border.subtle",
      textAlign: "start",
      bg: "bg.subtle",
    },
    row: {
      borderColor: "border.subtle",
      bg: "transparent",
      _hover: {
        bg: "bg.subtle",
      },
      transition: "background-color 0.15s ease",
    },
    cell: {
      py: "3.5",
      px: "4.5",
      fontSize: "sm",
      color: "fg.default",
      borderBottomWidth: "1px",
      borderColor: "border.subtle",
      textAlign: "start",
    },
    footer: {
      bg: "bg.subtle",
      borderTopWidth: "1px",
      borderColor: "border.subtle",
      py: "3",
      px: "4.5",
    },
  },
  variants: {
    variant: {
      line: {
        root: {
          borderCollapse: "separate",
          borderSpacing: "0",
        },
        columnHeader: {
          borderBottomWidth: "1px",
          borderColor: "border.subtle",
          bg: "bg.subtle",
        },
        row: {
          borderBottomWidth: "1px",
          borderColor: "border.subtle",
        },
        cell: {
          borderBottomWidth: "1px",
          borderColor: "border.subtle",
        },
      },
      outline: {
        root: {
          borderRadius: "2xl",
          borderWidth: "1px",
          borderColor: "border.subtle",
          bg: "bg.panel",
          shadow: "none",
          boxShadow: "none",
          overflow: "hidden",
        },
        columnHeader: {
          borderBottomWidth: "1px",
          borderColor: "border.subtle",
          bg: "bg.subtle",
        },
        cell: {
          borderBottomWidth: "1px",
          borderColor: "border.subtle",
        },
      },
      plain: {
        root: {
          borderWidth: "0",
          bg: "transparent",
          boxShadow: "none",
          borderRadius: "0",
        },
      },
    },
  },
  defaultVariants: {
    variant: "line",
    size: "md",
  },
});

const tabsSlotRecipe = defineSlotRecipe({
  slots: ["root", "trigger", "list", "content", "indicator"],
  className: "chakra-tabs",
  base: {
    root: {
      position: "relative",
    },
    list: {
      borderRadius: "full",
      bg: "bg.subtle",
      p: "1",
      gap: "1",
      borderWidth: "1px",
      borderColor: "border.subtle",
      borderBottomWidth: "0 !important",
      shadow: "none",
      boxShadow: "none",
      display: "inline-flex",
      alignItems: "center",
    },
    trigger: {
      borderRadius: "full",
      fontSize: "xs",
      fontWeight: "600",
      py: "1.5",
      px: "3.5",
      color: "fg.muted",
      cursor: "button",
      position: "relative",
      outline: "none",
      borderWidth: "0",
      borderBottomWidth: "0 !important",
      transition: "all 0.15s ease",
      _before: {
        display: "none !important",
      },
      _after: {
        display: "none !important",
      },
      _selected: {
        bg: "bg.panel",
        color: "fg.default",
        shadow: "none",
        boxShadow: "none",
        borderWidth: "1px",
        borderColor: "border.subtle",
        _before: {
          display: "none !important",
        },
        _after: {
          display: "none !important",
        },
      },
      _hover: {
        color: "fg.default",
      },
    },
    indicator: {
      display: "none !important",
    },
  },
  variants: {
    variant: {
      line: {
        list: {
          borderBottomWidth: "0 !important",
          borderColor: "border.subtle",
        },
        trigger: {
          borderBottomWidth: "0 !important",
          _before: { display: "none !important" },
          _after: { display: "none !important" },
          _selected: {
            bg: "bg.panel",
            color: "fg.default",
            borderWidth: "1px",
            borderColor: "border.subtle",
            _before: { display: "none !important" },
            _after: { display: "none !important" },
          },
        },
      },
      subtle: {
        list: {
          borderBottomWidth: "0 !important",
          borderColor: "border.subtle",
        },
        trigger: {
          borderBottomWidth: "0 !important",
          _before: { display: "none !important" },
          _after: { display: "none !important" },
          _selected: {
            bg: "bg.panel",
            color: "fg.default",
            borderWidth: "1px",
            borderColor: "border.subtle",
            _before: { display: "none !important" },
            _after: { display: "none !important" },
          },
        },
      },
      enclosed: {
        list: {
          borderBottomWidth: "0 !important",
          borderColor: "border.subtle",
        },
        trigger: {
          borderBottomWidth: "0 !important",
          _before: { display: "none !important" },
          _after: { display: "none !important" },
          _selected: {
            bg: "bg.panel",
            color: "fg.default",
            borderWidth: "1px",
            borderColor: "border.subtle",
            _before: { display: "none !important" },
            _after: { display: "none !important" },
          },
        },
      },
      outline: {
        list: {
          borderBottomWidth: "0 !important",
          borderColor: "border.subtle",
        },
        trigger: {
          borderBottomWidth: "0 !important",
          _before: { display: "none !important" },
          _after: { display: "none !important" },
          _selected: {
            bg: "bg.panel",
            color: "fg.default",
            borderWidth: "1px",
            borderColor: "border.subtle",
            _before: { display: "none !important" },
            _after: { display: "none !important" },
          },
        },
      },
      plain: {
        list: {
          borderBottomWidth: "0 !important",
        },
        trigger: {
          borderBottomWidth: "0 !important",
          _before: { display: "none !important" },
          _after: { display: "none !important" },
        },
      },
    },
    size: {
      xs: {
        trigger: {
          fontSize: "2xs",
          py: "1",
          px: "2.5",
        },
      },
      sm: {
        trigger: {
          fontSize: "xs",
          py: "1.5",
          px: "3.5",
        },
      },
      md: {
        trigger: {
          fontSize: "xs",
          py: "1.5",
          px: "4",
        },
      },
      lg: {
        trigger: {
          fontSize: "sm",
          py: "2",
          px: "5",
        },
      },
    },
  },
  defaultVariants: {
    variant: "subtle",
    size: "sm",
  },
});

const nativeSelectSlotRecipe = defineSlotRecipe({
  slots: ["root", "field", "indicator"],
  className: "chakra-native-select",
  base: {
    field: {
      borderRadius: "full",
      borderColor: "border.subtle",
      bg: "bg.panel",
      fontSize: "sm",
      px: "3.5",
      shadow: "none",
      boxShadow: "none",
      _hover: {
        borderColor: "border.default",
      },
      _focus: {
        borderColor: "brand.500",
        boxShadow: "none",
      },
    },
  },
});

const selectSlotRecipe = defineSlotRecipe({
  slots: [
    "root",
    "label",
    "control",
    "trigger",
    "clearTrigger",
    "valueText",
    "indicator",
    "positioner",
    "content",
    "item",
    "itemText",
    "itemIndicator",
    "itemGroup",
    "itemGroupLabel",
    "indicatorGroup",
  ],
  className: "chakra-select",
  base: {
    trigger: {
      borderRadius: "full",
      borderWidth: "1px",
      borderColor: "border.subtle",
      bg: "bg.panel",
      fontSize: "sm",
      shadow: "none",
      boxShadow: "none",
      _hover: {
        borderColor: "border.default",
      },
    },
    content: {
      borderRadius: "2xl",
      borderWidth: "1px",
      borderColor: "border.subtle",
      bg: "bg.panel",
      shadow: "none",
      boxShadow:
        "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)",
      overflow: "hidden",
      p: "1.5",
    },
    item: {
      borderRadius: "lg",
      fontSize: "xs",
      fontWeight: "500",
      _hover: {
        bg: "bg.subtle",
      },
    },
  },
});

const menuSlotRecipe = defineSlotRecipe({
  slots: [
    "root",
    "trigger",
    "positioner",
    "content",
    "item",
    "itemText",
    "itemGroup",
    "itemGroupLabel",
    "separator",
    "indicator",
  ],
  className: "chakra-menu",
  base: {
    content: {
      borderRadius: "2xl",
      bg: "bg.panel",
      borderWidth: "1px",
      borderColor: "border.subtle",
      p: "1.5",
      shadow: "none",
      boxShadow:
        "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)",
    },
    item: {
      borderRadius: "xl",
      fontSize: "xs",
      fontWeight: "500",
      px: "3",
      py: "2",
      cursor: "pointer",
      _hover: {
        bg: "bg.subtle",
      },
    },
  },
});

const dialogSlotRecipe = defineSlotRecipe({
  slots: [
    "trigger",
    "backdrop",
    "positioner",
    "content",
    "header",
    "body",
    "footer",
    "title",
    "description",
    "closeTrigger",
  ],
  className: "chakra-dialog",
  base: {
    backdrop: {
      bg: "black/40",
      backdropFilter: "blur(4px)",
    },
    content: {
      borderRadius: "2xl",
      bg: "bg.panel",
      borderWidth: "1px",
      borderColor: "border.subtle",
      shadow: "none",
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
      overflow: "hidden",
    },
    title: {
      fontSize: "md",
      fontWeight: "700",
    },
    description: {
      fontSize: "xs",
      color: "fg.muted",
    },
  },
});

const drawerSlotRecipe = defineSlotRecipe({
  slots: [
    "trigger",
    "backdrop",
    "positioner",
    "content",
    "header",
    "body",
    "footer",
    "title",
    "description",
    "closeTrigger",
  ],
  className: "chakra-drawer",
  base: {
    backdrop: {
      bg: "black/40",
      backdropFilter: "blur(4px)",
    },
    content: {
      bg: "bg.panel",
      borderLeftWidth: "1px",
      borderColor: "border.subtle",
      shadow: "none",
      boxShadow:
        "-10px 0 25px -5px rgba(0, 0, 0, 0.08), -8px 0 10px -6px rgba(0, 0, 0, 0.03)",
    },
    header: {
      paddingInline: "6",
      paddingBlock: "4",
      borderBottomWidth: "1px",
      borderColor: "border.subtle",
    },
    body: {
      paddingInline: "6",
      paddingBlock: "5",
    },
    footer: {
      paddingInline: "6",
      paddingBlock: "4",
      borderTopWidth: "1px",
      borderColor: "border.subtle",
    },
    title: {
      fontSize: "sm",
      fontWeight: "700",
      color: "fg.default",
    },
    description: {
      fontSize: "xs",
      color: "fg.muted",
    },
  },
});

const checkboxCardSlotRecipe = defineSlotRecipe({
  slots: [
    "root",
    "control",
    "label",
    "description",
    "addon",
    "indicator",
    "content",
  ],
  className: "chakra-checkbox-card",
  base: {
    root: {
      borderRadius: "xl",
      borderWidth: "1px",
      borderColor: "border.subtle",
      bg: "bg.panel",
      shadow: "none",
      boxShadow: "none",
      p: "3",
      transition: "all 0.15s ease",
      _hover: {
        borderColor: "border.default",
        bg: "bg.subtle",
      },
    },
    label: {
      fontSize: "xs",
      fontWeight: "600",
    },
    description: {
      fontSize: "2xs",
      color: "fg.muted",
    },
  },
});

const emptyStateSlotRecipe = defineSlotRecipe({
  slots: ["root", "content", "indicator", "title", "description"],
  className: "chakra-empty-state",
  base: {
    root: {
      borderRadius: "2xl",
      borderWidth: "1px",
      borderColor: "border.subtle",
      bg: "bg.panel",
      shadow: "none",
      boxShadow: "none",
      p: "8",
      textAlign: "center",
    },
    title: {
      fontSize: "sm",
      fontWeight: "700",
      color: "fg.default",
    },
    description: {
      fontSize: "xs",
      color: "fg.muted",
      maxW: "sm",
      mx: "auto",
    },
  },
});

const statSlotRecipe = defineSlotRecipe({
  slots: ["root", "label", "helpText", "valueText", "valueUnit", "indicator"],
  className: "chakra-stat",
  base: {
    root: {
      borderRadius: "2xl",
      borderWidth: "1px",
      borderColor: "border.subtle",
      bg: "bg.panel",
      shadow: "none",
      boxShadow: "none",
      p: "4",
    },
    label: {
      fontSize: "xs",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      color: "fg.muted",
    },
    valueText: {
      fontSize: "2xl",
      fontWeight: "800",
      letterSpacing: "-0.03em",
      color: "fg.default",
    },
    helpText: {
      fontSize: "xs",
      color: "fg.subtle",
    },
  },
});

const textareaRecipe = defineRecipe({
  className: "chakra-textarea",
  base: {
    width: "100%",
    minWidth: "0",
    outline: "0",
    borderRadius: "xl",
    borderColor: "border.subtle",
    borderWidth: "1px",
    bg: "bg.panel",
    fontSize: "sm",
    p: "3",
    shadow: "none",
    boxShadow: "none",
    _hover: {
      borderColor: "border.default",
    },
    _focus: {
      borderColor: "brand.500",
      boxShadow: "none",
    },
  },
});

const progressSlotRecipe = defineSlotRecipe({
  slots: [
    "root",
    "track",
    "range",
    "label",
    "valueText",
    "circle",
    "circleRange",
    "circleTrack",
    "view",
  ],
  className: "chakra-progress",
  base: {
    track: {
      borderRadius: "full",
      overflow: "hidden",
      bg: "bg.muted",
    },
    range: {
      borderRadius: "full",
      transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    },
  },
  defaultVariants: {
    shape: "full",
  },
});

const switchSlotRecipe = defineSlotRecipe({
  slots: ["root", "control", "thumb", "track", "label", "indicator"],
  className: "chakra-switch",
  base: {
    control: {
      borderRadius: "full",
      borderWidth: "1px",
      borderColor: "border.subtle",
    },
    thumb: {
      borderRadius: "full",
      shadow: "none",
      boxShadow: "none",
    },
  },
});

const tooltipSlotRecipe = defineSlotRecipe({
  slots: ["trigger", "arrow", "arrowTip", "positioner", "content"],
  className: "chakra-tooltip",
  base: {
    content: {
      borderRadius: "lg",
      bg: "gray.900",
      color: "white",
      fontSize: "xs",
      fontWeight: "500",
      px: "2.5",
      py: "1",
      shadow: "none",
      boxShadow: "none",
    },
  },
});

const checkboxSlotRecipe = defineSlotRecipe({
  slots: ["root", "control", "indicator", "label"],
  className: "chakra-checkbox",
  base: {
    control: {
      borderRadius: "md",
      borderWidth: "1px",
      borderColor: "border.subtle",
      shadow: "none",
      boxShadow: "none",
    },
    label: {
      fontSize: "xs",
      color: "fg.default",
      fontWeight: "500",
    },
  },
});

const fieldSlotRecipe = defineSlotRecipe({
  slots: ["root", "label", "requiredIndicator", "helperText", "errorText"],
  className: "chakra-field",
  base: {
    label: {
      fontSize: "xs",
      fontWeight: "600",
      color: "fg.default",
      mb: "1.5",
    },
    helperText: {
      fontSize: "xs",
      color: "fg.muted",
      mt: "1.5",
    },
    errorText: {
      fontSize: "xs",
      color: "red.500",
      mt: "1.5",
      fontWeight: "500",
    },
  },
});

const segmentGroupSlotRecipe = defineSlotRecipe({
  slots: [
    "root",
    "label",
    "indicator",
    "item",
    "itemText",
    "itemControl",
    "itemHiddenInput",
  ],
  className: "chakra-segment-group",
  base: {
    root: {
      borderRadius: "full",
      bg: "bg.subtle",
      p: "1",
      borderWidth: "1px",
      borderColor: "border.subtle",
      shadow: "none",
      boxShadow: "none",
      display: "inline-flex",
      alignItems: "center",
      gap: "1",
    },
    indicator: {
      borderRadius: "full",
      bg: "bg.panel",
      shadow: "none",
      boxShadow: "none",
      borderWidth: "1px",
      borderColor: "border.subtle",
    },
    item: {
      borderRadius: "full",
      fontSize: "xs",
      fontWeight: "600",
      py: "1.5",
      px: "3.5",
      color: "fg.muted",
      cursor: "pointer",
      _checked: {
        color: "fg.default",
      },
    },
  },
});

const popoverSlotRecipe = defineSlotRecipe({
  slots: [
    "arrow",
    "arrowTip",
    "anchor",
    "trigger",
    "indicator",
    "positioner",
    "content",
    "title",
    "description",
    "closeTrigger",
    "header",
    "body",
    "footer",
  ],
  className: "chakra-popover",
  base: {
    content: {
      borderRadius: "2xl",
      bg: "bg.panel",
      borderWidth: "1px",
      borderColor: "border.subtle",
      p: "4",
      shadow: "none",
      boxShadow:
        "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03)",
    },
    title: {
      fontSize: "sm",
      fontWeight: "700",
      color: "fg.default",
    },
    description: {
      fontSize: "xs",
      color: "fg.muted",
    },
  },
});

const statusSlotRecipe = defineSlotRecipe({
  slots: ["root", "indicator"],
  className: "chakra-status",
  base: {
    root: {
      display: "inline-flex",
      alignItems: "center",
      gap: "2",
      fontSize: "xs",
      fontWeight: "medium",
    },
    indicator: {
      borderRadius: "full",
    },
  },
});

const avatarSlotRecipe = defineSlotRecipe({
  slots: ["root", "image", "fallback"],
  className: "chakra-avatar",
  base: {
    root: {
      borderRadius: "full",
      fontWeight: "semibold",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      verticalAlign: "top",
      flexShrink: 0,
      userSelect: "none",
      borderWidth: "1px",
      borderColor: "border.subtle",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "inherit",
    },
    fallback: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "inherit",
    },
  },
});

// ─── Theme Configuration ──────────────────────────────────────────────────────

const customConfig = defineConfig({
  globalCss: {
    "html, body": {
      bg: "bg.canvas",
      color: "fg.default",
      fontFamily:
        "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },
    ".chakra-tabs__trigger::after, .chakra-tabs__trigger::before": {
      display: "none !important",
    },
    ".chakra-tabs__indicator": {
      display: "none !important",
    },
  },
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#eff6ff" },
          100: { value: "#dbeafe" },
          200: { value: "#bfdbfe" },
          300: { value: "#93c5fd" },
          400: { value: "#60a5fa" },
          500: { value: "#2563eb" },
          600: { value: "#1d4ed8" },
          700: { value: "#1e40af" },
          800: { value: "#1e3a8a" },
          900: { value: "#172554" },
        },
        pastel: {
          mint: { value: "#E9F8F0" },
          mintText: { value: "#10B981" },
          peach: { value: "#FDF1EC" },
          peachText: { value: "#F97316" },
          sky: { value: "#ECF3FE" },
          skyText: { value: "#3B82F6" },
          lavender: { value: "#F3E8FF" },
          lavenderText: { value: "#A855F7" },
        },
      },
      radii: {
        none: { value: "0" },
        xs: { value: "4px" },
        sm: { value: "6px" },
        md: { value: "8px" },
        lg: { value: "12px" },
        xl: { value: "14px" },
        "2xl": { value: "16px" },
        "3xl": { value: "20px" },
        "4xl": { value: "24px" },
        full: { value: "9999px" },
      },
      shadows: {
        none: { value: "none" },
        xs: { value: "none" },
        sm: { value: "none" },
        md: { value: "none" },
        lg: { value: "none" },
        xl: { value: "none" },
        "2xl": { value: "none" },
        "3xl": { value: "none" },
        inner: { value: "none" },
      },
    },
    semanticTokens: {
      radii: {
        l1: { value: "{radii.md}" },
        l2: { value: "{radii.full}" },
        l3: { value: "{radii.2xl}" },
      },
      shadows: {
        none: { value: "none" },
        xs: { value: "none" },
        sm: { value: "none" },
        md: { value: "none" },
        lg: { value: "none" },
        xl: { value: "none" },
        "2xl": { value: "none" },
        "3xl": { value: "none" },
        inner: { value: "none" },
      },
      colors: {
        "bg.canvas": {
          value: { base: "#F5F6FA", _dark: "#0B0F17" },
        },
        "bg.shell": {
          value: { base: "#F8F9FB", _dark: "#121721" },
        },
        "bg.workspace": {
          value: { base: "#FFFFFF", _dark: "#161B22" },
        },
        "bg.panel": {
          value: { base: "#FFFFFF", _dark: "#161B22" },
        },
        "bg.surface": {
          value: { base: "#FFFFFF", _dark: "#161B22" },
        },
        "bg.subtle": {
          value: { base: "#F8F9FB", _dark: "#1C2128" },
        },
        "bg.muted": {
          value: { base: "#EDF0F5", _dark: "#21262D" },
        },
        "border.subtle": {
          value: {
            base: "#E8ECF2",
            _dark: "rgba(255, 255, 255, 0.10)",
          },
        },
        "border.default": {
          value: { base: "#D8DFE8", _dark: "rgba(255, 255, 255, 0.18)" },
        },
        "fg.default": {
          value: { base: "#111827", _dark: "#F9FAFB" },
        },
        "fg.muted": {
          value: { base: "#6B7280", _dark: "#9CA3AF" },
        },
        "fg.subtle": {
          value: { base: "#9CA3AF", _dark: "#6B7280" },
        },
      },
    },
    recipes: {
      badge: badgeRecipe,
      button: buttonRecipe,
      input: inputRecipe,
      textarea: textareaRecipe,
    },
    slotRecipes: {
      card: cardSlotRecipe,
      table: tableSlotRecipe,
      tabs: tabsSlotRecipe,
      nativeSelect: nativeSelectSlotRecipe,
      select: selectSlotRecipe,
      menu: menuSlotRecipe,
      dialog: dialogSlotRecipe,
      drawer: drawerSlotRecipe,
      checkboxCard: checkboxCardSlotRecipe,
      emptyState: emptyStateSlotRecipe,
      stat: statSlotRecipe,
      progress: progressSlotRecipe,
      switch: switchSlotRecipe,
      tooltip: tooltipSlotRecipe,
      checkbox: checkboxSlotRecipe,
      field: fieldSlotRecipe,
      segmentGroup: segmentGroupSlotRecipe,
      popover: popoverSlotRecipe,
      status: statusSlotRecipe,
      avatar: avatarSlotRecipe,
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
export default system;
