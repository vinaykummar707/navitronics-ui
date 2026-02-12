// "use client";
// /*
//  * Documentation:
//  * ControlItem — https://app.subframe.com/11b10bc240cf/library?component=ControlItem_ebd0c198-1eb8-4dce-aa30-043753b381c2
//  * Icon Button — https://app.subframe.com/11b10bc240cf/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
//  * SelectionCard — https://app.subframe.com/11b10bc240cf/library?component=SelectionCard_cc47cbb4-bf13-4612-81cd-f7339404f925
//  * SelectionCardWithText — https://app.subframe.com/11b10bc240cf/library?component=SelectionCardWithText_ddf3d814-92a8-485d-84fb-a8a0af6dd41e
//  * Text Field — https://app.subframe.com/11b10bc240cf/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
//  * TextPropertiesControls — https://app.subframe.com/11b10bc240cf/library?component=TextPropertiesControls_4706f298-d7c0-434c-a1d3-858aec786daf
//  */
// // @subframe/sync-disable
// import React from "react";
// import { FeatherAlignCenter } from "@subframe/core";
// import { FeatherAlignHCenter } from "@subframe/core";
// import { FeatherAlignLeft } from "@subframe/core";
// import { FeatherAlignRight } from "@subframe/core";
// import { FeatherChevronsLeft } from "@subframe/core";
// import { FeatherChevronsRight } from "@subframe/core";
// import { FeatherMinus } from "@subframe/core";
// import { FeatherPlus } from "@subframe/core";
// import * as SubframeUtils from "../utils";
// import { ControlItem } from "./ControlItem";
// import { IconButton } from "./IconButton";
// import { SelectionCard } from "./SelectionCard";
// import { SelectionCardWithText } from "./SelectionCardWithText";
// import { TextField } from "./TextField";
// import { useFormContext } from "react-hook-form";
// import { DisplayConfigPostRequest } from "@/types/routeConfigV2";
// import useTabsStore from "@/store/useTabsStore";
// import useSimulationStore from "@/store/useSimulationStore";

// interface TextPropertiesControlsRootProps
//   extends React.HTMLAttributes<HTMLDivElement> {
//   className?: string;
//    textProperty: string
// }

// const TextPropertiesControlsRoot = React.forwardRef<
//   HTMLDivElement,
//   TextPropertiesControlsRootProps
// >(function TextPropertiesControlsRoot(
//   { className, textProperty, ...otherProps }: TextPropertiesControlsRootProps,
//   ref
// ) {

//   const { register } = useFormContext<DisplayConfigPostRequest>();
//   const selectedTab = useTabsStore((state) => state.selectedTab);
//   const selectedSimulationIndex = useSimulationStore((state) => state.selectedSimulationIndex);

//   return (
//     <div
//       className={SubframeUtils.twClassNames(
//         "flex w-full flex-col items-start gap-4",
//         className
//       )}
//       ref={ref}
//       {...otherProps}
//     >
//       <ControlItem label="Text">
//         <TextField className="h-9 grow shrink-0 basis-0" label="" helpText="">
//           <TextField.Input
//             className="h-9 w-full flex-none"
//             placeholder="Enter your text"
//             {...register(`${selectedTab}.${selectedSimulationIndex}.texts.${textProperty}.text`)}
//           />
//         </TextField>
//       </ControlItem>
//       <ControlItem label="Text Scroll Direction">
//         <div className="flex grow shrink-0 basis-0 items-center justify-center gap-1">
//           <SelectionCard icon={<FeatherChevronsLeft />} text="Label" />
//           <SelectionCard
//             selected={true}
//             icon={<FeatherAlignHCenter />}
//             text="Label"
//           />
//           <SelectionCard icon={<FeatherChevronsRight />} text="Label" />
//         </div>
//       </ControlItem>
//       <ControlItem label="Text Position">
//         <div className="flex grow shrink-0 basis-0 items-center justify-center gap-1">
//           <SelectionCard icon={<FeatherAlignLeft />} text="Label" />
//           <SelectionCard icon={<FeatherAlignCenter />} text="Label" />
//           <SelectionCard
//             selected={true}
//             icon={<FeatherAlignRight />}
//             text="Label"
//           />
//         </div>
//       </ControlItem>
//       <ControlItem label="Text Weight">
//         <div className="flex grow shrink-0 basis-0 items-center justify-center gap-1">
//           <SelectionCardWithText selected={true} title="Regular" />
//           <SelectionCardWithText selected={false} title="Bold" />
//         </div>
//       </ControlItem>
//       <ControlItem label="Text Height">
//         <div className="flex grow shrink-0 basis-0 items-center justify-end gap-1">
//           <div className="flex grow shrink-0 basis-0 items-center justify-end gap-1 self-stretch">
//             <IconButton
//               className="h-9 w-9 flex-none"
//               disabled={false}
//               variant="neutral-secondary"
//               size="medium"
//               icon={<FeatherPlus />}
//               loading={false}
//             />
//             <div className="flex h-9 grow shrink-0 basis-0 flex-col items-center justify-center gap-2 rounded-md border border-solid border-neutral-border bg-default-background">
//               <span className="text-caption font-caption text-subtext-color">
//                 16 Rows
//               </span>
//             </div>
//             <IconButton
//               className="h-9 w-9 flex-none"
//               disabled={false}
//               variant="neutral-secondary"
//               size="medium"
//               icon={<FeatherMinus />}
//               loading={false}
//             />
//           </div>
//         </div>
//       </ControlItem>
//       <ControlItem label="Scroll Speed">
//         <div className="grow shrink-0 basis-0 items-center justify-center gap-1 grid grid-cols-2">
//           <SelectionCardWithText selected={true} title="Very Fast" />
//           <SelectionCardWithText title="Fast" />
//           <SelectionCardWithText selected={false} title="Normal" />
//           <SelectionCardWithText selected={false} title="Slow" />
//           <SelectionCardWithText selected={false} title="Very Slow" />
//         </div>
//       </ControlItem>
//     </div>
//   );
// });

