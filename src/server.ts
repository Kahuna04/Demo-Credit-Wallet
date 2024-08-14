import express from "express";
import userRoutes from "./routes/userRoute";
import transactionRoutes from "./routes/transactionRoute";
import cookieParser from "cookie-parser";
import swaggerUi from 'swagger-ui-express';
import specs from "../swaggerConfig";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api', userRoutes, transactionRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
