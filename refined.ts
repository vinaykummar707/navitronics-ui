const refinedIb = {
  route: {
    routeNumber: "678",
    source: "HYDERABAD",
    destination: "VIZAG",
    via: "VIA GUNTUR",
    splitRoute: false,
    routeNumber1: "",
    routeNumber2: "",
    separation: "-", // can be space or -,To,(vice versa symbol)
  },
  front: [
    {
      format: "single",
      language: "en",
      type: "route",
      duration: 20,
      nextChangeIn: 20,
      texts: {
        text: {
          text: "678 HYDERABAD  -  VIZAG",
          bitmap: "",
          fontWidth: 161,
          scrollType: "Right To Left",
          position: "Center",
          scrollSpeed: "5",
          fontSize: "1",
          fontWeight: "bold",
          fontHeight: "12",
          x_offset: "",
          y_offset: "",
          spacing: "100",
        },
      },
    },
    {
      format: "two",
      language: "hi",
      type: "route",
      duration: 20,
      nextChangeIn: 20,
      texts: {
        sideText: {
          text: "678",
          bitmap: "",
          fontWidth: 20,
          scrollType: "Fixed",
          position: "Left",
          scrollSpeed: "6",
          fontSize: "1",
          fontWeight: "bold",
          fontHeight: "10",
          x_offset: "",
          y_offset: "",
          spacing: "100",
        },
        routeNumber1: {
          text: "",
          bitmap: "",
          fontWidth: null,
          scrollType: "Right To Left",
          position: "Center",
          scrollSpeed: "5",
          fontSize: "1",
          fontWeight: "bold",
          fontHeight: "10",
          x_offset: "",
          y_offset: "",
          spacing: "100",
        },
        routeNumber2: {
          text: "",
          bitmap: "",
          fontWidth: null,
          scrollType: "Right To Left",
          position: "Center",
          scrollSpeed: "2",
          fontSize: "1",
          fontWeight: "bold",
          fontHeight: "10",
          x_offset: "",
          y_offset: "",
          spacing: "100",
        },
        text: {
          text: "HYDERABAD  -  VIZAG",
          fontWidth: 136,
          bitmap: "",
          scrollType: "Right To Left",
          position: "Center",
          scrollSpeed: "5",
          fontSize: "1",
          fontWeight: "bold",
          fontHeight: "12",
          x_offset: "",
          y_offset: "",
          spacing: "100",
        },
      },
    },
    {
      format: "single",
      language: "en",
      type: "specialMessage",
      texts: {
        text: {
          text: "678 HYDERABAD  -  VIZAG",
          bitmap: "",
          fontWidth: 161,
          scrollType: "Right To Left",
          position: "Center",
          scrollSpeed: "5",
          fontSize: "1",
          fontWeight: "bold",
          fontHeight: "12",
          x_offset: "",
          y_offset: "",
          spacing: "100",
        },
      },
    },
    {
      format: "three",
      language: "en",
      type: "route",
      texts: {
        sideText: {
          text: "678",
          bitmap: "",
          fontWidth: 20,
          scrollType: "Fixed",
          position: "Left",
          scrollSpeed: "6",
          fontSize: "1",
          fontWeight: "bold",
          fontHeight: "10",
          x_offset: "",
          y_offset: "",
          spacing: "100",
        },
        routeNumber1: {
          text: "",
          bitmap: "",
          fontWidth: null,
          scrollType: "Right To Left",
          position: "Center",
          scrollSpeed: "5",
          fontSize: "1",
          fontWeight: "bold",
          fontHeight: "10",
          x_offset: "",
          y_offset: "",
          spacing: "100",
        },
        routeNumber2: {
          text: "",
          bitmap: "",
          fontWidth: null,
          scrollType: "Right To Left",
          position: "Center",
          scrollSpeed: "2",
          fontSize: "1",
          fontWeight: "bold",
          fontHeight: "10",
          x_offset: "",
          y_offset: "",
          spacing: "100",
        },
        upperHalfText: {
          text: "HYDERABAD  -  VIZAG",
          bitmap: "",
          fontWidth: 111,
          scrollType: "Right To Left",
          position: "Center",
          scrollSpeed: "5",
          fontSize: "1",
          fontWeight: "bold",
          fontHeight: "7",
          x_offset: "",
          y_offset: "",
          spacing: "100",
        },
        lowerHalfText: {
          text: "VIA: VIA GUNTUR",
          bitmap: "",
          fontWidth: 89,
          scrollType: "Right To Left",
          position: "Center",
          scrollSpeed: "6",
          fontSize: "1",
          fontWeight: "bold",
          fontHeight: "7",
          x_offset: "",
          y_offset: "",
          spacing: "100",
        },
      },
    },
  ],
  side: [], // can have same structure as front
  rear: [],
  internal: [],
  upStops: [
    {
      stopName: "HYDERABAD",
      latitude: 17.385044,
      longitude: 78.486671,
      audio: {
        current: [
          {
            file: "HYDERABAD.mp3",
            language: "en",
          },
          {
            file: "HYDERABAD.mp3",
            language: "hi",
          },
          {
            file: "HYDERABAD.mp3",
            language: "te",
          },
        ],
        next: [
          {
            file: "HYDERABAD.mp3",
            language: "en",
          },
          {
            file: "HYDERABAD.mp3",
            language: "hi",
          },
          {
            file: "HYDERABAD.mp3",
            language: "te",
          },
        ],
        arriving: [
          {
            file: "HYDERABAD.mp3",
            language: "en",
          },
          {
            file: "HYDERABAD.mp3",
            language: "hi",
          },
          {
            file: "HYDERABAD.mp3",
            language: "te",
          },
        ],
      },
    },
    {
      stopName: "UPPAL",
      latitude: 17.385044,
      longitude: 78.486671,
      audio: {
        current: [
          {
            file: "HYDERABAD.mp3",
            language: "en",
          },
          {
            file: "HYDERABAD.mp3",
            language: "hi",
          },
          {
            file: "HYDERABAD.mp3",
            language: "te",
          },
        ],
        next: [
          {
            file: "HYDERABAD.mp3",
            language: "en",
          },
          {
            file: "HYDERABAD.mp3",
            language: "hi",
          },
          {
            file: "HYDERABAD.mp3",
            language: "te",
          },
        ],
        arriving: [
          {
            file: "HYDERABAD.mp3",
            language: "en",
          },
          {
            file: "HYDERABAD.mp3",
            language: "hi",
          },
          {
            file: "HYDERABAD.mp3",
            language: "te",
          },
        ],
      },
    },
  ],

  downStops: [
    {
      stopName: "HYDERABAD",
      latitude: 19.38504,
      longitude: 12.486671,
      audio: {
        current: [
          {
            file: "HYDERABAD.mp3",
            language: "en",
          },
          {
            file: "HYDERABAD.mp3",
            language: "hi",
          },
          {
            file: "HYDERABAD.mp3",
            language: "te",
          },
        ],
        next: [
          {
            file: "HYDERABAD.mp3",
            language: "en",
          },
          {
            file: "HYDERABAD.mp3",
            language: "hi",
          },
          {
            file: "HYDERABAD.mp3",
            language: "te",
          },
        ],
        arriving: [
          {
            file: "HYDERABAD.mp3",
            language: "en",
          },
          {
            file: "HYDERABAD.mp3",
            language: "hi",
          },
          {
            file: "HYDERABAD.mp3",
            language: "te",
          },
        ],
      },
    },
    {
      stopName: "UPPAL",
      latitude: 17.385044,
      longitude: 78.486671,
      audio: {
        current: [
          {
            file: "HYDERABAD.mp3",
            language: "en",
          },
          {
            file: "HYDERABAD.mp3",
            language: "hi",
          },
          {
            file: "HYDERABAD.mp3",
            language: "te",
          },
        ],
        next: [
          {
            file: "HYDERABAD.mp3",
            language: "en",
          },
          {
            file: "HYDERABAD.mp3",
            language: "hi",
          },
          {
            file: "HYDERABAD.mp3",
            language: "te",
          },
        ],
        arriving: [
          {
            file: "HYDERABAD.mp3",
            language: "en",
          },
          {
            file: "HYDERABAD.mp3",
            language: "hi",
          },
          {
            file: "HYDERABAD.mp3",
            language: "te",
          },
        ],
      },
    },
  ],

  version: "2.0",
  areaId: "0T2SB2M6V1",
  depotId: "A8TWMY9ART",
  active: true,
  deleted: false,
  createdAt: "2025-09-14 01:53:29.591",
};

