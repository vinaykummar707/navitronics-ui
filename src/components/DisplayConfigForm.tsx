import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
	AccordionItem,
	AccordionItemContent,
	AccordionItemTrigger,
	AccordionRoot,
} from '@/components/ui/accordion';
import {
	DisplayConfig,
	FontWeight,
	ScreenFormat,
} from '../types/displayConfig';
import { routeService } from '../services/routeService';
import FullScreenBoard from './FullScreenBoard';
import SideWithSingleTextBoard from './SideWithSingleTextBoard';
import SideWithTwoTextsBoard from './SideWithTwoHalfsBoard';
import IMEInput from './IMEInput';
import GoogleIME from './IMEInput';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import LEDBoardBitmap from './LedSignBoard';

const SCREEN_TYPES = ['front', 'side', 'rear', 'internal'] as const;
const SCROLL_TYPES = [
	'Left To Right',
	'Right To Left',
	'Fixed',
	'Flicker',
] as const;
const POSITIONS = ['Left', 'Right', 'Center'] as const;
const FORMATS = [
	{
		value: 'single',
		label: 'Single Line Board',
	},
	{
		value: 'two',
		label: 'Two Texts Board',
	},
	{
		value: 'three',
		label: 'Three Texts Board',
	},
] as const;

const FORMATS2 = [
	{
		value: 'single',
		label: 'Single Line Board',
	},
] as const;

const FONT_WEIGHT = [
	{
		value: 'font-normal',
		label: 'Regular',
	},
	{
		value: 'font-bold',
		label: 'Bold',
	},
];
const AVAILABLE_LANGUAGES = [
	{ code: 'en', name: 'English', fontFile: 'arial' },
	{ code: 'hi', name: 'Hindi', fontFile: 'mangal' },
	{ code: 'ch', name: 'Chattisgarh', fontFile: 'krutidev' },
	{ code: 'te', name: 'Telugu', fontFile: 'gautami' },
	{ code: 'ta', name: 'Tamil', fontFile: 'latha' },
	{ code: 'kn', name: 'Kannada', fontFile: 'tunga' },
	{ code: 'ml', name: 'Malayalam', fontFile: 'mangal' },
	{ code: 'mr', name: 'Marathi', fontFile: 'mangal' },
	{ code: 'gu', name: 'Gujarati', fontFile: 'shruti' },
	{ code: 'pa', name: 'Punjabi', fontFile: 'raavi' },
	{ code: 'bn', name: 'Bengali', fontFile: 'vrinda' },
	{ code: 'or', name: 'Odia', fontFile: 'Kalinga' },
	{ code: 'as', name: 'Assamese', fontFile: 'vrinda' },
	{ code: 'ur', name: 'Urdu', fontFile: 'mangal' },
	{ code: 'sd', name: 'Sindhi', fontFile: 'mangal' },
	{ code: 'ks', name: 'Kashmiri', fontFile: 'mangal' },
	{ code: 'sa', name: 'Sanskrit', fontFile: 'mangal' },
	{ code: 'ne', name: 'Nepali', fontFile: 'mangal' },
	{ code: 'kok', name: 'Konkani', fontFile: 'mangal' },
	{ code: 'mai', name: 'Maithili', fontFile: 'mangal' },
	{ code: 'bho', name: 'Bhojpuri', fontFile: 'mangal' },
] as const;

const PLACE_HOLDER_OPTIONS2 = [
	{
		value: 'source',
		label: 'Special Messages',
	},
];

const PLACEHOLDER_OPTIONS = [
	{ value: 'routeNumber', label: 'Route Number' },
	{ value: 'routeNumber1-routeNumber2', label: 'Split Route Number' },
	// { value: 'routeNumber', label: 'Route Number' },
	{ value: 'source', label: 'Source' },
	{ value: 'destination', label: 'Destination' },
	{ value: 'via', label: 'Via' },
	{ value: 'source-separation-destination', label: 'Source - Destination' },
	{
		value: 'source-separation-destination-via',
		label: 'Source - Destination - via',
	},
	{
		value: 'routeNumber-source-separation-destination',
		label: 'Route Number - Source - Destination',
	},
	{
		value: 'routeNumber1-routeNumber2-source-separation-destination',
		label: 'Split Route Number - Source - Destination',
	},
	{
		value: 'routeNumber-source-separation-destination-via',
		label: 'Route Number - Source - Destination - via',
	},
	{
		value: 'routeNumber1-routeNumber2-source-separation-destination-via',
		label: 'Split Route Number - Source - Destination - via',
	},
] as const;

