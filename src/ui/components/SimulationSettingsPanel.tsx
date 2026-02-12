"use client";
/*
 * Documentation:
 * ControlAccordion — https://app.subframe.com/11b10bc240cf/library?component=ControlAccordion_02fd28eb-e693-4480-aa67-324390fa558c
 * FormatSelectionControl — https://app.subframe.com/11b10bc240cf/library?component=FormatSelectionControl_39266a01-1738-455d-a867-d19c3c6c2938
 * HeightControl — https://app.subframe.com/11b10bc240cf/library?component=HeightControl_c59f947a-0310-4574-b7c8-ba7e56d2f8f5
 * Icon with background — https://app.subframe.com/11b10bc240cf/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 * PanelHeader — https://app.subframe.com/11b10bc240cf/library?component=PanelHeader_286b22f5-d2e6-41bd-bbab-508f594b21cc
 * SelectionCardWithText — https://app.subframe.com/11b10bc240cf/library?component=SelectionCardWithText_ddf3d814-92a8-485d-84fb-a8a0af6dd41e
 * SimulationSettingsPanel — https://app.subframe.com/11b10bc240cf/library?component=SimulationSettingsPanel_0df56ea1-d9ba-4b7a-8f9a-27e6e907b44d
 * SimulationTypeControl — https://app.subframe.com/11b10bc240cf/library?component=SimulationTypeControl_1a8f29d0-cff7-4376-987d-bb3fa1be4b7d
 * WidthControl — https://app.subframe.com/11b10bc240cf/library?component=WidthControl_78413c09-bee6-4d5f-a6b2-4bb68f45b0cf
 */

import React, { useEffect } from "react";
import { FeatherCopy, FeatherMapPin, FeatherMusic } from "@subframe/core";
import * as SubframeUtils from "../utils";
import { ControlAccordion } from "./ControlAccordion";
import { FormatSelectionControl } from "./FormatSelectionControl";
import { HeightControl } from "./HeightControl";
import { IconWithBackground } from "./IconWithBackground";
import { PanelHeader } from "./PanelHeader";
import { SelectionCardWithText } from "./SelectionCardWithText";
import { SimulationTypeControl } from "./SimulationTypeControl";
import { WidthControl } from "./WidthControl";
import useSimulationStore from "@/store/useSimulationStore";
import { useFormContext, useWatch } from "react-hook-form";
import { DisplayConfigPostRequest } from "@/types/routeConfigV2";
import useTabsStore from "@/store/useTabsStore";
import { set } from "zod";
import { Button } from "./Button";
import { generateAudio, uploadAudio } from "@/utils/fetchTTS";
import { useStops } from "@/api/stop/hooks";
import { useOrganizationStore } from "@/store/useOrganizationStore";
import { useParams } from "react-router-dom";
import { Select } from "./Select";

interface SimulationSettingsPanelRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const SimulationSettingsPanelRoot = React.forwardRef<
  HTMLDivElement,
  SimulationSettingsPanelRootProps