// export const TextPropertiesControls = TextPropertiesControlsRoot;


"use client";
import React from "react";
import { FeatherAlignCenter, FeatherAlignHCenter, FeatherAlignLeft, FeatherAlignRight, FeatherChevronsLeft, FeatherChevronsRight, FeatherMinus, FeatherPlus } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { DisplayConfigPostRequest } from "@/types/routeConfigV2";
import { useFormContext } from "react-hook-form";
import useTabsStore from "@/store/useTabsStore";
import useSimulationStore from "@/store/useSimulationStore";
import { ControlItem } from "./ControlItem";
import { SelectionCard } from "./SelectionCard";
import { SelectionCardWithText } from "./SelectionCardWithText";
import { TextField } from "./TextField";
import { IconButton } from "./IconButton";
import AutoTextGenerator from "@/components/AutoTextGenerator";
import { Select } from "./Select";
import { AVAILABLE_LANGUAGES } from "@/constants/defaultRouteValues";
import { getBitmapHeight } from "@/utils/measurements";

interface TextPropertiesControlsRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  textProperty: string;
}

const TextPropertiesControlsRoot = React.forwardRef<HTMLDivElement, TextPropertiesControlsRootProps>(
  ({ className, textProperty, ...otherProps }, ref) => {
    const { register, setValue, watch, getValues } = useFormContext<DisplayConfigPostRequest>();
    const selectedTab = useTabsStore((state) => state.selectedTab);
    const selectedSimulationIndex = useSimulationStore((state) => state.selectedSimulationIndex);
    const pathBase = `${selectedTab}.${selectedSimulationIndex}.texts.${textProperty}`;

    const isSelected = (field: string, value: string | number) => watch(`${pathBase}.${field}`) === value;
    const handleSelection = (field: string, value: string | number) => setValue(`${pathBase}.${field}`, value);
    const handleIncrement = () => {
    const currentHeight = getValues(`${pathBase}.fontHeight`) as number;
    setValue(`${pathBase}.fontHeight`, Math.min(32, currentHeight + 1));
  };

  const handleDecrement = () => {
    const currentHeight = getValues(`${pathBase}.fontHeight`) as number;
    setValue(`${pathBase}.fontHeight`, Math.max(1, currentHeight - 1));
  };
    return (
      <div className={SubframeUtils.twClassNames("flex w-full flex-col items-start gap-4", className)} ref={ref} {...otherProps}>
         <ControlItem label="Choose Language">
          <Select
            value={watch(`${pathBase}.language`)}
            onValueChange={(value) => setValue(`${pathBase}.language`, value)}
            className="w-full"
          >
           {AVAILABLE_LANGUAGES.map(lang => (
            <Select.Item key={lang.code} value={lang.code}>{lang.label}</Select.Item>
           ))}
          </Select>
        </ControlItem>
        <ControlItem label="Text">
          <TextField className="h-9 grow shrink-0 basis-0" label="" helpText="">
            <TextField.Input
              className="h-9 w-full flex-none"
              placeholder="Enter your text"
              {...register(`${pathBase}.text`)}
            />
          </TextField>
        </ControlItem>

        <ControlItem label="Auto Text Generator">
          <AutoTextGenerator route={watch()} targetLang={watch(`${pathBase}.language`)} onSelect={(value) => setValue(`${pathBase}.text`, value)} />
        </ControlItem>
        <ControlItem label="Text Scroll Direction">
          <div className="flex grow shrink-0 basis-0 items-center justify-center gap-1">
            <SelectionCard icon={<FeatherChevronsLeft />} text="Label" onClick={() => handleSelection("scrollType", "Right To Left")} selected={isSelected("scrollType", "Right To Left")} />
            <SelectionCard icon={<FeatherAlignHCenter />} text="Label" onClick={() => handleSelection("scrollType", "Fixed")} selected={isSelected("scrollType", "Fixed")} />
            <SelectionCard icon={<FeatherChevronsRight />} text="Label" onClick={() => handleSelection("scrollType", "Left To Right")} selected={isSelected("scrollType", "Left To Right")} />
          </div>
        </ControlItem>
        <ControlItem label="Text Position">
          <div className="flex grow shrink-0 basis-0 items-center justify-center gap-1">
            <SelectionCard icon={<FeatherAlignLeft />} text="Label" onClick={() => handleSelection("position", "Left")} selected={isSelected("position", "Left")} />
            <SelectionCard icon={<FeatherAlignCenter />} text="Label" onClick={() => handleSelection("position", "Center")} selected={isSelected("position", "Center")} />
            <SelectionCard icon={<FeatherAlignRight />} text="Label" onClick={() => handleSelection("position", "Right")} selected={isSelected("position", "Right")} />
          </div>
        </ControlItem>
        <ControlItem label="Text Weight">
          <div className="flex grow shrink-0 basis-0 items-center justify-center gap-1">
            <SelectionCardWithText title="Regular" onClick={() => handleSelection("fontWeight", "Regular")} selected={isSelected("fontWeight", "Regular")} />
            <SelectionCardWithText title="Bold" onClick={() => handleSelection("fontWeight", "Bold")} selected={isSelected("fontWeight", "Bold")} />
          </div>
        </ControlItem>
         <ControlItem label="Text Height">
      <div className="flex grow shrink-0 basis-0 items-center justify-end gap-1 self-stretch">
        <IconButton
          className="h-9 w-9 flex-none"
          variant="neutral-secondary"
          size="medium"
          icon={<FeatherPlus />}
          onClick={handleIncrement}
        />
        <div className="flex h-9 grow shrink-0 basis-0 flex-col items-center justify-center gap-2 rounded-md border border-solid border-neutral-border bg-default-background">
          <span className="text-caption font-caption text-subtext-color">
            {getValues(`${pathBase}.fontHeight`)} (Bitmap-{getBitmapHeight(getValues(`${pathBase}.bitmap`))})
          </span>
        </div>
        <IconButton
          className="h-9 w-9 flex-none"
          variant="neutral-secondary"
          size="medium"
          icon={<FeatherMinus />}
          onClick={handleDecrement}
        />
      </div>
    </ControlItem>
        <ControlItem label="Scroll Speed">
          <div className="grow shrink-0 basis-0 items-center justify-center gap-1 grid grid-cols-1">
            <SelectionCardWithText title="Very Fast" onClick={() => handleSelection("scrollSpeed",1)} selected={isSelected("scrollSpeed", 1)} />
            <SelectionCardWithText title="Medium Fast" onClick={() => handleSelection("scrollSpeed",3)} selected={isSelected("scrollSpeed", 3)} />
            <SelectionCardWithText title="Normal" onClick={() => handleSelection("scrollSpeed",4)} selected={isSelected("scrollSpeed", 4)} />
            <SelectionCardWithText title="Slow" onClick={() => handleSelection("scrollSpeed",6)} selected={isSelected("scrollSpeed", 6)} />
            <SelectionCardWithText title="Very Slow" onClick={() => handleSelection("scrollSpeed",9)} selected={isSelected("scrollSpeed", 9)} />
          </div>
        </ControlItem>
      </div>
    );
  }
);

export const TextPropertiesControls = TextPropertiesControlsRoot;