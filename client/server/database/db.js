const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  try {
    // If the DNS servers list contains 127.0.0.1, c-ares will fail on SRV queries
    // We override them with public DNS servers (Google DNS) to ensure success.
    if (dns.getServers().includes("127.0.0.1")) {
      dns.setServers(["8.8.8.8", "8.8.4.4"]);
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;