>(function SimulationSettingsPanelRoot(
  { className, ...otherProps }: SimulationSettingsPanelRootProps,
  ref,
) {
  const methods = useFormContext<DisplayConfigPostRequest>();
  const { watch } = methods;
  const selectedTab = useTabsStore((state) => state.selectedTab);
  const selectedSimulation = useSimulationStore((state) => state.selectedSimulation);
  const selectedSimulationIndex = useSimulationStore((state) => state.selectedSimulationIndex);
  const setSelectedSimulation = useSimulationStore((state) => state.setSelectedSimulation);
  const simulations = watch(selectedTab);
  const [audioFile, setAudioFile] = React.useState<File | null>(null);
  const [finalAudio, setFinalAudio] = React.useState<HTMLAudioElement | null>(null);
  const [generatingAudio, setGeneratingAudio] = React.useState(false);
  const [isLooping, setIsLooping] = React.useState(false);


  // get depot id from params
  const { areaId, depotId } = useParams<{ areaId: string; depotId: string }>();

  const { selectedOrganization } = useOrganizationStore()

  const { data: stops } = useStops({
    variables: {
      organization_id: selectedOrganization?.id || "",
      depot_id: depotId || "",
    },
  });




  //copy all simulations to from selected tab to another tab by appending to the end of the simulations array in the destination tab
  const copySimulations = (destinationTab: string) => {
    const sourceSimulations = simulations;
    const destinationSimulations = watch(destinationTab);
    const updatedDestinationSimulations = [...destinationSimulations, ...sourceSimulations];
    // Update the destination tab with the copied simulations
    methods.setValue(destinationTab, updatedDestinationSimulations);
  };


  // generate audio on demand and play it on demand as well - we can use the generateAudio function from utils/fetchTTS and then create a URL for the generated audio file and play it using an HTMLAudioElement
  const generateAndPlayAudio = async () => {
    setGeneratingAudio(true);
    setFinalAudio(null);
    console.log(simulations[selectedSimulationIndex])
    const { text, upperHalfText, lowerHalfText, sideText } = simulations[selectedSimulationIndex]?.texts || {};
    try {
      const textToConvert = text.text || upperHalfText?.text || lowerHalfText?.text || sideText?.text || "No text available";
      const audioFile = await generateAudio(textToConvert, `${text.language}-IN`, "arya");
      const audioUrl = URL.createObjectURL(audioFile);
      const audio = new Audio(audioUrl);
      setAudioFile(audioFile);
      setFinalAudio(audio);
      setGeneratingAudio(false);
    } catch (error) {
      console.error("Error generating audio:", error);
      setGeneratingAudio(false);
      return;
    }

  };

  const handleLoop = () => {
    if (finalAudio) {
      finalAudio.loop = true;
      finalAudio.play();
      setIsLooping(true);
    }
  }

  const stopLoopingAudio = () => {
    if (finalAudio) {
      finalAudio.loop = false;
      finalAudio.pause();
      finalAudio.currentTime = 0;
      setIsLooping(false);
    }
  }


  // handle latitude and longitude change for route simulation - we can store the selected latitude and longitude in the simulation object in the form and then use it to display the route on the simulation player panel
  const handleLatLngChange = (value: string) => {
    const [latitude, longitude] = value.split(",").map(Number);
    const updatedSimulation = {
      ...simulations[selectedSimulationIndex],
      latitude: latitude,
      longitude: longitude,
    };
    methods.setValue(`${selectedTab}[${selectedSimulationIndex}]`, updatedSimulation);
  };

  // upload audio file to supabase and get the public URL and then update the simulation object in the form with the audio file URL so that it can be used in the simulation player panel to play the audio from the URL
  const uploadAudioAndSetUrl = async () => {
    try {
      const { fileUrl } = await uploadAudio(audioFile as File, audioFile, "route-audios", `${depotId}`, simulations[selectedSimulationIndex]?.texts.text.language || "en-IN");
      const updatedSimulation = {
        ...simulations[selectedSimulationIndex],
        audioFileUrl: fileUrl,
      };
      methods.setValue(`${selectedTab}[${selectedSimulationIndex}]`, updatedSimulation);
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };

  const audiopath = methods.watch(`${selectedTab}[${selectedSimulationIndex}].audioFileUrl`);
  const currentSimulation = simulations[selectedSimulationIndex];
  // useEffect(() => {
   
  // }, [currentSimulation]);

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-full w-64 flex-col items-start overflow-y-auto no-scrollbar",
        className,
      )}
      ref={ref}
      {...otherProps}
    >
      <PanelHeader title="Simulation Settings" />
      {simulations[selectedSimulationIndex] && (
        <>
          <SimulationTypeControl />
          <FormatSelectionControl />
          <HeightControl />
          <WidthControl />


        </>
      )}

      {simulations[selectedSimulationIndex] && simulations[selectedSimulationIndex]?.type !== 'route' &&
        <>
          <ControlAccordion
            title="Audio"
            controls={
              <div className="w-full items-center justify-center flex flex-col gap-2">
                {(audioFile || audiopath) && (
                  <>
                    {audiopath &&
                    <>
                     <audio controls src={ audiopath  } className="w-full" />
                     <Button variant={isLooping ? "neutral-secondary" : "brand-secondary"} size="medium" className="w-full" onClick={isLooping ? stopLoopingAudio : handleLoop} disabled={generatingAudio}>
                      {isLooping ? "Stop Loop" : "Play in Loop"}
                    </Button>
                    </>
                     }


                    

                    <Button variant="neutral-primary" size="medium" className="w-full" onClick={uploadAudioAndSetUrl} disabled={generatingAudio}>
                      Upload To Server
                    </Button>

                    <Button variant="destructive-secondary" size="medium" className="w-full" onClick={() => setAudioFile(null)} disabled={generatingAudio}>
                      Discard
                    </Button>
                    <Button variant="brand-primary" size="medium" className="w-full" onClick={generateAndPlayAudio} disabled={generatingAudio}>
                      {generatingAudio ? "Generating..." : "Re-generate Audio"}
                    </Button>
                  </>

                )}
                {currentSimulation && !currentSimulation.audioFileUrl && <Button variant="brand-primary" size="medium" className="w-full" onClick={generateAndPlayAudio} disabled={generatingAudio}>
                  {generatingAudio ? "Generating..." : "Generate Audio"}
                </Button>}
              </div>
            }
            icon={
              <IconWithBackground
                variant="brand"
                size="small"
                icon={<FeatherMusic />}
                square={false}
              />
            }
          />
          {/* <ControlAccordion
            title="Latitude & Longitude"
            controls={
              <div className="w-full items-center justify-center gap-1 grid grid-cols-1">

                <span className="text-caption font-caption text-subtext-color">
                  Select the latitude and longitude for the up
                </span>

                {stops && stops.stops.length > 0 && <Select onValueChange={handleLatLngChange} className="truncate text-xs" placeholder="Up Latitude and Longitude">
                  {stops.stops?.map((stop) => (
                    <Select.Item key={stop.id} value={`${stop.up_latitude},${stop.up_longitude}`}>
                      {stop.name} - {`(${stop.up_latitude}, ${stop.up_longitude})`}
                    </Select.Item>
                  ))}
                </Select>}
                <span className="text-caption font-caption text-subtext-color">
                  Select the latitude and longitude for the return
                </span>
                {stops && stops.stops.length > 0 && <Select onValueChange={handleLatLngChange} className="truncate text-xs" placeholder="Down Latitude and Longitude">
                  {stops.stops?.map((stop) => (
                    <Select.Item key={stop.id} value={`${stop.down_latitude},${stop.down_longitude}`}>
                      {stop.name} - {`(${stop.down_latitude}, ${stop.down_longitude})`}
                    </Select.Item>
                  ))}
                </Select>}

              </div>
            }
            icon={
              <IconWithBackground
                variant="brand"
                size="small"
                icon={<FeatherMapPin />}
                square={false}
              />
            }
          /> */}
        </>}

      {currentSimulation && currentSimulation.type !== 'stop' && <ControlAccordion
        title="Copy Simulations"
        controls={
          <div className="w-full items-center justify-center gap-1 grid grid-cols-2">
            {selectedTab !== "front" && <SelectionCardWithText title="Front" onClick={() => copySimulations("front")} />}
            {selectedTab !== "side" && <SelectionCardWithText title="Side" onClick={() => copySimulations("side")} />}
            {selectedTab !== "rear" && <SelectionCardWithText title="Rear" onClick={() => copySimulations("rear")} />}
            {selectedTab !== "internal" && <SelectionCardWithText title="Internal" onClick={() => copySimulations("internal")} />}
          </div>
        }
        icon={
          <IconWithBackground
            variant="warning"
            size="small"
            icon={<FeatherCopy />}
            square={false}
          />
        }
      />}
      {!simulations[selectedSimulationIndex] && (
        <div className="flex h-full w-full p-6 items-center justify-center">
          <p className="text-xs text-center font-heading-3  text-subtext-color">
            Select a simulation or add simulation to edit its settings.
          </p>
        </div>
      )}
    </div>
  );
});

export const SimulationSettingsPanel = SimulationSettingsPanelRoot;
