import fastify from "fastify";
import userRoutes from "./routes/user.routes.js";
import multipart from "@fastify/multipart";
import cors from "@fastify/cors";
import { config } from "dotenv";
import { seedPatient } from "./utils/seeder.js";
import cloudinary from "./config/cloudinary.js";
import doctorRoutes from "./routes/doctors.routes.js";

config();

const app = fastify({
  logger: true,
});

app.register(multipart);
app.register(cors, { origin: "*" });
app.register(userRoutes, { prefix: "/api" });
app.register(doctorRoutes, { prefix: "/api" });

app.register(async(app)=>{
  app.get("/",(req,res)=>{
    res.send("ok");
  })
})

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

