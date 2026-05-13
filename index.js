require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const authRoutes = require("./routes/authRoutes");
const urlRoutes = require("./routes/urlRoutes");
const swaggerOptions = require("./swagger/options");

const app = express();

app.use(cors());
app.use(express.json());

// Swagger setup
const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/url", urlRoutes);


app.get("/", (req, res) => {
  res.send("API Running 🚀");
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT} 🚀`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});