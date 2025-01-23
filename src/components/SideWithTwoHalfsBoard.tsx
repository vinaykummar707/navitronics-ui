// import { useEffect, useState } from "react";
// import "./LedSignBoard.css";

// const SideWithTwoHalfsBoard = ({
//   topText = "Dummy",
//   bottomText = "Dummy",
//   sideText = "300",
//   topScrollType = "Flicker",
//   topScrollSpeed = 1,
//   bottomScrollType = "Right To Left",
//   bottomScrollSpeed = 10,
// }) => {
//   // const { routeNumber, source, destination, via } = config[selectedTab];

//   const [topScrollEnabled, setTopScrollEnabled] = useState();
//   const [bottomScrollEnabled, setBottomScrollEnabled] = useState();

//   useEffect(() => {
//     if (topScrollType === "Fixed" || topScrollType === "Flashing") {
//       setTopScrollEnabled(false);
//     } else {
//       setTopScrollEnabled(true);
//     }

//     if (bottomScrollType === "Fixed" || bottomScrollType === "Flashing") {
//       setBottomScrollEnabled(false);
//     } else {
//       setBottomScrollEnabled(true);
//     }
//   }, [topScrollType, bottomScrollType]);

//   return (
//     <div className="w-full mt-8">
//       <div className="led-sign-board">
//         <div className="left-half">
//           <div className="led-display"> {sideText} </div>
//         </div>
//         <div className="right-half">
//           <div className="top-section">
//             <div
//               className={`
//                  ${topScrollType === "Fixed" && "marquee"}
//                 ${topScrollType === "Left To Right" && "marquee-left"}
//                 ${topScrollType === "Right To Left" && "marquee"}

//                             ${topScrollType === "Flicker" && "flicker"} ${
//                 !topScrollEnabled ? "paused" : ""
//               }`}
//               style={{
//                 "--scroll-speed": `${topScrollSpeed}s`,
//               }}
//             >
//               <span className="w-full">{topText}</span>
//             </div>
//           </div>
//           <div className="bottom-section">
//             <div
//               className={`
//                  ${bottomScrollType === "Fixed" && "marquee"}
//                 ${bottomScrollType === "Left To Right" && "marquee-left"}
//                 ${bottomScrollType === "Right To Left" && "marquee"}

//                             ${bottomScrollType === "Flicker" && "flicker"} ${
//                 !bottomScrollEnabled ? "paused" : ""
//               }`}
//               style={{
//                 "--scroll-speed": `${bottomScrollSpeed}s`,
//               }}
//             >
//               <span className="w-full">{bottomText}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default SideWithTwoHalfsBoard;

import { useEffect, useState } from "react";
import "./LedSignBoard.css";

const SideWithTwoTextsBoard = ({ route, formData }) => {
  const {
    sideText,
    upperHalfText,
    upperHalfScrollType,
    upperHalfScrollSpeed,
    upperHalfPosition,
    lowerHalfText,
    lowerHalfScrollType,
    lowerHalfScrollSpeed,
    lowerHalfPosition,
  } = formData;

  const [upperScrollEnabled, setUpperScrollEnabled] = useState(false);
  const [lowerScrollEnabled, setLowerScrollEnabled] = useState(false);

  useEffect(() => {
    // console.log("called");
    setUpperScrollEnabled(!["Fixed"].includes(upperHalfScrollType));
    setLowerScrollEnabled(!["Fixed"].includes(lowerHalfScrollType));
  }, [upperHalfScrollType, lowerHalfScrollType]);

  const getPositionClass = (position, scrollType) => {
    switch (scrollType) {
      case "Flicker":
        switch (position) {
          case "Left":
            return "flicker justify-start";
          case "Right":
            return "flicker justify-end";
          default:
            return "flicker justify-center";
        }
      default:
        switch (position) {
          case "Left":
            return "marquee justify-start";
          case "Right":
            return "marquee justify-end";
          default:
            return "marquee justify-center";
        }
    }
  };

  return (
    <div className="w-full">
      <div className="led-sign-board">
        {route.splitRoute && (
          <div className="left-half flex flex-col">
            <div className="top-section">
              {" "}
              <div className="led-display"> {formData.routeUpperHalfText} </div>
            </div>
            <div className="bottom-section border-t-2  border-[#ffa500]">
              {" "}
              <div className="led-display"> {formData.routeLowerHalfText} </div>
            </div>
          </div>
        )}
        {!route.splitRoute && (
          <div className="left-half ">
            <div className="led-display"> {sideText} </div>
          </div>
        )}
        <div className="right-half">
          <div className="top-section">
            <div
              className={`${getPositionClass(
                upperHalfPosition,
                upperHalfScrollType
              )} ${!upperScrollEnabled ? "paused" : ""} ${
                upperHalfScrollType === "Left To Right" && "marquee-left"
              } ${upperHalfScrollType === "Right To Left" && "marquee"}`}
              style={{
                "--scroll-speed": `${upperHalfScrollSpeed}s`,
              }}
            >
              <span
                className={`${
                  (upperHalfScrollType === "Left To Right" ||
                    upperHalfScrollType === "Right To Left") &&
                  "w-full"
                }`}
              >
                {upperHalfText}
              </span>
            </div>
          </div>
          <div className="bottom-section border-t-2 border-[#ffa500]">
            <div
              className={`${getPositionClass(
                lowerHalfPosition,
                lowerHalfScrollType
              )} ${!lowerScrollEnabled ? "paused" : ""} ${
                lowerHalfScrollType === "Left To Right" && "marquee-left"
              } ${lowerHalfScrollType === "Right To Left" && "marquee"}`}
              style={{
                "--scroll-speed": `${lowerHalfScrollSpeed}s`,
              }}
            >
              <span
                className={`${
                  (lowerHalfScrollType === "Left To Right" ||
                    lowerHalfScrollType === "Right To Left") &&
                  "w-full"
                }`}
              >
                {lowerHalfText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideWithTwoTextsBoard;
