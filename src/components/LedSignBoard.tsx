import { useEffect, useState } from "react";
import "./LedSignBoard.css";

const LedSignBoard = ({ config, selectedTab }) => {
  // const { routeNumber, source, destination, via } = config[selectedTab];

  const [busNumber, setBusNumber] = useState();
  const [topText, setTopText] = useState();
  const [bottomText, setBottomText] = useState();
  const [topScrollSpeed, setTopScrollSpeed] = useState();
  const [bottomScrollSpeed, setBottomScrollSpeed] = useState();
  const [topScrollEnabled, setTopScrollEnabled] = useState();
  const [bottomScrollEnabled, setBottomScrollEnabled] = useState();

  useEffect(() => {
    if (
      config[selectedTab]["source"].scrollType === "Fixed" ||
      config[selectedTab]["source"].scrollType === "Flashing"
    ) {
      setTopScrollEnabled(false);
    } else {
      setTopScrollEnabled(true);
    }
    if (
      config[selectedTab]["via"].scrollType === "Fixed" ||
      config[selectedTab]["via"].scrollType === "Flashing"
    ) {
      setBottomScrollEnabled(false);
    } else {
      setBottomScrollEnabled(true);
    }
    setBusNumber(config[selectedTab]["routeNumber"].text);

    setTopText(
      config[selectedTab]["source"].size === "Upper Half"
        ? `${config[selectedTab]["source"].text} - ${config[selectedTab]["destination"].text}`
        : config[selectedTab]["via"].text
    );
    setBottomText(
      config[selectedTab]["source"].size === "Lower Half"
        ? `${config[selectedTab]["source"].text} - ${config[selectedTab]["destination"].text}`
        : config[selectedTab]["via"].text
    );
    setTopScrollSpeed(config[selectedTab]["source"].scrollSpeed);
    setBottomScrollSpeed(config[selectedTab]["via"].scrollSpeed);
    // console.log(config[selectedTab]["source"].scrollType);
  }, [config, selectedTab]);

  // Convert speed value (1-10) to seconds (faster = fewer seconds)
  const convertSpeedToSeconds = (speed) => (10 - speed) * 2;

  // useEffect(() => {
  // 	if (upperHalfScrollType !== 'Fixed' && upperHalfScrollType !== 'Flashing') {
  // 		setTopScrollEnabled(true);
  // 	}
  // 	if (lowerHalfScrollType !== 'Fixed' && lowerHalfScrollType !== 'Flashing') {
  // 		setTopScrollEnabled(true);
  // 	}
  // }, [upperHalfScrollType, lowerHalfScrollType]);

  if (
    config[selectedTab]["routeNumber"].size === "Full Screen" &&
    config[selectedTab]["routeNumber"].show === "true"
  ) {
    return (
      <div className="w-full mt-8">
        <div className="led-sign-board">
          {config[selectedTab]["routeNumber"].show === "true" && (
            <div className="left-half">
              <div className="led-display">{busNumber}</div>
            </div>
          )}
          {/* <div className="right-half">
						{config[selectedTab]['source'].show === 'true' && (
							<div className="top-section">
								<div
									className={`${
										config[selectedTab]['source'].scrollType === 'Left to Right'
											? 'marquee-left'
											: 'marquee'
									} ${!topScrollEnabled ? 'paused' : ''}`}
									style={{
										'--scroll-speed': `${topScrollSpeed}s`,
									}}
								>
									<span>{topText}</span>
								</div>
							</div>
						)}
						{config[selectedTab]['via'].show === 'true' && (
							<div className="bottom-section">
								<div
									className={`${
										config[selectedTab]['via'].scrollType === 'Left to Right'
											? 'marquee-left'
											: 'marquee'
									} ${!bottomScrollEnabled ? 'paused' : ''}`}
									style={{
										'--scroll-speed': `${bottomScrollSpeed}s`,
									}}
								>
									<span>{bottomText}</span>
								</div>
							</div>
						)}
					</div> */}
        </div>
      </div>
    );
  }

  if (
    config[selectedTab]["source"].size === "Full Screen" &&
    config[selectedTab]["source"].show === "true"
  ) {
    return (
      <div className="w-full mt-8">
        <div className="led-sign-board">
          <div className="right-half">
            {config[selectedTab]["source"].show === "true" && (
              <div className="top-section">
                <div
                  className={`${
                    config[selectedTab]["source"].scrollType === "Left to Right"
                      ? "marquee-left"
                      : "marquee"
                  } ${!topScrollEnabled ? "paused" : ""}`}
                  style={{
                    "--scroll-speed": `${topScrollSpeed}s`,
                  }}
                >
                  <span>{topText}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (
    config[selectedTab]["via"].size === "Full Screen" &&
    config[selectedTab]["via"].show === "true"
  ) {
    return (
      <div className="w-full mt-8">
        <div className="led-sign-board">
          <div className="right-half">
            {config[selectedTab]["via"].show === "true" && (
              <div className="bottom-section">
                <div
                  className={`${
                    config[selectedTab]["via"].scrollType === "Left to Right"
                      ? "marquee-left"
                      : "marquee"
                  } ${!bottomScrollEnabled ? "paused" : ""}`}
                  style={{
                    "--scroll-speed": `${bottomScrollSpeed}s`,
                  }}
                >
                  <span>{bottomText}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-8">
      <div className="led-sign-board">
        {config[selectedTab]["routeNumber"].show === "true" && (
          <div className="left-half">
            <div className="led-display">{busNumber}</div>
          </div>
        )}
        <div className="right-half">
          {config[selectedTab]["source"].show === "true" && (
            <div className="top-section">
              <div
                className={`${
                  config[selectedTab]["source"].scrollType === "Left to Right"
                    ? "marquee-left"
                    : "marquee"
                } ${!topScrollEnabled ? "paused" : ""}`}
                style={{
                  "--scroll-speed": `${topScrollSpeed}s`,
                }}
              >
                <span>{topText}</span>
              </div>
            </div>
          )}
          {config[selectedTab]["via"].show === "true" && (
            <div className="bottom-section">
              <div
                className={`${
                  config[selectedTab]["via"].scrollType === "Left to Right"
                    ? "marquee-left"
                    : "marquee"
                } ${!bottomScrollEnabled ? "paused" : ""}`}
                style={{
                  "--scroll-speed": `${bottomScrollSpeed}s`,
                }}
              >
                <span>{bottomText}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* <div className="controls">
                <div className="controls-row">
                    <div className="bus-number-section">
                        <h3>Bus Number</h3>
                        <div className="control-group">
                            <input
                                type="text"
                                value={busNumber}
                                onChange={(e) => setBusNumber(e.target.value)}
                                maxLength={4}
                            />
                        </div>
                    </div>
                    
                    <div className="message-controls">
                        <div className="control-section">
                            <h3>Top Message</h3>
                            <div className="control-group">
                                <label>Text:</label>
                                <input
                                    type="text"
                                    value={topText}
                                    onChange={(e) => setTopText(e.target.value)}
                                />
                            </div>
                            <div className="control-group">
                                <label>Speed:</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={topScrollSpeed}
                                    onChange={(e) => setTopScrollSpeed(Number(e.target.value))}
                                    disabled={!topScrollEnabled}
                                />
                                <span>{topScrollSpeed}</span>
                            </div>
                            <div className="control-group">
                                <label>Scroll:</label>
                                <input
                                    type="checkbox"
                                    checked={topScrollEnabled}
                                    onChange={(e) => setTopScrollEnabled(e.target.checked)}
                                />
                            </div>
                        </div>
                        
                        <div className="control-section">
                            <h3>Bottom Message</h3>
                            <div className="control-group">
                                <label>Text:</label>
                                <input
                                    type="text"
                                    value={bottomText}
                                    onChange={(e) => setBottomText(e.target.value)}
                                />
                            </div>
                            <div className="control-group">
                                <label>Speed:</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={bottomScrollSpeed}
                                    onChange={(e) => setBottomScrollSpeed(Number(e.target.value))}
                                    disabled={!bottomScrollEnabled}
                                />
                                <span>{bottomScrollSpeed}</span>
                            </div>
                            <div className="control-group">
                                <label>Scroll:</label>
                                <input
                                    type="checkbox"
                                    checked={bottomScrollEnabled}
                                    onChange={(e) => setBottomScrollEnabled(e.target.checked)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}
    </div>
  );
};
export default LedSignBoard;
