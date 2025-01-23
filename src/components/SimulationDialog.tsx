import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import FullScreenBoard from "./FullScreenBoard";
import SideWithSingleTextBoard from "./SideWithSingleTextBoard";
import SideWithTwoTextsBoard from "./SideWithTwoHalfsBoard";

const SimulationDialog = ({
  displayConfig,
  showSimulation,
  route,
  closeSimulation,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  return (
    <Dialog.Root open={showSimulation}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 overflow-hidden  bg-neutral-900 opacity-85 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed overflow-scroll left-1/2 top-1/2 h-[500px]  flex flex-col gap-4 items-center  -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none data-[state=open]:animate-contentShow">
          <div className="flex flex-row-reverse w-full items-center justify-between">
            <button
              onClick={closeSimulation}
              className=" px-4 py-2 bg-red-600 text-white text-md rounded-lg"
            >
              Stop Simulation
            </button>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-neutral-800" htmlFor="">
                Select Language
              </label>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
              >
                {Object.keys(displayConfig).map((language) => (
                  <option key={language} value={language}>
                    {" "}
                    {language}{" "}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-col-2">
            {Object.keys(displayConfig[selectedLanguage]).map((side) => {
              return (
                <div key={side}>
                  <h2>{side}</h2>

                  {displayConfig[selectedLanguage][side].boardFormatType ===
                    "Fullscreen" && (
                    <FullScreenBoard
                      formData={displayConfig[selectedLanguage][side]}
                    />
                  )}

                  {displayConfig[selectedLanguage][side].boardFormatType ===
                    "sideWithSingleText" && (
                    <SideWithSingleTextBoard
                      route={route}
                      formData={displayConfig[selectedLanguage][side]}
                    />
                  )}

                  {displayConfig[selectedLanguage][side].boardFormatType ===
                    "sideWithTwoTexts" && (
                    <SideWithTwoTextsBoard
                      route={route}
                      formData={displayConfig[selectedLanguage][side]}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SimulationDialog;
