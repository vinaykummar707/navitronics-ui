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
	config: {
		sideText: TextSettings;
		text: TextSettings;
		upperHalfText: TextSettings;
		lowerHalfText: TextSettings;
	};
}

const initialState: DisplaySettingsState = {
	code: '',
	name: '',
	fontFile: null,
	config: {
		sideText: {
			fontHeight: '',
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
	settings: TextSettings;
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
					<label className="text-sm text-neutral-500">Font Height</label>
					<input
						type="number"
						{...register(`${configKey}.fontHeight`)}
						className="border rounded-lg p-2"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label className="text-sm text-neutral-500">X Offset</label>
					<input
						type="number"
						{...register(`${configKey}.x_offset`)}
						className="border rounded-lg p-2"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label className="text-sm text-neutral-500">Y Offset</label>
					<input
						type="number"
						{...register(`${configKey}.y_offset`)}
						className="border rounded-lg p-2"
					/>
				</div>
				<div className="flex flex-col gap-2">
					<label className="text-sm text-neutral-500">Spacing</label>
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
				<div className="flex flex-col gap-2">
					<label className="text-sm text-neutral-500">Font Size</label>
					{/* <input
						type="number"
						{...register(`${configKey}.fontSize`)}
						className="border rounded-lg p-2"
					/> */}
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
				</div>
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
				<div className="flex flex-col gap-2">
					<label className="text-sm text-neutral-500">Font Weight</label>
					<select
						{...register(`${configKey}.fontWeight`)}
						className="border rounded-lg p-2"
					>
						<option value="">Select Font Weight</option>
						<option value="regular">Regular</option>
						<option value="bold">Bold</option>
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
							<div className="flex flex-col gap-2">
								<label className="text-sm text-neutral-500">
									Font File Name
								</label>
								<input
									type="text"
									{...register('fontFile')}
									className="border rounded-lg p-2"
								/>
							</div>
						</div>
					</div>

					<TextSettingsForm
						settings={formValues.config.sideText}
						title="Side Text Settings"
						configKey="config.sideText"
						register={register}
					/>

					<TextSettingsForm
						settings={formValues.config.text}
						title="Main Text Settings"
						configKey="config.text"
						register={register}
					/>

					{selectedLanguage === 'en' && (
						<>
							<TextSettingsForm
								settings={formValues.config.upperHalfText}
								title="Upper Half Text Settings"
								configKey="config.upperHalfText"
								register={register}
							/>

							<TextSettingsForm
								settings={formValues.config.lowerHalfText}
								title="Lower Half Text Settings"
								configKey="config.lowerHalfText"
								register={register}
							/>
						</>
					)}
				</div>
				<div className="flex justify-end gap-4 mt-6">
					<button
						type="button"
						className="bg-blue-500 text-white px-4 py-2 rounded-lg"
						onClick={() => {
							console.log('Cancel clicked');
							// onOperationComplete();
							reset(initialState);
						}}
					>
						Cancel
					</button>
					<Button
						className="bg-green-500 text-white px-4 py-2 rounded-lg"
						type="submit"
					>
						{isEdit ? 'Update' : 'Create'}
					</Button>
				</div>
			</div>
		</form>
	);
};

export default DisplaySettings;
