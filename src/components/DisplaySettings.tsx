import { useForm } from 'react-hook-form';
import SideWithTwoTextsBoard from './SideWithTwoHalfsBoard';
import {
	DialogContent,
	DialogRoot,
	DialogTrigger,
	DialogHeader,
	DialogBody,
} from './ui/dialog';
import { Button, ButtonGroup } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import axiosInstance from '@/config/axios';
import { toast } from 'react-toastify';

interface TextSettings {
	fontHeight: string;
	fontFamily: string;
	x_offset: string;
	y_offset: string;
	spacing: string;
	scrollSpeed: string;
	scrollType: string;
	fontSize: string;
	position: string;
	fontWeight: string;
}

interface TextSettings2 {
	fontHeight: string;
	fontFamily16: string;
	fontFamily8: string;
	x_offset: string;
	y_offset: string;
	spacing: string;
	scrollSpeed: string;
	scrollType: string;
	fontSize: string;
	position: string;
	fontWeight: string;
}

interface DisplaySettingsState {
	code: string;
	name: string;
	fontFile: string | null;
	fontFamily: string | null;
	config: {
		sideText: TextSettings2;
		text: TextSettings2;
		routeNumber1: TextSettings2;
		routeNumber2: TextSettings2;
		upperHalfText: TextSettings2;
		lowerHalfText: TextSettings2;
	};
}

const initialState: DisplaySettingsState = {
	code: '',
	name: '',
	fontFile: null,
	fontFamily: null,
	config: {
		sideText: {
			fontHeight: '',
			fontFamily16: '',
			fontFamily8: '',
			x_offset: '',
			y_offset: '',
			spacing: '',
			scrollSpeed: '',
			scrollType: '',
			fontSize: '',
			position: '',
			fontWeight: '',
		},
		routeNumber1: {
			fontHeight: '',
			fontFamily16: '',
			fontFamily8: '',
			x_offset: '',
			y_offset: '',
			spacing: '',
			scrollSpeed: '',
			scrollType: '',
			fontSize: '',
			position: '',
			fontWeight: '',
		},
		routeNumber2: {
			fontHeight: '',
			fontFamily16: '',
			fontFamily8: '',
			x_offset: '',
			y_offset: '',
			spacing: '',
			scrollSpeed: '',
			scrollType: '',
			fontSize: '',
			position: '',
			fontWeight: '',
		},
		text: {
			fontHeight: '',
			fontFamily16: '',
			fontFamily8: '',
			x_offset: '',
			y_offset: '',
			spacing: '',
			scrollSpeed: '',
			scrollType: '',
			fontSize: '',
			position: '',
			fontWeight: '',
		},
		upperHalfText: {
			fontHeight: '',
			fontFamily16: '',
			fontFamily8: '',
			x_offset: '',
			y_offset: '',
			spacing: '',
			scrollSpeed: '',
			scrollType: '',
			fontSize: '',
			position: '',
			fontWeight: '',
		},
		lowerHalfText: {
			fontHeight: '',
			fontFamily16: '',
			fontFamily8: '',
			x_offset: '',
			y_offset: '',
			spacing: '',
			scrollSpeed: '',
			scrollType: '',
			fontSize: '',
			position: '',
			fontWeight: '',
		},
	},
};

interface TextSettingsFormProps {
	settings: TextSettings | TextSettings2;
	title: string;
	configKey: string;
	register: any;
}

const FONT_SIZES = [2, 4, 6, 8, 10, 12, 14, 16] as const;

