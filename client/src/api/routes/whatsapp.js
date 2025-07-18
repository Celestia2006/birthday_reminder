// server/api/routes/whatsapp.js
const express = require("express");
const WhatsAppService = require("../services/WhatsAppService");
const router = express.Router();

const whatsappService = new WhatsAppService();

router.post("/send", async (req, res) => {
  try {
    await whatsappService.sendMessage(req.body.phone, req.body.message);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
