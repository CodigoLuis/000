const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
	/*Leer el token del header*/
	const token = req.header('uptos-auth-token');

	/*Revisar si no hay token*/
	if (!token) {
		return res.status(401).json({"message": "Usuario no autenticado", msg: 'No hay token, permiso no valido'});
	}

	/*validar el token*/
	try {
		const cifrado = jwt.verify(token, "Lu4nferg0V1rafpUptos");
		req.user = cifrado.user;
		next();

	} catch (error) {
		res.status(401).json({msg: 'token no válido'});
	}

}