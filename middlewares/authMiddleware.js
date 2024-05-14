const secretKey = process.env.SECRET_KEY;
const jwt = require('jsonwebtoken');
const authenticateJWT = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (authHeader) {
		const token = authHeader.split(' ')[1];

		jwt.verify(token, secretKey, (err, user) => {
			if (err) {
				console.log('Token verification failed:', err);
				return res.sendStatus(403);
			}
			req.user = user;
			next();
		});
	} else {
		res.sendStatus(401);
	}
};

module.exports = authenticateJWT;
