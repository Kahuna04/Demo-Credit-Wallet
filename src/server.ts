import express from "express";
import userRoutes from "./routes/userRoute";
import transactionRoutes from "./routes/transactionRoute";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use('/api', userRoutes, transactionRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
