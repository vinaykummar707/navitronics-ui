import axiosInstance from '@/config/axios';
import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/navitranix/api/languages';

const LanguageManagement = () => {
	const [languages, setLanguages] = useState([]);
	const [selectedLanguage, setSelectedLanguage] = useState(null);
	const [formData, setFormData] = useState({
		code: '',
		name: '',
		fontFile: '',
		fontHeight: 0,
		xoffset: 0,
		yoffset: 0,
		spacing: 0,
	});
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

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
		} catch (err) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const createLanguage = async (language) => {
		setIsSubmitting(true);
		try {
			const response = await axiosInstance.post(
				`/languages/create`,
				JSON.stringify(language)
			);
			await fetchLanguages();
			resetForm();
		} catch (err) {
			setError(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const updateLanguage = async (code, data) => {
		setIsSubmitting(true);
		try {
			const response = await axiosInstance.put(
				`/languages/${code}`,
				JSON.stringify(data)
			);
			await fetchLanguages();
			resetForm();
			setIsEditing(false);
		} catch (err) {
			setError(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const deleteLanguage = async (code) => {
		try {
			const response = await axiosInstance.delete(`/languages/${code}`);

			await fetchLanguages();
			setSelectedLanguage(null);
		} catch (err) {
			setError(err.message);
		}
	};

	// Form handlers
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		const parsedValue = [
			'fontHeight',
			'xoffset',
			'yoffset',
			'spacing',
		].includes(name)
			? parseFloat(value)
			: value;
		setFormData({ ...formData, [name]: parsedValue });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (isEditing) {
			updateLanguage(formData.code, formData);
		} else {
			createLanguage(formData);
		}
	};

	const handleEdit = (language) => {
		setFormData({
			code: language.code,
			name: language.name,
			fontFile: language.fontFile,
			fontHeight: language.fontHeight,
			xoffset: language.xoffset,
			yoffset: language.yoffset,
			spacing: language.spacing,
		});
		setIsEditing(true);
		setSelectedLanguage(language);
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
			fontHeight: 0,
			xoffset: 0,
			yoffset: 0,
			spacing: 0,
		});
		setSelectedLanguage(null);
		setIsEditing(false);
	};

	// if (isLoading) {
	// 	return <div className="flex justify-center p-8">Loading languages...</div>;
	// }

	return (
		<div className="container mx-auto p-4 overflow-y-scroll">
			<h1 className="text-lg font-bold mb-6">Language Management</h1>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					Error: {error}
				</div>
			)}

			<div className="flex flex-col gap-4">
				{/* Language Form */}
				<div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
					<h2 className="text-lg font-semibold mb-4">
						{isEditing ? 'Edit Language' : 'Add New Language'}
					</h2>

					<form
						onSubmit={handleSubmit}
						className=" flex items-end justify-center gap-4"
					>
						<div>
							<label className="block text-sm font-medium ">Code</label>
							<input
								type="text"
								name="code"
								value={formData.code}
								onChange={handleInputChange}
								className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium ">Name</label>
							<input
								type="text"
								name="name"
								value={formData.name}
								onChange={handleInputChange}
								className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium ">Font File</label>
							<input
								type="text"
								name="fontFile"
								value={formData.fontFile}
								onChange={handleInputChange}
								className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium ">Font Height</label>
							<input
								type="number"
								step="0.1"
								name="fontHeight"
								value={formData.fontHeight}
								onChange={handleInputChange}
								className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium ">X Offset</label>
							<input
								type="number"
								step="0.1"
								name="xoffset"
								value={formData.xoffset}
								onChange={handleInputChange}
								className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium ">Y Offset</label>
							<input
								type="number"
								step="0.1"
								name="yoffset"
								value={formData.yoffset}
								onChange={handleInputChange}
								className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium ">Spacing</label>
							<input
								type="number"
								step="0.1"
								name="spacing"
								value={formData.spacing}
								onChange={handleInputChange}
								className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
								required
							/>
						</div>

						<div className="flex items-end justify-end gap-2">
							<button
								type="submit"
								className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Processing...' : isEditing ? 'Update ' : 'Add'}
							</button>

							{isEditing && (
								<button
									type="button"
									onClick={resetForm}
									className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
								>
									Cancel
								</button>
							)}
						</div>
					</form>
				</div>

				{/* Languages List */}
				<div className="lg:col-span-2">
					<div className="bg-white rounded-lg shadow overflow-hidden">
						<div className="flex justify-between items-center p-4 border-b">
							<h2 className="text-xl font-semibold">Languages</h2>
							<button
								onClick={fetchLanguages}
								className="text-blue-600 hover:text-blue-800"
							>
								Refresh
							</button>
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
										<th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
											Font File
										</th>
										<th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
											Font Height
										</th>
										<th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
											X Offset
										</th>
										<th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
											Y Offset
										</th>
										<th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
											Spacing
										</th>
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
												<td className="px-4 py-3 text-sm">
													{language.fontFile}
												</td>
												<td className="px-4 py-3 text-sm">
													{language.fontHeight}
												</td>
												<td className="px-4 py-3 text-sm">
													{language.xoffset}
												</td>
												<td className="px-4 py-3 text-sm">
													{language.yoffset}
												</td>
												<td className="px-4 py-3 text-sm">
													{language.spacing}
												</td>
												<td className="px-4 py-3 text-sm whitespace-nowrap">
													<button
														onClick={() => handleEdit(language)}
														className="text-blue-600 hover:text-blue-800 mr-3"
													>
														Edit
													</button>
													<button
														onClick={() => handleDelete(language.code)}
														className="text-red-600 hover:text-red-800"
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

					{/* Language Details */}
					{selectedLanguage && (
						<div className="mt-6 bg-white rounded-lg shadow p-4">
							<h3 className="text-lg font-medium mb-3">Language Details</h3>
							<div className="grid grid-cols-2 gap-4">
								<div className="text-sm">
									<p className="font-medium">Code:</p>
									<p>{selectedLanguage.code}</p>
								</div>
								<div className="text-sm">
									<p className="font-medium">Name:</p>
									<p>{selectedLanguage.name}</p>
								</div>
								<div className="text-sm">
									<p className="font-medium">Font File:</p>
									<p>{selectedLanguage.fontFile}</p>
								</div>
								<div className="text-sm">
									<p className="font-medium">Font Height:</p>
									<p>{selectedLanguage.fontHeight}</p>
								</div>
								<div className="text-sm">
									<p className="font-medium">X Offset:</p>
									<p>{selectedLanguage.xoffset}</p>
								</div>
								<div className="text-sm">
									<p className="font-medium">Y Offset:</p>
									<p>{selectedLanguage.yoffset}</p>
								</div>
								<div className="text-sm">
									<p className="font-medium">Spacing:</p>
									<p>{selectedLanguage.spacing}</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default LanguageManagement;
