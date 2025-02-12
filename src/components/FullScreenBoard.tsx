import { useEffect, useState, useRef } from "react";
import "./LedSignBoard.css";

const FullScreenBoard = ({ formData }: any) => {
  const { text, scrollType, scrollSpeed, position, fontWeight } = formData;
  const [scrollEnabled, setScrollEnabled] = useState(scrollSpeed);
  const [computedSpeed, setComputedSpeed] = useState(scrollSpeed); // Dynamic speed
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (scrollType === "Fixed" || scrollType === "Flashing") {
      setScrollEnabled(false);
    } else {
      setScrollEnabled(true);
    }

    console.log(formData);
  }, [scrollType]);

  useEffect(() => {
    if (scrollType === "Left To Right" || scrollType === "Right To Left") {
      if (textRef.current) {
        const textWidth = textRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        const newSpeed = Math.max(3, (textWidth / viewportWidth) * scrollSpeed);
        setComputedSpeed(newSpeed);
      }
    }
  }, [text, scrollSpeed]);

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
                ${scrollType === "Flicker" && getPositionClassFlicker()}
                ${!scrollEnabled ? "paused" : ""}
                ${scrollType === "Left To Right" && "marquee-left"}
                ${scrollType === "Right To Left" && "marquee"}
              `}
                  style={{
                    "--scroll-speed": `${computedSpeed}s`,
                  } as React.CSSProperties} // TypeScript fix
              >
              <span ref={textRef} className={`${fontWeight}`}>
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
