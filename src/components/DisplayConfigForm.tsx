import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DisplayConfig, ScreenFormat } from '../types/displayConfig';
import { routeService } from '../services/routeService';

const SCREEN_TYPES = ['front', 'side', 'rear', 'internal'] as const;
const SCROLL_TYPES = ['left-to-right', 'right-to-left', 'fixed', 'flicker'] as const;
const POSITIONS = ['left', 'right', 'center'] as const;
const FORMATS = [{
  value: 'single',
  label: 'Single Line Board'
}, {
  value: 'two',
  label: 'Two Texts Board'
}, {
  value: 'three',
  label: 'Three Texts Board'
}] as const;
const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', fontFile: 'english' },
  { code: 'hi', name: 'Hindi', fontFile: 'mangal' },
  { code: 'te', name: 'Telugu', fontFile: 'gautami' },
  { code: 'ta', name: 'Tamil', fontFile: 'latha' },
  { code: 'kn', name: 'Kannada', fontFile: 'tunga' },
  { code: 'ml', name: 'Malayalam', fontFile: 'mangal' },
  { code: 'mr', name: 'Marathi', fontFile: 'mangal' },
  { code: 'gu', name: 'Gujarati', fontFile: 'shruti' },
  { code: 'pa', name: 'Punjabi', fontFile: 'raavi' },
  { code: 'bn', name: 'Bengali', fontFile: 'vrinda' },
  { code: 'or', name: 'Odia', fontFile: 'Kalinga' },
  { code: 'as', name: 'Assamese', fontFile: 'mangal' },
  { code: 'ur', name: 'Urdu', fontFile: 'mangal' },
  { code: 'sd', name: 'Sindhi', fontFile: 'mangal' },
  { code: 'ks', name: 'Kashmiri', fontFile: 'mangal' },
  { code: 'sa', name: 'Sanskrit', fontFile: 'mangal' },
  { code: 'ne', name: 'Nepali', fontFile: 'mangal' },
  { code: 'kok', name: 'Konkani', fontFile: 'mangal' },
  { code: 'mai', name: 'Maithili', fontFile: 'mangal' },
  { code: 'bho', name: 'Bhojpuri', fontFile: 'mangal' }
] as const;

const PLACEHOLDER_OPTIONS = [
  { value: 'routeNumber', label: 'Route Number' },
  { value: 'source', label: 'Source' },
  { value: 'destination', label: 'Destination' },
  { value: 'via', label: 'Via' },
  { value: 'routeNumber-source', label: 'Route Number - Source' },
  { value: 'source-destination', label: 'Source - Destination' },
  { value: 'source-via-destination', label: 'Source - Via - Destination' },
  { value: 'routeNumber-source-destination', label: 'Route Number - Source - Destination' },
  { value: 'routeNumber-source-destination-via', label: 'Route Number - Source - Destination - via' },
] as const;

const getDefaultTextConfig = (selectedLanguages: string[]) => ({
  translations: Object.fromEntries(selectedLanguages.map(lang => [lang, ''])),
  bitmaps: Object.fromEntries(selectedLanguages.map(lang => [lang, ''])),
  display: { scrollType: 'left-to-right' as const, position: 'center' as const, scrollSpeed: 5 }
});

const getFormatTexts = (format: ScreenFormat, selectedLanguages: string[]) => {
  switch (format) {
    case 'single':
      return {
        text: getDefaultTextConfig(selectedLanguages)
      };
    case 'two':
      return {
        sideText: getDefaultTextConfig(selectedLanguages),
        text: getDefaultTextConfig(selectedLanguages)
      };
    case 'three':
      return {
        sideText: getDefaultTextConfig(selectedLanguages),
        upperHalfText: getDefaultTextConfig(selectedLanguages),
        lowerHalfText: getDefaultTextConfig(selectedLanguages)
      };
    default:
      return {};
  }
};

const generatePlaceholderText = (option: string, routeData: any) => {
  const parts = option.split('-');
  return parts.map(part => routeData[part] || '').filter(Boolean).join(' - ');
};

