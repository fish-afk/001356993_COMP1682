import React, { useState } from "react";
import AdminNavbar from "../../components/navbars/AdminNavbar";
import BASEURL from "../../constants/apiBaseUrl";
import Swal from "sweetalert2";
import axios from "axios";

export default function AddNewProductCategory() {
	const [formValues, setFormValues] = useState({
		category_name: "",
		category_description: "",
	});
	const [categoryImage, setCategoryImage] = useState(null);

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		setCategoryImage(file);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const { category_name, category_description } = formValues;

		const userData = JSON.parse(localStorage.getItem("userDataObject"));
		const jwt_key = localStorage.getItem("stock-managment-system-auth-token");
		const username = userData?.username;

		try {
			const formData = new FormData();
			formData.append("jwt_key", jwt_key);
			formData.append("username", username);
			formData.append("category_name", category_name);
			formData.append("category_description", category_description);
			formData.append("category_image", categoryImage);

			axios
				.post(BASEURL + "/productcategories/addnewcategory", formData)
				.then(async (response) => {
					const data = await response?.data;

					if (data.status == "SUCCESS") {
						Swal.fire({
							title: "Added New Category successfully!",
							timer: 3000,
							icon: "success",
						}).then(() => {
							location.reload();
						});
					} else {
						Swal.fire({
							title: data.message,
							timer: 3000,
							icon: "error",
						}).then(() => {
							location.reload();
						});
					}
				})
				.catch((error) => {
					console.log(error);
					if (error.response.status >= 500) {
						Swal.fire({
							title: "Only Images Allowed For Image Field !",
							timer: 30000,
							icon: "error",
						}).then(() => {
							location.reload();
						});
					} else {
						Swal.fire({
							title: error.response.data.message,
							timer: 30000,
							icon: "error",
						}).then(() => {
							location.reload();
						});
					}
				});
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className="d-flex" style={{ height: "100vh" }}>
			<AdminNavbar />
			<div className="container">
				<div className="d-flex justify-content-center p-2">
					<h3>Add New Product Category</h3>
				</div>

				<form className="bg-dark p-5 rounded-3" onSubmit={handleSubmit}>
					<div className="form-outline mb-3">
						<label className="text-white form-label" htmlFor="category_name">
							Category Name
						</label>
						<input
							required
							type="text"
							id="category_name"
							className="form-control"
							value={formValues.category_name}
							onChange={(e) =>
								setFormValues({
									...formValues,
									category_name: e.target.value,
								})
							}
						/>
					</div>

					<div className="form-outline mb-3">
						<label
							className="text-white form-label"
							htmlFor="category_description"
						>
							Category Description
						</label>
						<input
							required
							type="text"
							id="category_description"
							className="form-control"
							value={formValues.category_description}
							onChange={(e) =>
								setFormValues({
									...formValues,
									category_description: e.target.value,
								})
							}
						/>
					</div>

					<div className="form-outline mb-5">
						<label className="text-white form-label" htmlFor="category_image">
							Category Image
						</label>
						<input
							accept="image/jpeg,image/png,image/jpg,image/bmp,image/webp"
							type="file"
							id="category_image"
							className="form-control"
							onChange={handleFileChange}
						/>
					</div>

					<div className="d-flex justify-content-center p-4">
						<button type="submit" className="btn btn-info">
							Add Category
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
