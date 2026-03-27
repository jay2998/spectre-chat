import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.accessToken; // Matches authController
  
  if (!token) {
    console.log("No token provided in cookies");
    return res.status(401).json('Not authenticated.');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      console.log("JWT Verification Error:", err.message);
      return res.status(403).json('Token is not valid.');
    }
    
    req.userId = payload.id;
    req.username = payload.username; // Now available from fixed login/register
    next();
  });
};