import { useEffect, useState } from "react";
import "./LedSignBoard.css";

const FullScreenBoard = ({ formData }: any) => {
  // const { routeNumber, source, destination, via } = config[selectedTab];
  const { text, scrollType, scrollSpeed, position } = formData;

  const [scrollEnabled, setScrollEnabled] = useState(scrollSpeed);

  useEffect(() => {
    if (scrollType === "Fixed" || scrollType === "Flashing") {
      setScrollEnabled(false);
    } else {
      setScrollEnabled(true);
    }
  }, [scrollType]);

  const getPositionClass = () => {
    switch (position) {
      case "Left":
        return "marquee justify-start";
      case "Right":
        return "marquee justify-end";
      case "Center":
        return "marquee justify-center";

      default:
        return "marquee justify-center";
    }
  };

  const getPositionClassFlicker = () => {
    switch (position) {
      case "Left":
        return "flicker justify-start";
      case "Right":
        return "flicker justify-end";
      case "Center":
        return "flicker justify-center";

      default:
        return "flicker justify-center";
    }
  };

  return (
    <div className="w-full">
      <div className="led-sign-board">
        <div className="right-half">
          <div className="bottom-section">
            <div
              className={`
                 ${scrollType === "Fixed" && getPositionClass()}
               
                
                            ${
                              scrollType === "Flicker" &&
                              getPositionClassFlicker()
                            } ${!scrollEnabled ? "paused" : ""}
                             ${
                               scrollType === "Left To Right" && "marquee-left "
                             }
                ${scrollType === "Right To Left" && "marquee"}
              
               
              `}
              style={{
                "--scroll-speed": `${scrollSpeed}s`,
              }}
            >
              <span
                className={`${
                  (scrollType === "Left To Right" ||
                    scrollType === "Right To Left") &&
                  "w-full"
                }`}
              >
                {text}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FullScreenBoard;
