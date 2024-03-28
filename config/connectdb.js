import mongoose from 'mongoose';

// Function to connect to the MongoDB database
const connectDB = async (DATABASE_URL) => {
  try {
    // Database connection options
    // const DB_OPTIONS = {
    //   dbName: "login test" // Specify the name of the database to connect to
    // };

    // Attempt to connect to the MongoDB database using the provided URL and options
    await mongoose.connect(DATABASE_URL);

    // Log a success message if the connection is successful
    console.log('Connected Successfully...');
  } catch (error) {
    // If an error occurs during the connection process, log the error
    console.log(error);
  }
};

// Export the connectDB function to be used in other parts of the application
export default connectDB;
