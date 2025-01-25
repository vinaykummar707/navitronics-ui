import { useState } from "react";

const RouteLanguageSettings = ({
  languageOptions,
  languageConfig,
  handleLanguageConfigChange,
}) => {
  return (
    <div className="">
      <div className="flex flex-col gap-8 p-6 bg-white w-full items-start rounded-lg border border-neutral-300">
        <h1 className="text-lg text-neutral-800 font-bold">
          Route Language Settings
        </h1>

        {languageConfig.map((config, index) => (
          <div
            key={index}
            className=" grid sm:grid-cols-3  md:grid-cols-4  w-full gap-4 "
          >
            <div className="flex flex-col gap-3">
              <label
                className="text-sm text-neutral-500"
                htmlFor=""
              >
                {`Language ${index + 1}`}
              </label>
              <select
                name="language"
                className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                required
                defaultValue={config.language}
                onChange={(e) =>
                  handleLanguageConfigChange(index, "language", e.target.value)
                }
              >
                {languageOptions.languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            {/* <div className="flex flex-col gap-3">
							<label
								className="text-sm text-neutral-500"
								htmlFor=""
							>
								Font
							</label>
							<select
								name="fontFamily"
								defaultValue={config.fontFamily}
								className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
								required
								onChange={(e) =>
									handleLanguageConfigChange(
										index,
										'fontFamily',
										e.target.value
									)
								}
							>
								{languageOptions.fontFamilies.map((font) => (
									<option key={font} value={font}>
										{font}
									</option>
								))}
							</select>
						</div> */}

            <div className="flex flex-col gap-3">
              <label
                className="text-sm text-neutral-500"
                htmlFor=""
              >
                Font Weight
              </label>
              <select
                name="fontWeight"
                className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                required
                defaultValue={config.fontWeight}
                onChange={(e) =>
                  handleLanguageConfigChange(
                    index,
                    "fontWeight",
                    e.target.value
                  )
                }
              >
                {languageOptions.fontWeights.map((weight) => (
                  <option key={weight} value={weight}>
                    {weight}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <label
                className="text-sm text-neutral-500"
                htmlFor=""
              >
                Font Size
              </label>
              <input
                min={6}
                max={16}
                name="fontSize"
                type="number"
                defaultValue={config.fontSize}
                className="border border-neutral-300 text-neutral-900 text-sm p-2 rounded-lg"
                onChange={(e) =>
                  handleLanguageConfigChange(index, "fontSize", e.target.value)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteLanguageSettings;
