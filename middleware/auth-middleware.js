import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';

const checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer')) {
    // If authorization header is missing or does not start with 'Bearer'
    return res.status(401).send({ "status": "failed", "message": "Unauthorized User, No Token" });
  }

  try {
    // Get Token from header
    token = authorization.split(' ')[1];

    // Verify Token
    const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Get User from Token
    req.user = await UserModel.findById(userID).select('-password');

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).send({ "status": "failed", "message": "Unauthorized User" });
  }
};

export default checkUserAuth;
