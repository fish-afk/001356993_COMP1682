import React from "react";
import WarehouseOperatorNavbar from "../../components/navbars/WarehouseOperatorNavbar";
import { Link } from "react-router-dom";
import { FaRegUserCircle } from "react-icons/fa";
import PurchasesChart from "../../components/charts/PurchasesChart";
import SalesChart from "../../components/charts/SalesChart";
import Swal from "sweetalert2";
import ProductCategoryChart from "../../components/charts/ProductCategoryChart";
import axios from "axios";
import BASEURL from "../../constants/apiBaseUrl";
import { saveAs } from "file-saver";

export default function WarehouseOperatorDashboard() {
	const func = async (option) => {
		const userData = JSON.parse(localStorage.getItem("userDataObject"));
		const jwt_key = localStorage.getItem("stock-managment-system-auth-token");
		const username = userData?.username;
		let response = await axios.post(
			BASEURL + "/export/exportinventorydata",
			{
				username,
				jwt_key,
				option,
			},
			{
				responseType: option == "csv" ? "blob" : "json",
				timeout: 10000,
			},
		);

		if (option == "json") {
			const jsonData = response.data.data;
			const jsonDataStr = JSON.stringify(jsonData, null, 2);
			saveAs(new Blob([jsonDataStr]), "inventory_export.json");
			return;
		} else {
			const contentDisposition = response.headers["content-disposition"];
			let filename = "inventory_export.zip"; // Default filename

			if (contentDisposition) {
				const matches = /filename="([^"]+)"/.exec(contentDisposition);
				if (matches != null && matches[1]) {
					filename = matches[1];
				}
			}

			saveAs(new Blob([response.data]), filename);
		}
	};

	const getDate = () => {
		const today = new Date();
		const day = today.getDate();
		const month = today.toLocaleString("default", { month: "long" });
		const year = today.getFullYear();

		const daySuffix = (day) => {
			if (day > 3 && day < 21) return "th";
			switch (day % 10) {
				case 1:
					return "st";
				case 2:
					return "nd";
				case 3:
					return "rd";
				default:
					return "th";
			}
		};

		const formattedDate = `${day}${daySuffix(day)} ${month} ${year}`;

		return formattedDate;
	};
	const handleExportData = () => {
			Swal.fire({
				title: "Export Inventory Data",
				text: "Please select the format:",
				icon: "info",
				showCancelButton: true,
				confirmButtonText: "JSON",
				cancelButtonText: "CSV",
				cancelButtonColor: 'green',
				confirmButtonColor: 'blue'
			}).then(async (result) => {
				if (result.isConfirmed) {
					// Export as JSON
					await func('json')
					Swal.fire(
						"Exported!",
						"Inventory data has been exported as JSON.",
						"success",
					);
				} else if (result.dismiss === Swal.DismissReason.cancel) {
					// Export as CSV
					await func("csv");
					Swal.fire(
						"Exported!",
						"Inventory data has been exported as CSV.",
						"success",
					);
				}
			});
	};
	const username = JSON.stringify(
		JSON.parse(localStorage.getItem("userDataObject")).username,
	).replaceAll('"', "");
	
	return (
		<div className="d-flex">
			<WarehouseOperatorNavbar priv={"WarehouseOperator"} />
			<div className="text-end overflow-auto" style={{ maxHeight: "100vh" }}>
				<div className="d-flex justify-content-between align-items-center">
					<div className="text-start">
						<h5 className="p-3">
							<em>{getDate()}</em>
						</h5>
					</div>
					<div>
						<h5 className="p-3 text-end">
							<FaRegUserCircle className="me-2" size={20} />
							<em>{username} : Warehouse-operator</em>
						</h5>
					</div>
				</div>
				<div className="text-start p-3 pt-2">
					<h4 className="text-primary">
						<em>Inventory stats 📈</em>
					</h4>

					<div className="d-flex p-3 pt-5">
						<PurchasesChart sizeH={"350vh"} sizeW={"450vw"} />
						<ProductCategoryChart sizeW="300vw" sizeH="400vh" legendPosition={"top"}/>
						<SalesChart sizeH={"350vh"} sizeW={"450vw"} orientation="y" />
					</div>
				</div>

				<div className="text-start p-3 pt-3">
					<h4 className="text-primary">
						<em>Quick shortcuts 🔗</em>
					</h4>
					<div className="pt-3">
						<Link
							to="/warehouse-operator/pages/purchases/new"
							className="btn btn-primary me-4 ps-4 pe-4"
						>
							Add purchase
						</Link>
						<Link
							to="/warehouse-operator/pages/sales/new"
							className="btn btn-primary m-4 ps-4 pe-4"
						>
							Add sale
						</Link>
						<Link
							to="/warehouse-operator/pages/products/new"
							className="btn btn-primary m-4 ps-4 pe-4"
						>
							Add product
						</Link>
						<Link
							to="/editprofile/wh"
							className="btn btn-primary m-4 ps-4 pe-4"
						>
							Edit profile
						</Link>
						<Link
							to="/changepassword/wh"
							className="btn btn-primary m-4 ps-4 pe-4"
						>
							Change password
						</Link>
						<button className="btn btn-primary m-4 ps-4 pe-4" onClick={handleExportData}>
							Export inventory data
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