const TextSettingsForm = ({
	settings,
	title,
	configKey,
	register,
}: TextSettingsFormProps) => {
	return (
		<div className="flex bg-white flex-col gap-4 p-4 border rounded-lg">
			<h3 className="text-lg font-semibold">{title}</h3>
			<div className="grid grid-cols-3 gap-4">
				<div className="flex flex-col gap-2">
					<label className="text-sm text-neutral-500">Font Family 16</label>
					<input
						type="text"
						{...register(`${configKey}.fontFamily16`)}
						className="border rounded-lg p-2"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label className="text-sm text-neutral-500">Font Family 8 </label>
					<input
						type="text"
						{...register(`${configKey}.fontFamily8`)}
						className="border rounded-lg p-2"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label className="text-sm text-neutral-500">Font Height</label>
					<input
						type="number"
						{...register(`${configKey}.fontHeight`)}
						className="border rounded-lg p-2"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label className="text-sm text-neutral-500">Width Aspect</label>
					<input
						type="number"
						{...register(`${configKey}.fontSize`)}
						className="border rounded-lg p-2"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label className="text-sm text-neutral-500">Font Weight</label>
					<select
						{...register(`${configKey}.fontWeight`)}
						className="border rounded-lg p-2"
					>
						<option value="">Select Font Weight</option>
						<option value="normal">Regular</option>
						<option value="bold">Bold</option>
					</select>
				</div>
				{/* <div className="flex flex-col gap-2">
					<label className="text-sm text-neutral-500">X Offset</label>
					<input
						type="number"
						{...register(`${configKey}.x_offset`)}
						className="border rounded-lg p-2"
					/>
				</div> */}
				{/* <div className="flex flex-col gap-2">
					<label className="text-sm text-neutral-500">Y Offset</label>
					<input
						type="number"
						{...register(`${configKey}.y_offset`)}
						className="border rounded-lg p-2"
					/>
				</div> */}
				<div className="flex flex-col gap-2">
					<label className="text-sm text-neutral-500">Thresshold</label>
					<input
						type="number"
						{...register(`${configKey}.spacing`)}
						className="border rounded-lg p-2"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label className="text-sm text-neutral-500">Speed</label>
					<input
						type="number"
						{...register(`${configKey}.scrollSpeed`)}
						min={1}
						max={10}
						className="border rounded-lg p-2"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label className="text-sm text-neutral-500">Scroll Type</label>
					<select
						{...register(`${configKey}.scrollType`)}
						className="border rounded-lg p-2"
					>
						<option value="">Select Scroll Type</option>
						<option value="Fixed">Fixed</option>
						<option value="Left To Right">Left To Right</option>
						<option value="Right To Left">Right To Left</option>
						<option value="Flicker">Flicker</option>
					</select>
				</div>
				{/* <div className="flex flex-col gap-2">
					<label className="text-sm text-neutral-500">Font Size</label>
					
					<select
						{...register(`${configKey}.fontSize`)}
						className="border rounded-lg p-2"
					>
						<option value="">Select Font Size</option>
						{FONT_SIZES.map((size) => (
							<option key={size} value={size}>
								{size}
							</option>
						))}
					</select>
				</div> */}
				<div className="flex flex-col gap-2">
					<label className="text-sm text-neutral-500">Position</label>
					<select
						{...register(`${configKey}.position`)}
						className="border rounded-lg p-2"
					>
						<option value="">Select Position</option>
						<option value="Left">Left</option>
						<option value="Center">Center</option>
						<option value="Right">Right</option>
					</select>
				</div>
			</div>
		</div>
	);
};

interface DisplaySettingsProps {
	isEdit?: boolean;
	initialData?: DisplaySettingsState;
	onOperationComplete: any;
}

