import UserModel from '../models/User.js';  // Import the UserModel from the User.js file in the models directory
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for token generation
import  transporter  from '../config/emailConfig.js'; // Import transporter from emailConfig.js for sending emails


// Define the UserController class
class UserController {
  // Define a static method for user registration
  static userRegistration = async (req, res) => {
    // Destructure required fields from request body
    const { name, email, password, password_confirmation, tc } = req.body;
    // Check if a user with the given email already exists
    const user = await UserModel.findOne({ email: email });
    if (user) {
      // If user exists, send a message indicating the email is already in use
      res.send({ "status": "failed", "message": "Email already exists" });
    } else {
      // If user doesn't exist and all required fields are provided
      if (name && email && password && password_confirmation && tc) {
        // Check if password and password confirmation match
        if (password === password_confirmation) {
          try {
            // Generate salt and hash the password
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            // Create a new user document with hashed password
            const doc = new UserModel({
              name: name,
              email: email,
              password: hashPassword,
              tc: tc
            });
            // Save the new user document to the database
            await doc.save();
            // Retrieve the saved user
            const saved_user = await UserModel.findOne({ email: email });
            // Generate JWT Token
            const token = jwt.sign({ userID: saved_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });
            // Send response with success status, message, and token
            res.status(201).send({ "status": "success", "message": "Registration Success", "token": token });
          } catch (error) {
            // If an error occurs during registration, log the error and send a failure message
            console.log(error);
            res.send({ "status": "failed", "message": "Unable to Register" });
          }
        } else {
          // If password and password confirmation don't match, send a failure message
          res.send({ "status": "failed", "message": "Password and Confirm Password doesn't match" });
        }
      } else {
        // If any required field is missing, send a failure message
        res.send({ "status": "failed", "message": "All fields are required" });
      }
    }
  }

  // Define a static method for user login
  static userLogin = async (req, res) => {
    try {
      // Destructure email and password from request body
      const { email, password } = req.body;
      // If email and password are provided
      if (email && password) {
        // Find user by email
        const user = await UserModel.findOne({ email: email });
        // If user exists
        if (user != null) {
          // Compare provided password with hashed password in the database
          const isMatch = await bcrypt.compare(password, user.password);
          if ((user.email === email) && isMatch) {
            // Generate JWT Token
            const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });
            // Send response with success status, message, and token
            res.send({ "status": "success", "message": "Login Success", "token": token });
          } else {
            // If email or password is not valid, send a failure message
            res.send({ "status": "failed", "message": "Email or Password is not Valid" });
          }
        } else {
          // If user does not exist, send a failure message
          res.send({ "status": "failed", "message": "You are not a Registered User" });
        }
      } else {
        // If email or password is missing, send a failure message
        res.send({ "status": "failed", "message": "All Fields are Required" });
      }
    } catch (error) {
      // If an error occurs during login, log the error and send a failure message
      console.log(error);
      res.send({ "status": "failed", "message": "Unable to Login" });
    }
  }


  // Define a static method for changing user password
  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
        if (password !== password_confirmation) {
            // Sending a 400 status code for a bad request due to mismatched passwords
            res.status(400).send({ "status": "failed", "message": "New Password and Confirm New Password do not match" });
        } else {
            const salt = await bcrypt.genSalt(10);
            const newHashPassword = await bcrypt.hash(password, salt);
            try {
                await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } });
                res.send({ "status": "success", "message": "Password changed successfully" });
            } catch (error) {
                console.error(error);
                res.status(500).send({ "status": "failed", "message": "An error occurred while changing password" });
            }
        }
    } else {
        // Sending a 400 status code for a bad request due to missing fields
        res.status(400).send({ "status": "failed", "message": "Both Password and Confirm Password are required fields" });
    }
}


  ////// Define a static method for retrieving logged-in user information /////////
  static loggedUser = async (req, res) => {
    // Send response with logged-in user information
    res.send({ "user": req.user });
  }

  /////// Define a static method for sending password reset email to user ///////////
  static sendUserPasswordResetEmail = async (req, res) => {
    // Destructure email from request body
    const { email } = req.body;
    if (email) {
      // If email is provided
      const user = await UserModel.findOne({ email: email });
      if (user) {
        // If user exists
        const secret = user._id + process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' });
        const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
        // Send Email (commented out for demonstration)
        let info = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: "TicTacToe - Password Reset Link",
          html: `<a href=${link}>Click Here</a> to Reset Your Password`
        });
        res.send({ "status": "success", "message": "Password Reset Email Sent... Please Check Your Email" });
      } else {
        // If user does not exist, send a failure message
        res.send({ "status": "failed", "message": "Email doesn't exist" });
      }
    } else {
      // If email is missing, send a failure message
      res.send({ "status": "failed", "message": "Email Field is Required" });
    }
  }

  ////// Define a static method for resetting user password //////////////
  static userPasswordReset = async (req, res) => {
    // Destructure password, password confirmation, id, and token from request parameters
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;
    const user = await UserModel.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    try {
      // Verify the token
      jwt.verify(token, new_secret);
      if (password && password_confirmation) {
        // If both password and password confirmation are provided
        if (password !== password_confirmation) {
          // If password and password confirmation don't match, send a failure message
          res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" });
        } else {
          // If password and password confirmation match
          const salt = await bcrypt.genSalt(10);
          const newHashPassword = await bcrypt.hash(password, salt);
          // Update user's password in the database
          await UserModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } });
          // Send a success message
          res.send({ "status": "success", "message": "Password Reset Successfully" });
        }
      } else {
        // If either password or password confirmation is missing, send a failure message
        res.send({ "status": "failed", "message": "All Fields are Required" });
      }
    } catch (error) {
      // If an error occurs during password reset, log the error and send a failure message
      console.log(error);
      res.send({ "status": "failed", "message": "Invalid Token" });
    }
  }
}

// Export the UserController class
export default UserController;