// enum ScrollType {
//   RIGHT_TO_LEFT = "Right To Left",
//   FIXED = "Fixed",
//   LEFT_TO_RIGHT = "Left To Right",
// }

// enum Position {
//   CENTER = "Center",
//   LEFT = "Left",
//   RIGHT = "Right",
// }

// enum FontWeight {
//   BOLD = "bold",
//   NORMAL = "normal",
// }

// enum Format {
//   SINGLE = "single",
//   TWO = "two",
//   THREE = "three",
// }

// enum Language {
//   EN = "en",
//   HI = "hi",
// }

// enum RouteType {
//   ROUTE = "route",
//   SPECIAL_MESSAGE = "specialMessage",
// }

// type TextAttributes = {
//   text: string;
//   bitmap: string;
//   fontWidth: number | null;
//   scrollType: ScrollType;
//   position: Position;
//   scrollSpeed: string;
//   fontSize: string;
//   fontWeight: FontWeight;
//   fontHeight: string;
//   x_offset: string;
//   y_offset: string;
//   spacing: string;
// };

// type RouteText = {
//   sideText?: TextAttributes;
//   routeNumber1?: TextAttributes;
//   routeNumber2?: TextAttributes;
//   text?: TextAttributes;
//   upperHalfText?: TextAttributes;
//   lowerHalfText?: TextAttributes;
// };

// type RouteFormat = {
//   format: Format;
//   language: Language;
//   type: RouteType;
//   texts: RouteText;
// };

// type Route = {
//   routeNumber: string;
//   source: string;
//   destination: string;
//   via: string;
//   splitRoute: boolean;
//   routeNumber1: string;
//   routeNumber2: string;
//   separation: string;
// };

// type RefinedIB = {
//   route: Route;
//   front: RouteFormat[];
//   side: RouteFormat[];
//   rear: RouteFormat[];
//   internal: RouteFormat[];
//   version: string;
//   areaId: string;
//   depotId: string;
//   active: boolean;
//   deleted: boolean;
//   createdAt: string;
// };
