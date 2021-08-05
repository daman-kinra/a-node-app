const jwt = require("jsonwebtoken");

exports.requireLogin = (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const decode = jwt.verify(token, "secret");
      req.user = decode;
      req.error = false;
      next();
    } else {
      return res.status(400).json({ message: "unauthorized" });
    }
  } catch (error) {
    req.error = true;
    next();
  }
};
