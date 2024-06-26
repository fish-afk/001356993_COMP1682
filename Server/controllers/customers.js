const { pool } = require("../models/_mysql");

async function getAllCustomers(req, res) {
	try {
		const query = "SELECT * FROM customers";
		const [Customers] = await pool.query(query);

		return res.send({
			status: "SUCCESS",
			message: "Customers Retrieved",
			data: Customers,
		});
	} catch (error) {
		console.error(error);
		res.json({ status: "FAILURE", message: "Internal server error" });
	}
}

async function deleteCustomer(req, res) {
	let customerId = req.body["customer_id"];

	try {
		await pool.query("DELETE FROM Customers WHERE customer_id = ?", [
			customerId,
		]);
		return res.send({
			status: "SUCCESS",
			message: `Customer with ID ${customerId} deleted successfully.`,
		});
	} catch (err) {
		console.log(err);
		return res
			.status(500)
			.send({ status: "FAILURE", message: "Unknown error" });
	}
}

async function editCustomer(req, res) {
	const { customer_id, customer_name, email } = req.body;

	const customer = { customer_name, email };

	try {
		await pool.query("UPDATE Customers SET ? WHERE customer_id = ?", [
			customer,
			customer_id,
		]);
		return res.send({
			status: "SUCCESS",
			message: "Customer updated successfully",
		});
	} catch (err) {
		console.log(err);
		return res
			.status(500)
			.send({ status: "FAILURE", message: "Unknown error" });
	}
}

async function addCustomer(req, res) {
	const { customer_name, email, phone } = req.body;

	const customer = { customer_name, email, phone };

	try {
		await pool.query("INSERT INTO Customers SET ?", customer);
		return res.send({
			status: "SUCCESS",
			message: "Customer added successfully",
		});
	} catch (err) {
		console.log(err);
		return res
			.status(500)
			.send({ status: "FAILURE", message: "Unknown error" });
	}
}

module.exports = {
	getAllCustomers,
	deleteCustomer,
	editCustomer,
	addCustomer,
};