const DisplaySettings = ({
	isEdit = false,
	initialData,
	onOperationComplete,
}: DisplaySettingsProps) => {
	const { register, watch, reset, setValue, handleSubmit } =
		useForm<DisplaySettingsState>({
			defaultValues: initialState,
		});

	const formValues = watch();
	const selectedLanguage = watch('code');

	// Log changes whenever form values update

	useEffect(() => {
		console.log('Selected Language:', initialData);
		if (initialData && isEdit) {
			reset(initialData);
		}
	}, [initialData]);

	const onSubmit = async (data: DisplaySettingsState) => {
		try {
			if (isEdit) {
				await axiosInstance.put(`/languages/${data.code}`, data);
				toast.success('Language updated successfully!');
			} else {
				await axiosInstance.post('/languages/create', data);
				toast.success('Language created successfully!');
			}
			onOperationComplete();
			reset(initialState);
		} catch (err) {
			toast.error('Error processing request!');
			console.error(err);
		}
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="flex-1 overflow-y-scroll"
		>
			<div>
				<div className="flex flex-col gap-2">
					<div className="flex justify-end gap-4 mt-6">
						<button
							type="button"
							className="bg-gray-500 text-white px-4 py-2 rounded-lg"
							onClick={() => {
								console.log('Cancel clicked');
								// onOperationComplete();
								reset(initialState);
							}}
						>
							Cancel
						</button>
						<Button
							className="bg-blue-500 text-white px-4 py-2 rounded-lg"
							type="submit"
						>
							{isEdit ? 'Update' : 'Create'}
						</Button>
					</div>
					<div className="flex bg-white flex-col gap-4 p-4 border rounded-lg">
						<h3 className="text-lg font-semibold">Language Settings</h3>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-2">
								<label className="text-sm text-neutral-500">
									Language Code
								</label>
								<select {...register('code')} className="border rounded-lg p-2">
									<option value="">Select Language Code</option>
									<option value="en">English (en)</option>
									<option value="hi">Hindi (hi)</option>
									<option value="bn">Bengali (bn)</option>
									<option value="te">Telugu (te)</option>
									<option value="ta">Tamil (ta)</option>
									<option value="mr">Marathi (mr)</option>
									<option value="gu">Gujarati (gu)</option>
									<option value="kn">Kannada (kn)</option>
									<option value="ml">Malayalam (ml)</option>
									<option value="pa">Punjabi (pa)</option>
									<option value="or">Odia (or)</option>
									<option value="as">Assamese (as)</option>
									<option value="sa">Sanskrit (sa)</option>
									<option value="ks">Kashmiri (ks)</option>
									<option value="ne">Nepali (ne)</option>
									<option value="sd">Sindhi (sd)</option>
									<option value="bo">Bodo (bo)</option>
									<option value="doi">Dogri (doi)</option>
									<option value="brx">Bodo (brx)</option>
									<option value="mni">Manipuri (mni)</option>
									<option value="kok">Konkani (kok)</option>
									<option value="mai">Maithili (mai)</option>
									<option value="sat">Santali (sat)</option>
									<option value="lus">Mizo (lus)</option>
									<option value="njz">Wancho (njz)</option>
									<option value="kha">Khasi (kha)</option>
								</select>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-sm text-neutral-500">
									Language Name
								</label>
								<input
									type="text"
									{...register('name')}
									className="border rounded-lg p-2"
								/>
							</div>
							{/* <div className="flex flex-col gap-2">
								<label className="text-sm text-neutral-500">
									Font File Name
								</label>
								<input
									type="text"
									{...register('fontFile')}
									className="border rounded-lg p-2"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-sm text-neutral-500">Font Family</label>
								<input
									type="text"
									{...register('fontFamily')}
									className="border rounded-lg p-2"
								/>
							</div> */}
						</div>
					</div>

					<TextSettingsForm
						settings={formValues.config.sideText}
						title="Route Number Text"
						configKey="config.sideText"
						register={register}
					/>

					<TextSettingsForm
						settings={formValues.config.routeNumber1}
						title="Route Number 1"
						configKey="config.routeNumber1"
						register={register}
					/>

					<TextSettingsForm
						settings={formValues.config.routeNumber2}
						title="Route Number 2"
						configKey="config.routeNumber2"
						register={register}
					/>

					<TextSettingsForm
						settings={formValues.config.text}
						title="Main Text"
						configKey="config.text"
						register={register}
					/>

					{selectedLanguage === 'en' && (
						<>
							<TextSettingsForm
								settings={formValues.config.upperHalfText}
								title="Upper Half Text"
								configKey="config.upperHalfText"
								register={register}
							/>

							<TextSettingsForm
								settings={formValues.config.lowerHalfText}
								title="Lower Half Text"
								configKey="config.lowerHalfText"
								register={register}
							/>
						</>
					)}
				</div>
			</div>
		</form>
	);
};

export default DisplaySettings;
