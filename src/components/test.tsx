import { memo, useEffect, useState } from "react";
import FullScreenBoard from "./FullScreenBoard";
import SideWithSingleTextBoard from "./SideWithSingleTextBoard";
import SideWithTwoTextsBoard from "./SideWithTwoHalfsBoard";
import axios from "axios";
import * as Dialog from "@radix-ui/react-dialog";

const Bus = memo(
  ({
    route,
    onUpdateDisplaySettings,
    languageConfig,
    onBoardLanugageChange,
  }) => {
    const boardFormatTypes = [
      "Fullscreen",
      "sideWithSingleText",
      "sideWithTwoTexts",
    ];

    useEffect(() => {
      // console.log("rendered bus");
    }, []);

    const defaultConfig = (boardFormatType) => {
      switch (boardFormatType) {
        case "Fullscreen":
          return {
            boardFormatType: "Fullscreen",
            text: `${route.source} ${route.separation} ${route.destination}`,
            scrollType: "Fixed",
            scrollSpeed: 0,
            position: "Center",
          };
        case "sideWithSingleText":
          return {
            boardFormatType: "sideWithSingleText",
            sideText: route.routeNumber,
            text: `${route.source} ${route.separation} ${route.destination} ${route.via}`,
            scrollType: "Fixed",
            scrollSpeed: 0,
            position: "Center",
            routeUpperHalfText: route.routeNumberUpperHalf,
            routeLowerHalfText: route.routeNumberLowerHalf,
          };
        case "sideWithTwoTexts":
          return {
            boardFormatType: "sideWithTwoTexts",
            sideText: route.routeNumber,
            upperHalfText: `${route.source} ${route.separation} ${route.destination}`,
            upperHalfScrollType: "Fixed",
            upperHalfScrollSpeed: 0,
            upperHalfPosition: "Center",
            lowerHalfText: route.via,
            lowerHalfScrollType: "Fixed",
            lowerHalfScrollSpeed: 0,
            lowerHalfPosition: "Center",
            routeUpperHalfText: route.routeNumberUpperHalf,
            routeLowerHalfText: route.routeNumberLowerHalf,
          };
        default:
          return {};
      }
    };
    const BusBoardConfigurator = () => {
      const [config, setConfig] = useState({
        front: defaultConfig("sideWithTwoTexts"),
        side: defaultConfig("sideWithTwoTexts"),
        rear: defaultConfig("sideWithTwoTexts"),
        internal: defaultConfig("sideWithTwoTexts"),
      });

      // const [selectedLanguage, setSelectedLanguage] = useState();

      //

      // Trigger the parent update function whenever config changes
      useEffect(() => {
        onUpdateDisplaySettings(config);
      }, [config, onUpdateDisplaySettings]);

      const handleChange = (side, key, value) => {
        setConfig((prev) => {
          if (key === "boardFormatType") {
            return {
              ...prev,
              [side]: defaultConfig(value), // Reset config for the new board format type
            };
          }
          return {
            ...prev,
            [side]: {
              ...prev[side],
              [key]: value,
            },
          };
        });
      };

      return (
        <div className="flex flex-col gap-4 px-6 py-6 shadow-sm bg-white w-full items-start rounded-lg border border-neutral-300">
          <div className="flex w-full flex-row justify-between items-center">
            <h1 className="text-lg text-neutral-800 font-bold">
              Route Display Settings
            </h1>

            {/* <div className="flex flex-col gap-1">
              <label className="text-sm text-neutral-500" htmlFor="">
                Select Language
              </label>

              <select
                value={selectedLanguage}
                onChange={onlanguagechange}
                className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
              >
                {languageConfig.map((language) => (
                  <option key={language.language} value={language.language}>
                    {" "}
                    {language.language}{" "}
                  </option>
                ))}
              </select>
            </div> */}
          </div>

          <div className="grid grid-cols-2  gap-x-4 w-full gap-y-4">
            {Object.keys(config).map((side) => (
              <div
                className="flex flex-col w-full bg-neutral-50 p-4  rounded-lg  gap-2"
                key={side}
              >
                <h3 className="text-sm font-bold">
                  {side.toUpperCase()} DISPLAY
                </h3>
                <select
                  value={config[side].boardFormatType}
                  onChange={(e) =>
                    handleChange(side, "boardFormatType", e.target.value)
                  }
                  className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                >
                  {boardFormatTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <DisplayForm
                  config={config[side]}
                  onConfigChange={(key, value) =>
                    handleChange(side, key, value)
                  }
                />

                {/* {config[side].boardFormatType === "Fullscreen" && (
                  <FullScreenBoard formData={config[side]} />
                )}

                {config[side].boardFormatType === "sideWithSingleText" && (
                  <SideWithSingleTextBoard
                    route={route}
                    formData={config[side]}
                  />
                )}

                {config[side].boardFormatType === "sideWithTwoTexts" && (
                  <SideWithTwoTextsBoard
                    route={route}
                    formData={config[side]}
                  />
                )} */}
              </div>
            ))}
          </div>

          {/* <JsonOutput config={config} /> */}
        </div>
      );
    };
    const DisplayForm = ({ config, onConfigChange }) => {
      const { boardFormatType } = config;

      const updateConfig = (key, value) => {
        onConfigChange(key, value);
      };

      if (boardFormatType === "Fullscreen") {
        return (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-4">
              {/* <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-900" htmlFor="">
                  Text
                </label>
                <input
                  type="text"
                  placeholder="Text"
                  value={config.text || ""}
                  onChange={(e) => updateConfig("text", e.target.value)}
                  className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                />
              </div> */}

              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-900" htmlFor="">
                  Scroll Type
                </label>
                <select
                  value={config.scrollType || "Fixed"}
                  onChange={(e) => updateConfig("scrollType", e.target.value)}
                  className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                >
                  <option value="Fixed">Fixed</option>
                  <option value="Left To Right">Left to Right</option>
                  <option value="Right To Left">Right to Left</option>
                  <option value="Flicker">Flicker</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-900" htmlFor="">
                  Scroll Speed
                </label>
                <input
                  type="number"
                  placeholder="Scroll Speed"
                  value={config.scrollSpeed || 0}
                  onChange={(e) =>
                    updateConfig("scrollSpeed", Number(e.target.value))
                  }
                  className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-900" htmlFor="">
                  Position
                </label>
                <select
                  value={config.position || "center"}
                  onChange={(e) => updateConfig("position", e.target.value)}
                  className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                >
                  <option value="Left">Left</option>
                  <option value="Center">Center</option>
                  <option value="Right">Right</option>
                </select>
              </div>
            </div>
          </div>
        );
      } else if (boardFormatType === "sideWithSingleText") {
        return (
          <div className="grid grid-cols-2 gap-4">
            {/* {!route.splitRoute && (
              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-900" htmlFor="">
                  Route Number
                </label>
                <input
                  type="text"
                  placeholder="Side Text"
                  maxLength={7}
                  disabled
                  value={config.sideText || ""}
                  className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                />
              </div>
            )} */}
            {/* {route.splitRoute && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-neutral-900" htmlFor="">
                    Route Number Upper Half
                  </label>
                  <input
                    type="text"
                    placeholder="Side Text"
                    maxLength={4}
                    disabled
                    value={config.routeUpperHalfText || ""}
                    className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-neutral-900" htmlFor="">
                    Route Number Lower Half
                  </label>
                  <input
                    type="text"
                    placeholder="Side Text"
                    maxLength={4}
                    disabled
                    value={config.routeLowerHalfText || ""}
                    className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                  />
                </div>
              </>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-neutral-900" htmlFor="">
                Text
              </label>
              <input
                type="text"
                placeholder="Text"
                value={config.text || ""}
                onChange={(e) => updateConfig("text", e.target.value)}
                className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
              />
            </div> */}

            <div className="flex flex-col gap-1">
              <label className="text-sm text-neutral-900" htmlFor="">
                Scroll Type
              </label>
              <select
                value={config.scrollType || "Fixed"}
                onChange={(e) => updateConfig("scrollType", e.target.value)}
                className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
              >
                <option value="Fixed">Fixed</option>
                <option value="Left To Right">Left to Right</option>
                <option value="Right To Left">Right to Left</option>
                <option value="Flicker">Flicker</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-neutral-900" htmlFor="">
                Scroll Speed
              </label>
              <input
                type="number"
                placeholder="Scroll Speed"
                value={config.scrollSpeed || 0}
                onChange={(e) =>
                  updateConfig("scrollSpeed", Number(e.target.value))
                }
                className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-neutral-900" htmlFor="">
                position
              </label>
              <select
                value={config.position || "center"}
                onChange={(e) => updateConfig("position", e.target.value)}
                className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
              >
                <option value="Left">Left</option>
                <option value="Center">Center</option>
                <option value="Right">Right</option>
              </select>
            </div>
          </div>
        );
      } else if (boardFormatType === "sideWithTwoTexts") {
        return (
          <div className="flex flex-col gap-2">
            {/* {!route.splitRoute && (
              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-900" htmlFor="">
                  Side Text
                </label>
                <input
                  type="text"
                  placeholder="Side Text"
                  maxLength={7}
                  disabled
                  value={config.sideText || ""}
                  className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                />
              </div>
            )}
            {route.splitRoute && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-neutral-900" htmlFor="">
                    Route Upper Half Text
                  </label>
                  <input
                    type="text"
                    placeholder="Side Text"
                    maxLength={4}
                    disabled
                    value={config.routeUpperHalfText || ""}
                    className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-neutral-900" htmlFor="">
                    Route Lower Half Text
                  </label>
                  <input
                    type="text"
                    placeholder="Side Text"
                    maxLength={4}
                    disabled
                    value={config.routeLowerHalfText || ""}
                    className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                  />
                </div>
              </>
            )} */}
            <div className="grid grid-cols-2 gap-4">

              
              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-900" htmlFor="">
                  Upper Half Text
                </label>
                <input
                  type="text"
                  placeholder="Upper Half Text"
                  value={config.upperHalfText || ""}
                  onChange={(e) =>
                    updateConfig("upperHalfText", e.target.value)
                  }
                  className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-900" htmlFor="">
                  Upper Half Scroll Type
                </label>
                <select
                  value={config.upperHalfScrollType || "Fixed"}
                  onChange={(e) =>
                    updateConfig("upperHalfScrollType", e.target.value)
                  }
                  className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                >
                  <option value="Fixed">Fixed</option>
                  <option value="Left To Right">Left to Right</option>
                  <option value="Right To Left">Right to Left</option>
                  <option value="Flicker">Flicker</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-900" htmlFor="">
                  Upper Half Scroll Speed
                </label>
                <input
                  type="number"
                  placeholder="Upper Half Scroll Speed"
                  value={config.upperHalfScrollSpeed || 0}
                  onChange={(e) =>
                    updateConfig("upperHalfScrollSpeed", Number(e.target.value))
                  }
                  className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-900" htmlFor="">
                  Upper Half Position
                </label>
                <select
                  value={config.upperHalfPosition || "top"}
                  onChange={(e) =>
                    updateConfig("upperHalfPosition", e.target.value)
                  }
                  className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                >
                  <option value="Left">Left</option>
                  <option value="Center">Center</option>
                  <option value="Right">Right</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-900" htmlFor="">
                  Lower Half Text
                </label>
                <input
                  type="text"
                  placeholder="Lower Half Text"
                  value={config.lowerHalfText || ""}
                  onChange={(e) =>
                    updateConfig("lowerHalfText", e.target.value)
                  }
                  className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-900" htmlFor="">
                  Lower Half Scroll Type
                </label>
                <select
                  value={config.lowerHalfScrollType || "Fixed"}
                  onChange={(e) =>
                    updateConfig("lowerHalfScrollType", e.target.value)
                  }
                  className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                >
                  <option value="Fixed">Fixed</option>
                  <option value="Left To Right">Left to Right</option>
                  <option value="Right To Left">Right to Left</option>
                  <option value="Flicker">Flicker</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-900" htmlFor="">
                  Lower Half Scroll Speed
                </label>
                <input
                  type="number"
                  placeholder="Lower Half Scroll Speed"
                  value={config.lowerHalfScrollSpeed || 0}
                  onChange={(e) =>
                    updateConfig("lowerHalfScrollSpeed", Number(e.target.value))
                  }
                  className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-neutral-900" htmlFor="">
                  Lower Half Position
                </label>
                <select
                  value={config.lowerHalfPosition || "bottom"}
                  onChange={(e) =>
                    updateConfig("lowerHalfPosition", e.target.value)
                  }
                  className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                >
                  <option value="Left">Left</option>
                  <option value="Center">Center</option>
                  <option value="Right">Right</option>
                </select>
              </div>
            </div>
          </div>
        );
      }

      return null;
    };

    return <BusBoardConfigurator />;
  }
);
Bus.displayName = "Bus";
export default Bus;
