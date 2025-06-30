const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = (req, res, next) => {
	const token = req.header("Authorization")?.split(" ")[1]; // expects "Bearer <token>"

	if (!token) {
		return res
			.status(401)
			.json({ message: "Access Denied. No token provided." });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded; // { id: ..., role: ... } — whatever you put when creating the token
		next();
	} catch (err) {
		res.status(400).json({ message: "Invalid token." });
	}
};