const ROUTE_SEPARATORS = [
	{ value: '-', label: 'Dash (-)' },
	{ value: 'TO', label: 'TO' },
	{ value: '⇄', label: 'Vice Verca' },
] as const;

const FONT_SIZES = [10, 12, 14, 16] as const;

const getDefaultTextConfig = () => ({
	text: '',
	bitmap: {
		bitmap: '',
		width: 0,
		height: 0,
	},
	scrollType: 'Fixed' as const,
	position: 'Left' as const,
	scrollSpeed: 15,
	fontSize: 16,
	fontWeight: 'font-regular',
});

const getDefaultThreeTextConfig = () => ({
	text: '',
	bitmap: {
		bitmap: '',
		width: 0,
		height: 0,
	},
	scrollType: 'Fixed' as const,
	position: 'Left' as const,
	scrollSpeed: 15,
	fontSize: 8,
	fontWeight: 'font-regular',
});

const getDefaultThreeSideTextConfig = () => ({
	text: '',
	bitmap: {
		bitmap: '',
		width: 0,
		height: 0,
	},
	scrollType: 'Fixed' as const,
	position: 'Left' as const,
	scrollSpeed: 15,
	fontSize: 16,
	fontWeight: 'font-regular',
});

const getFormatTexts = (format: ScreenFormat) => {
	switch (format) {
		case 'single':
			return {
				text: getDefaultTextConfig(),
			};
		case 'two':
			return {
				sideText: getDefaultTextConfig(),
				text: getDefaultTextConfig(),
			};
		case 'three':
			return {
				sideText: getDefaultThreeSideTextConfig(),
				upperHalfText: getDefaultThreeTextConfig(),
				lowerHalfText: getDefaultThreeTextConfig(),
			};
		default:
			return {};
	}
};

const getDefaultScreenConfig = (format: ScreenFormat, isEnglish: boolean) => {
	// For non-English languages, ensure format is either 'single' or 'two'
	if (!isEnglish && format === 'three') {
		format = 'two';
	}
	return {
		format,
		texts: getFormatTexts(format),
	};
};

const getDefaultLanguageConfig = (isEnglish: boolean) => ({
	front: getDefaultScreenConfig('single', isEnglish),
	side: getDefaultScreenConfig('single', isEnglish),
	rear: getDefaultScreenConfig('single', isEnglish),
	internal: getDefaultScreenConfig('single', isEnglish),
});

const generatePlaceholderText = (option: string, routeData: any) => {
	const parts = option.split('-');
	console.log(option, routeData, parts);
	const res = parts
		.map((part) =>
			part === 'via' ? `VIA: ${routeData[part]}` : routeData[part] || ''
		)
		.filter(Boolean)
		.join(' ');
	console.log(res);
	return res;
};

