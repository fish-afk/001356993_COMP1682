const jwt = require("jsonwebtoken");
const Mysql = require("../models/_mysql");

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const generateJwtToken = (username, role_id = 3, type = "normal") => {
	const date = new Date();
	const JWT_EXPIRATION_TIME = Math.floor(date.getTime() / 1000) + 60 * 30; // 30 minutes from now
	const REFRESH_EXPIRATION_TIME = date.setMonth(date.getMonth() + 1); // 1 month from now

	const freshJwt = jwt.sign(
		{
			username,
			exp: type == "normal" ? JWT_EXPIRATION_TIME : REFRESH_EXPIRATION_TIME,
			role_id: role_id,
		},
		type == "normal" ? JWT_SECRET : REFRESH_SECRET,
	);

	return freshJwt;
};

const generateRefreshToken = async (username, role_id = 3) => {
	try {
		const query = `UPDATE users SET auth_refresh_token = ? WHERE username = ?`;

		let token = generateJwtToken(username, role_id, "refresh");

		const [results] = await Mysql.pool.query(query, [token, username]);

		if (results.affectedRows === 1) {
			return token; // Resolve the promise with the token
		} else {
			return false;
		}
	} catch (error) {
		console.error(error);
		return false;
	}
};

async function verifyRefreshToken(refreshToken, username, res) {
	const query = `SELECT * FROM users WHERE auth_refresh_token = ? and username = ?`;

	Mysql.pool.query(query, [refreshToken, username], (err, result) => {
		if (err || !result) {
			return res.send({
				status: "FAILURE",
				message: "Token not found, login in again",
			});
		} else {
			jwt.verify(refreshToken, REFRESH_SECRET, (err, decoded) => {
				if (err) {
					return res.status(404).send({ auth: false, message: err.message });
				}
				if (decoded.exp < Date.now() / 1000) {
					return res.status(401).send("Refresh token has expired");
				}
				// If the JWT is valid, save the decoded user information in the request object
				// so that it is available for the next middleware function
				if (decoded.username != username) {
					return res
						.status(404)
						.send({ auth: false, message: "Token mismatch" }); // Token is not this users, but another users
				}

				return res.send({
					status: true,
					jwt: generateJwtToken(username, decoded.role_id, "normal"),
				});
			});
		}
	});
}

function verifyJWT(req, res, next) {
	// Get the user's username from the decoded token
	const username = req.body["username"];
	const token = req.body["jwt_key"];

	if (!token || !username) {
		return res
			.status(401)
			.send({ status: false, message: "Missing auth fields !" });
	}
	// Verify the JWT and check that it is valid
	jwt.verify(token, JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(401).send({ status: false, message: err.message });
		}
		if (decoded.exp < Date.now() / 1000) {
			return res
				.status(401)
				.send({ status: false, message: "JWT has expired" });
		}
		// If the JWT is valid, save the decoded user information in the request object
		// so that it is available for the next middleware function
		if (decoded.username != username) {
			return res.status(401).send({ status: false, message: "Token mismatch" }); // Token is not this users, but another users
		}

		req.decoded = decoded;
		next();
	});
}

function confirmJWT(req, res) {
	// Get the user's username from the decoded token
	const username = req.body["username"];
	const token = req.body["jwt_key"];

	if (!token) {
		return res.status(401).send({ auth: false, message: "No token provided." });
	}
	// Verify the JWT and check that it is valid
	jwt.verify(token, JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(404).send({ auth: false, message: err.message });
		}
		if (decoded.exp < Date.now() / 1000) {
			return res.status(401).send({ auth: false, message: "JWT has expired" });
		}
		// If the JWT is valid, save the decoded user information in the request object
		// so that it is available for the next middleware function
		if (decoded.username != username) {
			return res.status(404).send({ auth: false, message: "Token mismatch" }); // Token is not this users, but another users
		}

		return res.send({ auth: true, message: "jwt valid and working" });
	});
}

module.exports = {
	generateJwtToken,
	generateRefreshToken,
	verifyJWT,
	verifyRefreshToken,
	confirmJWT,
};
