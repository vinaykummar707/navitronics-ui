import axiosInstance from '@/config/axios';
import React, { useState, useEffect } from 'react';
import DisplaySettings from './DisplaySettings';
import { Button } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import LEDMatrix from './CanvasText';

const API_URL = `${import.meta.env.VITE_CONTROLLER_API_URL || 'https://api.navitronix.in/navitranix/api'}/languages`;

const LanguageManagement = () => {
	const [languages, setLanguages] = useState([]);
	const [selectedLanguage, setSelectedLanguage] = useState(null);
	const [formData, setFormData] = useState({
		code: '',
		name: '',
		fontFile: '',
		fontFamily: '',
		fontHeight: 0,
		fontSize: 0,
		x_offset: 0,
		y_offset: 0,
		spacing: 0,
	});
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDisplaySettingsOpen, setIsDisplaySettingsOpen] = useState(false);

	// Fetch languages on component mount
	useEffect(() => {
		fetchLanguages();
	}, []);

	// API service functions
	const fetchLanguages = async () => {
		setIsLoading(true);
		try {
			const response = await axiosInstance.get(`/languages/all`);
			// if (!response.ok) throw new Error('Failed to fetch languages');
			const data = await response.data;
			setLanguages(data);
			setError(null);
			toast.success('Languages fetched successfully!');
		} catch (err) {
			toast.error('Failed to fetch languages!');
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const deleteLanguage = async (code) => {
		try {
			const response = await axiosInstance.delete(`/languages/${code}`);

			await fetchLanguages();
			setSelectedLanguage(null);
			toast.success('Language deleted successfully!');
		} catch (err) {
			toast.error('Failed to delete language!');
			setError(err.message);
		}
	};

	// Form handlers
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		const parsedValue = [
			'fontHeight',
			'x_offset',
			'y_offset',
			'spacing',
		].includes(name)
			? parseFloat(value)
			: value;
		setFormData({ ...formData, [name]: parsedValue });
	};

	// const handleSubmit = (e) => {
	// 	e.preventDefault();
	// 	if (isEditing) {
	// 		updateLanguage(formData.code, formData);
	// 	} else {
	// 		createLanguage(formData);
	// 	}
	// };

	const handleEdit = (language) => {
		console.log(language);
		setIsEditing(true);
		setSelectedLanguage(language);
		setIsDisplaySettingsOpen(true);
	};

	const handleDelete = (code) => {
		if (window.confirm('Are you sure you want to delete this language?')) {
			deleteLanguage(code);
		}
	};

	const resetForm = () => {
		setFormData({
			code: '',
			name: '',
			fontFile: '',
			fontFamily: '',
			fontHeight: 0,
			x_offset: 0,
			y_offset: 0,
			spacing: 0,
			fontSize: 0,
		});
		setSelectedLanguage(null);
		setIsEditing(false);
	};

	const onOperationComplete = () => {
		fetchLanguages();
	};

	// if (isLoading) {
	// 	return <div className="flex justify-center p-8">Loading languages...</div>;
	// }

	const defaultPattern = [
		"###......###....########......###....................######......###########.......######......#########...........###........#########....",
		"###......###....##########....###..................#########.....###########.....#########.....###########........#####.......##########...",
		"###......###....###########...###..................##########....###########....###########....############.......#####.......###########..",
		"###......###....###.....###...###.................###.....####...###............###.....####...###......###.......#####.......###.....####.",
		"###......###....###.....###...###.................###......###...###...........####......###...###......###......###.###......###......###.",
		"###......###....###.....###...###.................####...........###...........###.............###......###......###.###......###......####",
		"###......###....###.....###...###..................#######.......###########...###.............###########......####.####.....###.......###",
		"###......###....###########...###...................########.....###########...###.............##########.......###...###.....###.......###",
		"###......###....##########....###....................########....###########...###.............############.....###...###.....###.......###",
		"###......###....#########.....###..........######........#####...###...........###.............###......###....###.....###....###.......###",
		"###......###....###...........###..........######..##......###...###...........###.......##....###......####...###########....###......####",
		"###......###....###...........###..........######.###......###...###...........####......###...###......####..#############...###......###.",
		"####.....###....###...........###.................####....####...###............###.....####...###......####..###.......###...###.....####.",
		".###########....###...........###########..........###########...############...###########....############...###.......###...###########..",
		".##########.....###...........###########..........##########....############....#########.....###########...####.......####..##########...",
		"...######.......###...........###########............######......############......######......##########....###.........###..########.....",
	];


	return (
		<div className=" gap-4 w-full flex p-4 h-full overflow-hidden">
			{/* {error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					Error: {error}
				</div>
			)} */}

			

			<DisplaySettings
				isEdit={isEditing}
				initialData={selectedLanguage}
				onOperationComplete={onOperationComplete}
			/>

			<div className="flex-1 flex flex-col   gap-4">
				{/* Languages List */}
				<div className="">
					<div className="bg-white overflow-y-auto rounded-lg shadow overflow-hidden">
						<div className="flex justify-between items-center p-4 border-b">
			
							<h2 className="text-xl font-semibold">Languages</h2>
							{/* <div className="flex gap-4">
								<Button
									className="bg-blue-500 text-sm text-white hover:bg-blue-600 p-4"
									onClick={() => {
										setIsEditing(false);
										setIsDisplaySettingsOpen(true);
									}}
								>
									Add Language
								</Button>
							</div> */}
						</div>

						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
											Code
										</th>
										<th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
											Name
										</th>
										{/* <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
											Font File
										</th> */}
										{/* <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
											Font Family
										</th> */}

										<th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{languages && languages.length > 0 ? (
										languages.map((language) => (
											<tr key={language.code} className="hover:bg-gray-50">
												<td className="px-4 py-3 text-sm">{language.code}</td>
												<td className="px-4 py-3 text-sm">{language.name}</td>
												{/* <td className="px-4 py-3 text-sm">
													{language.fontFile}
												</td> */}
												{/* <td className="px-4 py-3 text-sm">
													{language.fontFamily}
												</td> */}
												<td className="px-4 py-3 text-sm whitespace-nowrap">
													<button
														onClick={() => handleEdit(language)}
														className="bg-blue-500 text-white hover:bg-blue-600 px-2 py-1 rounded mr-2"
													>
														Edit
													</button>
													<button
														onClick={() => handleDelete(language.code)}
														className="bg-red-500 text-white hover:bg-red-600 px-2 py-1 rounded"
													>
														Delete
													</button>
												</td>
											</tr>
										))
									) : (
										<tr>
											<td
												colSpan="4"
												className="px-4 py-3 text-center text-gray-500"
											>
												No languages found
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LanguageManagement;