export const DisplayConfigForm: React.FC = () => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [activeTab, setActiveTab] = useState<'route' | 'languages' | typeof SCREEN_TYPES[number]>('route');

  const { register, handleSubmit, watch, setValue } = useForm<DisplayConfig>({
    defaultValues: {
      route: {
        routeNumber: '',
        source: '',
        destination: '',
        via: '',
        splitRoute: false,
        routeNumber1: '',
        routeNumber2: ''
      },
      displayConfig: {
        screens: {
          front: {
            format: 'two',
            texts: getFormatTexts('two', selectedLanguages)
          },
          side: {
            format: 'single',
            texts: getFormatTexts('single', selectedLanguages)
          },
          rear: {
            format: 'three',
            texts: getFormatTexts('three', selectedLanguages)
          },
          internal: {
            format: 'single',
            texts: getFormatTexts('single', selectedLanguages)
          }
        }
      }
    }
  });

  const splitRoute = watch('route.splitRoute');

  const handleFormatChange = (screenKey: string, newFormat: ScreenFormat) => {
    // Get current translations for this screen
    const currentTexts = watch(`displayConfig.screens.${screenKey}.texts`);
    const currentTranslations = Object.values(currentTexts)[0]?.translations || {};

    // Create new texts configuration based on format
    let newTexts = {};
    switch (newFormat) {
      case 'single':
        newTexts = {
          text: {
            translations: { ...currentTranslations },
            bitmaps: { ...currentTranslations },
            display: { scrollType: 'left-to-right' as const, position: 'center' as const, scrollSpeed: 4 }
          }
        };
        break;
      case 'two':
        newTexts = {
          sideText: {
            translations: { ...currentTranslations },
            bitmaps: { ...currentTranslations },
            display: { scrollType: 'left-to-right' as const, position: 'center' as const, scrollSpeed: 5 }
          },
          text: {
            translations: { ...currentTranslations },
            bitmaps: { ...currentTranslations },
            display: { scrollType: 'fixed' as const, position: 'right' as const, scrollSpeed: 3 }
          }
        };
        break;
      case 'three':
        newTexts = {
          sideText: {
            translations: { ...currentTranslations },
            bitmaps: { ...currentTranslations },
            display: { scrollType: 'right-to-left' as const, position: 'center' as const, scrollSpeed: 6 }
          },
          upperHalfText: {
            translations: { ...currentTranslations },
            bitmaps: { ...currentTranslations },
            display: { scrollType: 'fixed' as const, position: 'right' as const, scrollSpeed: 2 }
          },
          lowerHalfText: {
            translations: { ...currentTranslations },
            bitmaps: { ...currentTranslations },
            display: { scrollType: 'left-to-right' as const, position: 'left' as const, scrollSpeed: 5 }
          }
        };
        break;
    }

    setValue(`displayConfig.screens.${screenKey}.format`, newFormat);
    setValue(`displayConfig.screens.${screenKey}.texts`, newTexts);
  };

  const handleLanguageChange = (langCode: string) => {
    const newSelectedLangs = selectedLanguages.includes(langCode)
      ? selectedLanguages.filter(lang => lang !== langCode)
      : [...selectedLanguages, langCode];

    if (newSelectedLangs.length > 0 && newSelectedLangs.length <= 3) {
      setSelectedLanguages(newSelectedLangs);

      // Update translations for each screen while preserving existing translations
      const formData = watch('displayConfig.screens');
      Object.entries(formData).forEach(([screenKey, screen]) => {
        const texts = screen.texts;
        const updatedTexts = Object.entries(texts).reduce((acc, [textKey, textConfig]) => {
          // Keep existing translations for selected languages
          const newTranslations = newSelectedLangs.reduce((trans, lang) => ({
            ...trans,
            [lang]: textConfig.translations[lang] || ''
          }), {});

          return {
            ...acc,
            [textKey]: {
              ...textConfig,
              translations: newTranslations,
              bitmaps: newTranslations
            }
          };
        }, {});

        setValue(`displayConfig.screens.${screenKey}.texts`, updatedTexts);
      });
    }
  };

  const handlePlaceholderSelect = (
    screenKey: string,
    textKey: string,
    lang: string,
    option: string
  ) => {
    const routeData = watch('route');
    const generatedText = generatePlaceholderText(option, routeData);
    const upperText = generatedText.toUpperCase();

    // Update both translations and bitmaps
    setValue(`displayConfig.screens.${screenKey}.texts.${textKey}.translations.${lang}`, upperText);
    setValue(`displayConfig.screens.${screenKey}.texts.${textKey}.bitmaps.${lang}`, upperText);
  };

  const renderTextConfig = (prefix: string, textKey: string) => (
    <div key={textKey} className="p-4 bg-gray-50 rounded-lg mb-4">
      <h4 className="font-semibold mb-2 text-gray-700 capitalize">
        {textKey.replace(/([A-Z])/g, ' $1').trim()}
      </h4>

      <div className="mb-4">
        <h5 className="font-medium mb-2 text-gray-600">Translations</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedLanguages.map(lang => (
            <div key={lang}>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {AVAILABLE_LANGUAGES.find(l => l.code === lang)?.name || lang.toUpperCase()}
              </label>
              <div className="flex flex-col gap-2">
                <input
                  {...register(`${prefix}.translations.${lang}`)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  onChange={(e) => handlePlaceholderSelect(prefix, textKey, lang, e.target.value)}
                  className="w-48 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  defaultValue=""
                >
                  <option value="">Select placeholder</option>
                  {PLACEHOLDER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Scroll Type
          </label>
          <select
            {...register(`${prefix}.display.scrollType`)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {SCROLL_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Position
          </label>
          <select
            {...register(`${prefix}.display.position`)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {POSITIONS.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Scroll Speed
          </label>
          <input
            type="number"
            {...register(`${prefix}.display.scrollSpeed`)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            max="10"
          />
        </div>
      </div>
    </div>
  );

  const renderRouteTab = () => (
    <div className="mb-8 p-6 bg-white rounded-xl shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Route Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Route Number
          </label>
          <input
            {...register('route.routeNumber')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
            placeholder="Enter route number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Source
          </label>
          <input
            {...register('route.source')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
            placeholder="Enter source location"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Destination
          </label>
          <input
            {...register('route.destination')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
            placeholder="Enter destination location"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Via
          </label>
          <input
            {...register('route.via')}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
            placeholder="Enter via points"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('route.splitRoute')}
            id="splitRoute"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded uppercase"
          />
          <label htmlFor="splitRoute" className="ml-2 block text-sm text-gray-900">
            Split Route
          </label>
        </div>
      </div>

      {/* Conditional Split Route Fields */}
      {splitRoute && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Route Number 1
            </label>
            <input
              {...register('route.routeNumber1')}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter first route number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Route Number 2
            </label>
            <input
              {...register('route.routeNumber2')}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter second route number"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderLanguagesTab = () => (
    <div className="mb-8 p-6 bg-white rounded-xl shadow-md">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Language Selection
      </h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Select Languages (max 3)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {AVAILABLE_LANGUAGES.map(lang => (
            <div key={lang.code} className="flex items-center">
              <input
                type="checkbox"
                id={`lang-${lang.code}`}
                checked={selectedLanguages.includes(lang.code)}
                onChange={() => handleLanguageChange(lang.code)}
                disabled={!selectedLanguages.includes(lang.code) && selectedLanguages.length >= 3}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor={`lang-${lang.code}`}
                className="ml-2 block text-sm text-gray-900"
              >
                {lang.name}
              </label>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Select between 1 and 3 languages
        </p>
      </div>
    </div>
  );

  const renderScreenTab = (screenKey: typeof SCREEN_TYPES[number]) => {
    // Watch the specific screen's configuration
    const screenConfig = watch(`displayConfig.screens.${screenKey}`);
    console.log(screenKey);
    console.log(screenConfig);

    if (!screenConfig || !screenConfig.texts) {
      return null;
    }

    return (
      <div className="mb-8 p-6 bg-white rounded-xl shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800 capitalize">
          {screenKey} Screen Configuration
        </h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Format
          </label>
          <select
            value={screenConfig.format || 'single'}
            onChange={(e) => handleFormatChange(screenKey, e.target.value as ScreenFormat)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {FORMATS.map(format => (
              <option key={format.label} value={format.value}>{format.label}</option>
            ))}
          </select>
        </div>

        {Object.entries(screenConfig.texts).map(([textKey, textConfig]) => (
          <div key={`${screenKey}-${textKey}`} className="p-4 bg-gray-50 rounded-lg mb-4">
            <h4 className="font-semibold mb-2 text-gray-700 capitalize">
              {textKey.replace(/([A-Z])/g, ' $1').trim()}
            </h4>

            <div className="mb-4">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedLanguages.map(lang => {
                  const translationValue = textConfig?.translations?.[lang] || '';
                  return (
                    <div key={`${screenKey}-${textKey}-${lang}`}>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        {AVAILABLE_LANGUAGES.find(l => l.code === lang)?.name || lang.toUpperCase()}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          onChange={(e) => handlePlaceholderSelect(screenKey, textKey, lang, e.target.value)}
                          className=" p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          defaultValue=""
                        >
                          <option value="">Select placeholder</option>
                          {PLACEHOLDER_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <input
                          {...register(`displayConfig.screens.${screenKey}.texts.${textKey}.translations.${lang}`, {
                            onChange: (e) => {
                              // Update bitmap value whenever translation changes
                              setValue(
                                `displayConfig.screens.${screenKey}.texts.${textKey}.bitmaps.${lang}`,
                                e.target.value.toUpperCase()
                              );
                            }
                          })}
                          defaultValue={translationValue}
                          className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Scroll Type
                </label>
                <select
                  {...register(`displayConfig.screens.${screenKey}.texts.${textKey}.display.scrollType`)}
                  defaultValue={textConfig?.display?.scrollType || 'left-to-right'}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {SCROLL_TYPES.map(type => (
                    <option key={`${screenKey}-${textKey}-${type}`} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Position
                </label>
                <select
                  {...register(`displayConfig.screens.${screenKey}.texts.${textKey}.display.position`)}
                  defaultValue={textConfig?.display?.position || 'center'}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {POSITIONS.map(pos => (
                    <option key={`${screenKey}-${textKey}-${pos}`} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Scroll Speed
                </label>
                <input
                  type="number"
                  {...register(`displayConfig.screens.${screenKey}.texts.${textKey}.display.scrollSpeed`)}
                  defaultValue={textConfig?.display?.scrollSpeed || 5}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'route':
        return renderRouteTab();
      case 'languages':
        return renderLanguagesTab();
      case 'front':
        return renderScreenTab('front');
      case 'side':
        return renderScreenTab('side');
      case 'rear':
        return renderScreenTab('rear');
      case 'internal':
        return renderScreenTab('internal');
      default:
        return null;
    }
  };

  const onSubmit = async (data: DisplayConfig) => {
    // Create a deep copy of the data to avoid mutating the form state
    const configToSave = JSON.parse(JSON.stringify(data));

    // Process all screens
    for (const screenKey of SCREEN_TYPES) {
      const screen = configToSave.displayConfig.screens[screenKey];
      if (!screen || !screen.texts) continue;

      // Process each text section in the screen
      for (const [textKey, textConfig] of Object.entries(screen.texts)) {
        // Process each language's bitmap
        for (const [lang, text] of Object.entries(textConfig.bitmaps)) {
          if (text) {
            try {
              // Get the font file for the language
              const langConfig = AVAILABLE_LANGUAGES.find(l => l.code === lang);
              if (!langConfig) {
                throw new Error(`Font file not found for language: ${lang}`);
              }

              // Call the generateBitmap API with the correct font file
              const bitmapResponse = await routeService.generateBitmap(text, langConfig.fontFile, 16);
              // Store bitmap data with metadata
              screen.texts[textKey].bitmaps[lang] = {
                bitmap: bitmapResponse.bitmap.join(','),
                width: bitmapResponse.width,
                height: bitmapResponse.height
              };
            } catch (error) {
              console.error(`Error generating bitmap for ${screenKey}-${textKey}-${lang}:`, error);
              // Keep the original text as bitmap if API fails
              screen.texts[textKey].bitmaps[lang] = {
                bitmap: text,
                width: 0,
                height: 0
              };
            }
          }
        }
      }
    }

    // Create an array with the config object
    const configArray = [configToSave];
    console.log(configArray);

    // Create a JSON blob and download it
    const jsonString = JSON.stringify(configArray, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `route.json`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('Configuration saved and downloaded');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full overflow-y-scroll p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Display Configuration</h2>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Configuration
        </button>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-4">
          <button
            type="button"
            onClick={() => setActiveTab('route')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'route'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Route
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('languages')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'languages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Languages
          </button>
          {SCREEN_TYPES.map(screenType => (
            <button
              key={screenType}
              type="button"
              onClick={() => setActiveTab(screenType)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === screenType
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {screenType}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {renderTabContent()}
      </div>
    </form>
  );
};

export default DisplayConfigForm;
