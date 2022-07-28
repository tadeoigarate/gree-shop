const jwt = require("jsonwebtoken"); //REQUIRE JSON WEB TOKEN PARA CREAR TOKEN DE AUTHORIZACION

//Verifica que el usuario tenga un token
const verifyToken = (req, res, next) => {
  const token = req.headers.token;
  if (token) {
    next();
  } else {
    res.status(400).json({ error: "You don't have permission" });
  }
};

//Verifica que el usuario tenga el rol admin
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.token;
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    if (decoded.role.includes("Admin")) {
      next();
    } else {
      return res.status(401).json({ error: "Invalid token" });
    }
  } else {
    return res.status(400).json({ error: "You did not provide a token!" });
  }
};

module.exports = {
  verifyToken,
  verifyAdminToken,
};
