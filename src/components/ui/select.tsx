import { Select as ChakraSelect, Portal } from "@chakra-ui/react"
import * as React from "react"

export interface SelectTriggerProps extends ChakraSelect.ControlProps {
  clearable?: boolean
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(function SelectTrigger(props, ref) {
  const { clearable, children, ...rest } = props
  return (
    <ChakraSelect.Control {...rest}>
      <ChakraSelect.Trigger ref={ref}>
        {children}
      </ChakraSelect.Trigger>
      <ChakraSelect.IndicatorGroup>
        {clearable && <ChakraSelect.ClearTrigger />}
        <ChakraSelect.Indicator />
      </ChakraSelect.IndicatorGroup>
    </ChakraSelect.Control>
  )
})

export interface SelectContentProps extends ChakraSelect.ContentProps {
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement>
}

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(function SelectContent(props, ref) {
  const { portalled = true, portalRef, ...rest } = props
  return (
    <Portal disabled={!portalled} container={portalRef}>
      <ChakraSelect.Positioner>
        <ChakraSelect.Content ref={ref} {...rest} />
      </ChakraSelect.Positioner>
    </Portal>
  )
})

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  ChakraSelect.ItemProps
>(function SelectItem(props, ref) {
  const { item, children, ...rest } = props
  return (
    <ChakraSelect.Item key={item.value} item={item} ref={ref} {...rest}>
      <ChakraSelect.ItemText>{children || item.label}</ChakraSelect.ItemText>
      <ChakraSelect.ItemIndicator />
    </ChakraSelect.Item>
  )
})

export const SelectValueText = ChakraSelect.ValueText
export const SelectRoot = ChakraSelect.Root
export const SelectLabel = ChakraSelect.Label
export const SelectItemGroup = ChakraSelect.ItemGroup
export const SelectItemGroupLabel = ChakraSelect.ItemGroupLabel
