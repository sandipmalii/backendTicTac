import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/connectdb.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 3000; // Use a default port if PORT is not set

// CORS Policy
app.use(cors());

// JSON
app.use(express.json());

// Connect to the database
connectDB(process.env.DATABASE_URL)
  .then(() => {
    // Load Routes
    app.use("/api/user", userRoutes);

    // Start the server
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });
