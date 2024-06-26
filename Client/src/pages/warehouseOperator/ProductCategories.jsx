import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import BASEURL from "../../constants/apiBaseUrl";
import axios from "axios";
import IMAGESBASEURL from "../../constants/imagesBaseUrl";
import WarehouseOperatorNavbar from "../../components/navbars/WarehouseOperatorNavbar";

export default function ProductCategoriesWh() {
	const Navigate = useNavigate();
	const [ProductCategories, setProductCategories] = useState([]);

	const func = async () => {
		const userData = JSON.parse(localStorage.getItem("userDataObject"));
		const jwt_key = localStorage.getItem("stock-managment-system-auth-token");
		const username = userData?.username;
		let data = await axios.post(
			BASEURL + "/productcategories/getallproductcategories",
			{
				username,
				jwt_key,
			},
		);
		const response = data?.data;
		console.log(response);

		setProductCategories(response?.data == undefined ? [] : response?.data);
	};
	useEffect(() => {
		func();
	}, []);

	return (
		<div className="d-flex">
			<WarehouseOperatorNavbar />
			<div
				className="container pb-5 overflow-auto"
				style={{ maxHeight: "100vh" }}
			>
				<div className="title text-center p-1 mt-2 mb-5">
					<h1 className="fw-light">Current Product Categories In The System</h1>
				</div>

				<div className="container-fluid mt-1 ">
					<div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
						{ProductCategories.map((ProductCategory) => (
							<div
								className="col item-cardss-parent"
								key={ProductCategory.category_id}
							>
								<div
									className="card h-100 text-white p-2 bg-dark"
									style={{
										position: "relative", // Ensure the overlay is positioned correctly
										overflow: "hidden", // Prevent the overlay from overflowing the card
									}}
								>
									<div
										className="item-cardss"
										style={{
											backgroundImage: `url(${IMAGESBASEURL}/product_categories/${
												ProductCategory.category_image_name || "none"
											})`,
											backgroundSize: "cover",
											backgroundPosition: "center",
											backgroundRepeat: "no-repeat",
											position: "absolute",
											top: 0,
											left: 0,
											width: "100%",
											height: "100%",
											zIndex: 1, // Place the overlay behind the content
											filter: "brightness(0.35)", // Adjust the brightness
										}}
									></div>
									<div
										className="card-body"
										style={{ position: "relative", zIndex: 2 }} // Ensure the content is above the overlay
									>
										<h5 className="card-title">
											{ProductCategory.category_name}
										</h5>
										<p className="card-text">
											{ProductCategory.category_description}
										</p>
										<p className="card-text">
											Products : {ProductCategory.number_of_products}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