export const DisplayConfigForm: React.FC = () => {
	const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
	const location = useLocation();
	const { areaId, depotId, isEdit, gotRouteData } = location.state || {};
	const [activeTab, setActiveTab] = useState<
		'route' | 'languages' | (typeof SCREEN_TYPES)[number]
	>('route');

	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const createRouteMutation = useMutation({
		mutationFn: routeService.create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['routes'] });
			navigate('/home/routes');
		},
		onError: (error) => {
			console.error('Error creating route:', error);
			// Handle error appropriately
		},
	});

	const updateRouteMutation = useMutation({
		mutationFn: ({ id, data }: { id: any; data: any }) =>
			routeService.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['routes'] });
			navigate('/home/routes');
		},
		onError: (error) => {
			console.error('Error creating route:', error);
			// Handle error appropriately
		},
	});

	const handleSave = (data: any) => {
		createRouteMutation.mutate(data);
	};

	const { register, handleSubmit, watch, setValue, control, reset } =
		useForm<DisplayConfig>({
			defaultValues: {
				route: {
					routeNumber: '',
					source: '',
					destination: '',
					via: '',
					splitRoute: false,
					routeNumber1: '',
					routeNumber2: '',
					separation: '-',
				},
				displayConfig: {
					en: getDefaultLanguageConfig(true),
				},
				version: '1.0',
				areaId: areaId,
				depotId: depotId,
			},
		});

	useEffect(() => {
		console.log(isEdit, gotRouteData);
		if (isEdit && gotRouteData) {
			console.log(Object.keys(gotRouteData.displayConfig));
			setSelectedLanguages(Object.keys(gotRouteData.displayConfig));
			reset(gotRouteData); // ✅ Reset entire form with new data
			// const languages =
		}
	}, [isEdit, gotRouteData, reset]);

	const splitRoute = watch('route.splitRoute');
	const isSpecialMessage = watch('route.isSpecialMessage');

	const handleFormatChange = (
		screenKey: string,
		language: string,
		newFormat: ScreenFormat
	) => {
		// Get current text config for this screen
		const currentTexts = watch(`displayConfig.${language}.${screenKey}.texts`);
		const currentText = Object.values(currentTexts)[0]?.text || '';

		// Create new texts configuration based on format
		let newTexts = {};
		switch (newFormat) {
			case 'single':
				newTexts = {
					text: getDefaultTextConfig(),
				};
				break;
			case 'two':
				newTexts = {
					sideText: getDefaultTextConfig(),
					text: getDefaultTextConfig(),
				};
				break;
			case 'three':
				newTexts = {
					sideText: getDefaultThreeSideTextConfig(),
					upperHalfText: getDefaultThreeTextConfig(),
					lowerHalfText: getDefaultThreeTextConfig(),
				};
				break;
		}

		setValue(`displayConfig.${language}.${screenKey}.format`, newFormat);
		setValue(`displayConfig.${language}.${screenKey}.texts`, newTexts);
	};

	const handleLanguageChange = (langCode: string) => {
		const newSelectedLangs = selectedLanguages.includes(langCode)
			? selectedLanguages.filter((lang) => lang !== langCode)
			: [...selectedLanguages, langCode];

		if (newSelectedLangs.length > 0 && newSelectedLangs.length <= 3) {
			setSelectedLanguages(newSelectedLangs);

			// Add configuration for newly added language
			if (!selectedLanguages.includes(langCode)) {
				const isEnglish = langCode === 'en';
				setValue(
					`displayConfig.${langCode}`,
					getDefaultLanguageConfig(isEnglish)
				);
			}

			// Remove configuration for removed language
			if (selectedLanguages.includes(langCode)) {
				const displayConfig = { ...watch('displayConfig') };
				delete displayConfig[langCode];
				setValue('displayConfig', displayConfig);
			}
		}
	};

	const [selectedPlaceholder, setSelectedPlaceholder] = useState('');

	const handlePlaceholderSelect = async (
		screenKey: string,
		textKey: string,
		language: string,
		option: string
	) => {
		setSelectedPlaceholder(option);
		const routeData = watch('route');
		const generatedText = generatePlaceholderText(option, routeData);
		let upperText;
		if (language === 'en') {
			upperText = generatedText.toUpperCase();
		} else {
			if (
				option === 'routeNumber' ||
				option === 'routeNumber1' ||
				option === 'routeNumber2'
			) {
				upperText = generatedText.toUpperCase();
			} else {
				const res = await fetchTransliteration(generatedText, language);
				upperText = res[0];
			}
		}
		// Update both translations and bitmaps
		setValue(
			`displayConfig.${language}.${screenKey}.texts.${textKey}.text`,
			upperText
		);
		setValue(
			`displayConfig.${language}.${screenKey}.texts.${textKey}.bitmap.bitmap`,
			upperText
		);
	};

	const renderRouteTab = () => (
		<div className="mb-8 p-6 bg-white rounded-xl shadow-md">
			<h3 className="text-xl font-bold mb-4 text-gray-800">
				Route Information
			</h3>
			<div className="flex gap-4 items-center">
				<div className="flex mb-4 items-center">
					<input
						type="checkbox"
						{...register('route.splitRoute')}
						id="splitRoute"
						className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded uppercase"
					/>
					<label
						htmlFor="splitRoute"
						className="ml-2 block text-sm text-gray-900"
					>
						Split Route
					</label>
				</div>
				<div className="flex mb-4 items-center">
					<input
						type="checkbox"
						{...register('route.isSpecialMessage')}
						id="splitRoute"
						className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded uppercase"
					/>
					<label
						htmlFor="splitRoute"
						className="ml-2 block text-sm text-gray-900"
					>
						Special Messages
					</label>
				</div>
			</div>

			{/* Conditional Split Route Fields */}
			{splitRoute && !isSpecialMessage && (
				<div className="mt-4 grid grid-cols-1 mb-4 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-600 mb-1">
							Route Number 1
						</label>
						<input
							{...register('route.routeNumber1')}
							className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter first route number"
							maxLength={4}
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
							maxLength={4}
						/>
					</div>
				</div>
			)}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{!splitRoute && !isSpecialMessage && (
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
				)}

				<div className={isSpecialMessage ? 'col-span-2' : ''}>
					<label className="block text-sm font-medium text-gray-600 mb-1">
						{isSpecialMessage ? 'Special Messages' : 'Source'}
					</label>
					<input
						{...register('route.source')}
						className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder={
							isSpecialMessage
								? "For Multiple Special Messages Keep '/' In Between Each Message "
								: 'Enter source location'
						}
					/>
				</div>
				{!isSpecialMessage && (
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
				)}
				{!isSpecialMessage && (
					<div>
						<label className="block text-sm font-medium text-gray-600 mb-1">
							Via
						</label>
						<input
							{...register('route.via')}
							className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="Dont add comma for stops use space instead"
						/>
					</div>
				)}
				{!isSpecialMessage && (
					<div>
						<label className="block text-sm font-medium text-gray-600 mb-1">
							Separator
						</label>
						<select
							{...register('route.separation')}
							className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							{ROUTE_SEPARATORS.map((sep) => (
								<option key={sep.value} value={sep.value}>
									{sep.label}
								</option>
							))}
						</select>
					</div>
				)}
			</div>
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
					{AVAILABLE_LANGUAGES.map((lang) => (
						<div key={lang.code} className="flex items-center">
							<input
								type="checkbox"
								id={`lang-${lang.code}`}
								checked={selectedLanguages.includes(lang.code)}
								onChange={() => handleLanguageChange(lang.code)}
								disabled={
									!selectedLanguages.includes(lang.code) &&
									selectedLanguages.length >= 3
								}
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

	const fetchTransliteration = async (
		text: string,
		langCode: string = 'hi'
	) => {
		try {
			const response = await fetch(
				`https://inputtools.google.com/request?text=${encodeURIComponent(
					text
				)}&itc=${langCode}-t-i0-und&num=5&ie=utf-8&oe=utf-8&app=customApp`
			);
			const data = await response.json();

			if (data[0] === 'SUCCESS') {
				return data[1][0][1]; // Array of suggestions
			} else {
				console.error('Transliteration failed:', data);
				return [];
			}
		} catch (error) {
			console.error('Error fetching transliteration:', error);
			return [];
		}
	};

	const renderScreenTab = (screenKey: (typeof SCREEN_TYPES)[number]) => {
		const displayConfig = watch('displayConfig');
		const routeData = watch('route');
		const sampleBitmap = `
....######........######........######.........######...............######..............######.........######.........####......#####.........#####........######......
..###....##.....##......##....##......####...##......##...........##......##..........##.......#.....###....##.......##..##...##....##.......##....###...##......##....
..#........#...##........##..#.........###..#.........##.........#.........##........##.........#....#........#.....##.......#........#......##.....##..#.........##...
.##........##..##........##.##..........##.##..........#........##..........#........##..........#..##........##....#.......##........##...######...##.##..........#...
.##........##..####......#..##..........##.##..........#........##..........#........##..........#..##........##....#.......##........##..###....#..##.##..........#...
.##........##...##....##.....##..##.....##.##..........#........##..........#........###..##.....#..##........##....####....##........##...#..####..##.##..........#...
...######..#.....##...##.......##.......##..##..####...#.........##..####...#.........##..#...##.#....######..#.....#...##...##..####........##..##.##..##..####...#...
....##..##.......#######.......#........##....##...##..#...........##...##..#..........#..#...####.....##..##.......#....##...###..##........##..##.##....##...##..#...
....##..##......######.........#.......###....##....#.##...........##....#.##..........#...######......##..##.......##...##...#....##.........####..##....##....#.##...
.....#####........#...###.......#.....####....##...##..#...........##...##..#..........##.....#.##......#####........##..##...#....##...........##..##....##...##..#...
........##........########.......######.##......####...#.............####...#............#####...#.........##.........####....###..##...........##..##......####...#...
........##........##.##.##.........#...............................#....................#........................................................#####.................
........##........####..##.....#####...........................#####................#####..............................................................................
..########.....................#..##...........................#..##................#..##..............................................................................
...............................###..####.......................###..####............###..####..........................................................................


		`;
		return (
			<div className=" overflow-y-auto bg-white p-6 rounded-xl">
				<h3 className="text-md font-semibold mb-4 text-gray-900 capitalize">
					{screenKey} Board Configuration
				</h3>

				<AccordionRoot collapsible>
					{selectedLanguages.map((language) => {
						const isEnglish = language === 'en';

						// Initialize configuration for this language if it doesn't exist
						if (!displayConfig[language]) {
							setValue(
								`displayConfig.${language}`,
								getDefaultLanguageConfig(isEnglish)
							);
						}

						const screenConfig = displayConfig[language]?.[screenKey];
						if (!screenConfig || !screenConfig.texts) return null;

						const langName =
							AVAILABLE_LANGUAGES.find((l) => l.code === language)?.name ||
							language.toUpperCase();

						return (
							<AccordionItem
								className="py-2 bg-white rounded-xl shadow mb-4 border px-4 bg-gray-00   "
								key={language}
								value={language}
							>
								<AccordionItemTrigger>
									<span className="text-md py-2 font-semibold text-gray-500">
										{langName}
									</span>
								</AccordionItemTrigger>
								<AccordionItemContent className="bg-neutral-20 p-2">
									<div className="mb-4">
										<LEDBoardBitmap
											rows={16}
											columns={96}
											bitmap={sampleBitmap}
										/>

										{screenConfig.format === 'single' && (
											<FullScreenBoard
												formData={{
													text: displayConfig[language][screenKey].texts.text
														.text,
													scrollType:
														displayConfig[language][screenKey].texts.text
															.scrollType,
													scrollSpeed:
														displayConfig[language][screenKey].texts.text
															.scrollSpeed,
													position:
														displayConfig[language][screenKey].texts.text
															.position,
													fontSize:
														displayConfig[language][screenKey].texts.text
															.fontSize,
													fontWeight:
														displayConfig[language][screenKey].texts.text
															.fontWeight,
												}}
											/>
										)}

										{screenConfig.format === 'two' && (
											<SideWithSingleTextBoard
												formData={{
													sideText:
														displayConfig[language][screenKey].texts.sideText
															.text,
													text: displayConfig[language][screenKey].texts.text
														.text,
													scrollType:
														displayConfig[language][screenKey].texts.text
															.scrollType,
													scrollSpeed:
														displayConfig[language][screenKey].texts.text
															.scrollSpeed,
													position:
														displayConfig[language][screenKey].texts.text
															.position,
													fontSize:
														displayConfig[language][screenKey].texts.text
															.fontSize,
													fontWeight:
														displayConfig[language][screenKey].texts.text
															.fontWeight,
													sideTextFontWeight:
														displayConfig[language][screenKey].texts.sideText
															.fontWeight,
													// For split route
													routeNumber1: routeData.routeNumber1,
													routeNumber2: routeData.routeNumber2,
												}}
												route={routeData} // Pass route info for route number display
											/>
										)}

										{screenConfig.format === 'three' && (
											<SideWithTwoTextsBoard
												formData={{
													sideText:
														displayConfig[language][screenKey].texts.sideText
															.text,
													sideTextFontWeight:
														displayConfig[language][screenKey].texts.sideText
															.fontWeight,
													upperHalfText:
														displayConfig[language][screenKey].texts
															.upperHalfText.text,
													lowerHalfText:
														displayConfig[language][screenKey].texts
															.lowerHalfText.text,
													// Upper half config
													upperHalfScrollType:
														displayConfig[language][screenKey].texts
															.upperHalfText.scrollType,
													upperHalfScrollSpeed:
														displayConfig[language][screenKey].texts
															.upperHalfText.scrollSpeed,
													upperHalfPosition:
														displayConfig[language][screenKey].texts
															.upperHalfText.position,
													// Lower half config
													lowerHalfScrollType:
														displayConfig[language][screenKey].texts
															.lowerHalfText.scrollType,
													lowerHalfScrollSpeed:
														displayConfig[language][screenKey].texts
															.lowerHalfText.scrollSpeed,
													lowerHalfPosition:
														displayConfig[language][screenKey].texts
															.lowerHalfText.position,
													// Font sizes
													upperHalfFontSize:
														displayConfig[language][screenKey].texts
															.upperHalfText.fontSize,
													upperHalfFontWeight:
														displayConfig[language][screenKey].texts
															.upperHalfText.fontWeight,
													lowerHalfFontSize:
														displayConfig[language][screenKey].texts
															.lowerHalfText.fontSize,
													lowerHalfFontWeight:
														displayConfig[language][screenKey].texts
															.lowerHalfText.fontWeight,

													routeNumber1: routeData.routeNumber1,
													routeNumber2: routeData.routeNumber2,
												}}
												route={routeData}
											/>
										)}

										<label className="block text-sm font-medium text-gray-600 mb-1">
											Format
										</label>
										<select
											value={screenConfig.format || 'single'}
											onChange={(e) =>
												handleFormatChange(
													screenKey,
													language,
													e.target.value as ScreenFormat
												)
											}
											className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										>
											{!isSpecialMessage
												? FORMATS.filter(
														(format) => isEnglish || format.value !== 'three'
												  ).map((format) => (
														<option key={format.value} value={format.value}>
															{format.label}
														</option>
												  ))
												: FORMATS2.filter(
														(format) => isEnglish || format.value !== 'three'
												  ).map((format) => (
														<option key={format.value} value={format.value}>
															{format.label}
														</option>
												  ))}
										</select>
									</div>

									{Object.entries(screenConfig.texts).map(
										([textKey, textConfig]) => (
											<div
												key={`${language}-${textKey}`}
												className="border p-4 bg-stone-100 border-stone-400 rounded-lg mb-4"
											>
												<h4 className="font-semibold mb-2 text-gray-700 capitalize">
													{textKey === 'sideText'
														? 'Route Number'
														: textKey.replace(/([A-Z])/g, ' $1').trim()}
												</h4>

												<div className="mb-4 items-start flex gap-4">
													<select
														className=" p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
														onChange={(e) =>
															handlePlaceholderSelect(
																screenKey,
																textKey,
																language,
																e.target.value
															)
														}
													>
														<option value="">Select placeholder</option>
														{isSpecialMessage
															? PLACE_HOLDER_OPTIONS2.map((option) => (
																	<option
																		key={option.value}
																		value={option.value}
																	>
																		{option.label}
																	</option>
															  ))
															: PLACEHOLDER_OPTIONS.map((option) => (
																	<option
																		key={option.value}
																		value={option.value}
																	>
																		{option.label}
																	</option>
															  ))}
													</select>
													{/* <input
                            {...register(
                              `displayConfig.${language}.${screenKey}.texts.${textKey}.text`
                            )}
                            placeholder="Enter text here"
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          /> */}
													<Controller
														key={`${language}-${screenKey}-${textKey}`}
														name={`displayConfig.${language}.${screenKey}.texts.${textKey}.text`}
														control={control}
														render={({ field }) => (
															<IMEInput langCode={language} {...field} />
														)}
													/>
												</div>

												<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
													<div>
														<label className="block text-sm font-medium text-gray-600 mb-1">
															Scroll Type
														</label>
														<select
															{...register(
																`displayConfig.${language}.${screenKey}.texts.${textKey}.scrollType`
															)}
															className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
														>
															{SCROLL_TYPES.map((type) => (
																<option key={type} value={type}>
																	{type}
																</option>
															))}
														</select>
													</div>

													<div>
														<label className="block text-sm font-medium text-gray-600 mb-1">
															Position
														</label>
														<select
															{...register(
																`displayConfig.${language}.${screenKey}.texts.${textKey}.position`
															)}
															className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
														>
															{POSITIONS.map((pos) => (
																<option key={pos} value={pos}>
																	{pos}
																</option>
															))}
														</select>
													</div>

													<div>
														<label className="block text-sm font-medium text-gray-600 mb-1">
															Scroll Speed
														</label>
														<input
															type="number"
															{...register(
																`displayConfig.${language}.${screenKey}.texts.${textKey}.scrollSpeed`
															)}
															className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
														/>
													</div>

													{displayConfig[language][screenKey].format !==
														'three' && (
														<div>
															<label className="block text-sm font-medium text-gray-600 mb-1">
																Font Size
															</label>
															<select
																{...register(
																	`displayConfig.${language}.${screenKey}.texts.${textKey}.fontSize`
																)}
																className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
															>
																{FONT_SIZES.map((size) => (
																	<option key={size} value={size}>
																		{size}px
																	</option>
																))}
															</select>
														</div>
													)}

													<div>
														<label className="block text-sm font-medium text-gray-600 mb-1">
															Font Weight
														</label>
														<select
															{...register(
																`displayConfig.${language}.${screenKey}.texts.${textKey}.fontWeight`
															)}
															value={
																displayConfig[language][screenKey]['texts'][
																	textKey
																]['fontWeight']
															}
															className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
														>
															{FONT_WEIGHT.map((weight) => (
																<option key={weight.value} value={weight.value}>
																	{weight.label}
																</option>
															))}
														</select>
													</div>

													{/* {displayConfig[language][screenKey].format ===
                            "three" && (
                            <div>
                              <label className="block text-sm font-medium text-gray-600 mb-1">
                                Font Size
                              </label>
                              <select
                                disabled
                                {...register(
                                  `displayConfig.${language}.${screenKey}.texts.${textKey}.fontSize`
                                )}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                {FONT_SIZES.map((size) => (
                                  <option key={size} value={size}>
                                    {size}px
                                  </option>
                                ))}
                              </select>
                            </div>
                          )} */}
												</div>
											</div>
										)
									)}
								</AccordionItemContent>
							</AccordionItem>
						);
					})}
				</AccordionRoot>
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
		try {
			// Create a deep copy of the data to avoid mutating the form state
			const configToSave = JSON.parse(JSON.stringify(data));

			// Process only selected languages
			for (const language of selectedLanguages) {
				const langConfig = AVAILABLE_LANGUAGES.find((l) => l.code === language);
				if (!langConfig) {
					console.error(`Font file not found for language: ${language}`);
					continue;
				}

				// Process all screen types (front, side, rear, internal)
				for (const screenKey of SCREEN_TYPES) {
					const screen = configToSave.displayConfig[language][screenKey];
					if (!screen || !screen.texts) continue;

					// Process each text section in the screen
					for (const [textKey, textConfig] of Object.entries(screen.texts)) {
						if (!textConfig.text) continue;

						try {
							let bitmapResponse;
							if (language !== 'en') {
								bitmapResponse = await routeService.generateBitmap(
									textConfig.text,
									langConfig.fontFile,
									textConfig.fontSize
								);
							} else {
								bitmapResponse = await routeService.generateBitmap(
									textConfig.text,
									langConfig.fontFile,
									textConfig.fontSize
								);
							}
							// Call the generateBitmap API with the correct font file

							// Store bitmap data with metadata
							screen.texts[textKey].bitmap = {
								bitmap: bitmapResponse.bitmap.join(','),
								width: bitmapResponse.width,
								height: bitmapResponse.height,
							};
						} catch (error) {
							console.error(
								`Error generating bitmap for ${language} ${screenKey} ${textKey}:`,
								error
							);
						}
					}
				}
			}
			console.log(configToSave.id);
			// Create an array with the config object
			if (isEdit) {
				updateRouteMutation.mutate({ id: configToSave.id, data: configToSave });
			} else {
				createRouteMutation.mutate(configToSave);
			}

			// const rn = configToSave.route.routeNumber;

			// Create a JSON blob and download it
			// const jsonString = JSON.stringify([configToSave], null, 2);
			// const blob = new Blob([jsonString], { type: 'application/json' });
			// const url = URL.createObjectURL(blob);

			// Create a temporary link and trigger download
			// const link = document.createElement('a');
			// link.href = url;
			// link.download = `${rn}.json`;
			// document.body.appendChild(link);
			// link.click();

			// const masterJson = [{ [configToSave.route.routeNumber]: `${rn}.json` }];

			// Create a master JSON blob and download it
			// const masterjsonString = JSON.stringify(masterJson, null, 2);
			// const masterblob = new Blob([masterjsonString], {
			// 	type: 'application/json',
			// });
			// const masterurl = URL.createObjectURL(masterblob);

			// Create a temporary link and trigger download
			// const masterlink = document.createElement('a');
			// masterlink.href = masterurl;
			// masterlink.download = `routes.json`;
			// document.body.appendChild(masterlink);
			// masterlink.click();

			// Cleanup
			// document.body.removeChild(link);
			// URL.revokeObjectURL(url);
			//
			// document.body.removeChild(masterlink);
			// URL.revokeObjectURL(masterurl);

			console.log('Configuration saved and downloaded', configToSave);
		} catch (error) {
			console.error('Error processing configuration:', error);
		}
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="w-full flex flex-col gap-4 overflow-hidden p-6"
		>
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold text-gray-900">
					Display Configuration
				</h2>
				{/* <IMEInput /> */}
				{/* <GoogleIME/> */}
				<button
					type="submit"
					className="px-4 text-sm py-2 bg-blue-700 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					{isEdit ? 'Update Configuration' : 'Save Configuration'}
				</button>
			</div>

			<div className=" border-b border-gray-200">
				<nav className="-mb-px space-x-1 flex ">
					<button
						type="button"
						onClick={() => setActiveTab('route')}
						className={`py-2 px-3 text-left max-w-[120px]   border-b-2 font-medium text-sm ${
							activeTab === 'route'
								? 'border-nav_orange bg-white text-nav_blue-500'
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
						}`}
					>
						Route
					</button>
					<button
						type="button"
						onClick={() => setActiveTab('languages')}
						className={`py-2 px-3 text-left max-w-[120px]   border-b-2 font-medium text-sm ${
							activeTab === 'languages'
								? 'border-nav_orange bg-white text-nav_blue-500'
								: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
						}`}
					>
						Languages
					</button>
					{SCREEN_TYPES.map((screenType) => (
						<button
							key={screenType}
							type="button"
							onClick={() => setActiveTab(screenType)}
							className={`py-2 px-3 text-left max-w-[120px]  border-b-2 font-medium text-sm capitalize ${
								activeTab === screenType
									? 'border-nav_orange bg-white text-nav_blue-500'
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
							}`}
						>
							{screenType} Board
						</button>
					))}
				</nav>
			</div>

			<div className="flex flex-col overflow-hidden">{renderTabContent()}</div>
		</form>
	);
};

export default DisplayConfigForm;
