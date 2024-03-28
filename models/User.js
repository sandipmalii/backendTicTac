import mongoose from "mongoose";

// Define the user schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  tc: { type: Boolean, required: true }
});
 
// Create the UserModel
const UserModel = mongoose.model("User", userSchema);

// Export the UserModel as a named export
export default UserModel
