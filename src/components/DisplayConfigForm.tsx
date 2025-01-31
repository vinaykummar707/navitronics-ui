import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DisplayConfig, ScreenFormat } from '../types/displayConfig';

const SCREEN_TYPES = ['front', 'side', 'rear', 'internal'] as const;
const SCROLL_TYPES = ['left-to-right', 'right-to-left', 'fixed', 'flicker'] as const;
const POSITIONS = ['left', 'right', 'center'] as const;
const FORMATS = ['single', 'two', 'three'] as const;
const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'or', name: 'Odia' },
  { code: 'as', name: 'Assamese' },
  { code: 'ur', name: 'Urdu' },
  { code: 'sd', name: 'Sindhi' },
  { code: 'ks', name: 'Kashmiri' },
  { code: 'sa', name: 'Sanskrit' },
  { code: 'ne', name: 'Nepali' },
  { code: 'kok', name: 'Konkani' },
  { code: 'mai', name: 'Maithili' },
  { code: 'bho', name: 'Bhojpuri' }
] as const;

const getDefaultTextConfig = (selectedLanguages: string[]) => ({
  translations: Object.fromEntries(selectedLanguages.map(lang => [lang, ''])),
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

export const DisplayConfigForm: React.FC = () => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  
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
    setValue(`displayConfig.screens.${screenKey}.format`, newFormat);
    setValue(
      `displayConfig.screens.${screenKey}.texts`,
      getFormatTexts(newFormat, selectedLanguages)
    );
  };

  const handleLanguageChange = (langCode: string) => {
    const newSelectedLangs = selectedLanguages.includes(langCode)
      ? selectedLanguages.filter(lang => lang !== langCode)
      : [...selectedLanguages, langCode];
    
    if (newSelectedLangs.length > 0 && newSelectedLangs.length <= 3) {
      setSelectedLanguages(newSelectedLangs);
      
      // Update all translation fields for all screens
      const formData = watch('displayConfig.screens');
      Object.entries(formData).forEach(([screenKey, screen]) => {
        const newTexts = getFormatTexts(screen.format, newSelectedLangs);
        setValue(`displayConfig.screens.${screenKey}.texts`, newTexts);
      });
    }
  };

  const onSubmit = (data: DisplayConfig) => {
    console.log(data);
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
              <input
                {...register(`${prefix}.translations.${lang}`)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
          />
        </div>
      </div>
    </div>
  );

  const renderScreen = (screenKey: typeof SCREEN_TYPES[number]) => {
    const format = watch(`displayConfig.screens.${screenKey}.format`);
    const texts = watch(`displayConfig.screens.${screenKey}.texts`);
    
    return (
      <div key={screenKey} className="mb-8 p-6 bg-white rounded-xl shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800 capitalize">
          {screenKey} Screen
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Format
          </label>
          <select
            value={format}
            onChange={(e) => handleFormatChange(screenKey, e.target.value as ScreenFormat)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {FORMATS.map(format => (
              <option key={format} value={format}>{format}</option>
            ))}
          </select>
        </div>

        {texts && Object.keys(texts).map(textKey => (
          renderTextConfig(`displayConfig.screens.${screenKey}.texts.${textKey}`, textKey)
        ))}
      </div>
    );
  };

  return (
    <form  onSubmit={handleSubmit(onSubmit)} className=" w-full overflow-y-scroll  p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Display Configuration</h2>
      
      {/* Route Information Section */}
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
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter route number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Source
            </label>
            <input
              {...register('route.source')}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter source location"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Destination
            </label>
            <input
              {...register('route.destination')}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter destination location"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Via
            </label>
            <input
              {...register('route.via')}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter via points"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('route.splitRoute')}
              id="splitRoute"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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

      {/* Language Selection Section */}
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

      {SCREEN_TYPES.map(screenKey => renderScreen(screenKey))}

      <div className="mt-6">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Configuration
        </button>
      </div>
    </form>
  );
};

export default DisplayConfigForm;
