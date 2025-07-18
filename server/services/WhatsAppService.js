const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const schedule = require('node-schedule');

class WhatsAppService {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: { headless: true }
    });

    this.initialize();
  }

  initialize() {
    this.client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client is ready!');
    });

    this.client.on('authenticated', () => {
      console.log('Authenticated');
    });

    this.client.initialize();
  }

  async sendBirthdayMessage(contactNumber, message) {
    try {
      // Format number with country code (remove '+' if present)
      const formattedNumber = contactNumber.replace(/^\+/, '') + '@c.us';
      await this.client.sendMessage(formattedNumber, message);
      console.log('Birthday message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  scheduleBirthdayMessage(contactNumber, message, date) {
    // Set time to 00:00 on the birthday date
    const scheduledTime = new Date(date);
    scheduledTime.setHours(0, 0, 0, 0);

    schedule.scheduleJob(scheduledTime, () => {
      this.sendBirthdayMessage(contactNumber, message);
    });

    console.log(`Message scheduled for ${scheduledTime}`);
  }
}

module.exports = WhatsAppService;