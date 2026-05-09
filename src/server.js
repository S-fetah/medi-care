import fastify from "fastify";
import userRoutes from "./routes/user.routes.js";
import multipart from "@fastify/multipart";
import { config } from "dotenv";
import { seedPatient } from "./utils/seeder.js";
import cloudinary from "./config/cloudinary.js";

config();

const app = fastify({
  logger: true,
});

app.register(multipart);
app.register(userRoutes, { prefix: "/api" });

const startServer = async () => {
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    console.log("app listening on port 3000");
    // Automatically seed a patient on startup
    //await seedPatient();
  } catch (error) {
    console.log(error);
    return process.exit(1);
  }
};

startServer();

