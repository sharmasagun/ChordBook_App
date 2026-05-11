const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate requests using JSON Web Tokens.
 * Expects the token in the Authorization header: "Bearer <token>"
 */
const auth = (req, res, next) => {
  // Extract token from header
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    // Verify token validity using the environment secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the decoded payload (containing userId) to the request object
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = auth;