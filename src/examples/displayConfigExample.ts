import { DisplayConfig } from '../types/displayConfig';

export const sampleDisplayConfig: DisplayConfig = {
  displayConfig: {
    screens: {
      front: {
        format: "two",
        texts: {
          sideText: {
            translations: {
              en: "Welcome",
              es: "Bienvenido",
              hi: "स्वागत है"
            },
            display: {
              scrollType: "left-to-right",
              position: "center",
              scrollSpeed: 5
            }
          },
          text: {
            translations: {
              en: "Route 101",
              es: "Ruta 101",
              hi: "मार्ग 101"
            },
            display: {
              scrollType: "fixed",
              position: "right",
              scrollSpeed: 3
            }
          }
        }
      },
      side: {
        format: "single",
        texts: {
          text: {
            translations: {
              en: "Next Stop: Main Street",
              es: "Próxima parada: Calle Principal",
              hi: "अगला पड़ाव: मुख्य सड़क"
            },
            display: {
              scrollType: "flicker",
              position: "left",
              scrollSpeed: 4
            }
          }
        }
      },
      rear: {
        format: "three",
        texts: {
          sideText: {
            translations: {
              en: "Express Bus",
              es: "Autobús Expreso",
              hi: "एक्सप्रेस बस"
            },
            display: {
              scrollType: "right-to-left",
              position: "center",
              scrollSpeed: 6
            }
          },
          upperHalfText: {
            translations: {
              en: "Route 202",
              es: "Ruta 202",
              hi: "मार्ग 202"
            },
            display: {
              scrollType: "fixed",
              position: "right",
              scrollSpeed: 2
            }
          },
          lowerHalfText: {
            translations: {
              en: "Stay Safe",
              es: "Manténgase seguro",
              hi: "सुरक्षित रहें"
            },
            display: {
              scrollType: "left-to-right",
              position: "left",
              scrollSpeed: 5
            }
          }
        }
      },
      internal: {
        format: "single",
        texts: {
          text: {
            translations: {
              en: "Welcome Passengers",
              es: "Bienvenidos pasajeros",
              hi: "यात्रियों का स्वागत है"
            },
            display: {
              scrollType: "left-to-right",
              position: "center",
              scrollSpeed: 4
            }
          }
        }
      }
    }
  }
};

// Example of how to access the data
const frontScreenWelcomeMessage = sampleDisplayConfig.displayConfig.screens.front.texts.sideText.translations.en;
const rearScreenScrollSpeed = sampleDisplayConfig.displayConfig.screens.rear.texts.sideText.display.scrollSpeed;

// Example of type checking - TypeScript will catch any invalid values
// Uncomment these lines to see TypeScript errors:
/*
const invalidConfig: DisplayConfig = {
  displayConfig: {
    screens: {
      front: {
        format: "invalid", // Error: Type '"invalid"' is not assignable to type 'ScreenFormat'
        texts: {
          text: {
            translations: {
              en: "Hello"
              // Error: Missing required properties 'es', 'hi'
            }
          }
        }
      }
    }
  }
};
*/
