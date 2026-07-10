const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // In Mongoose v6+, options like useNewUrlParser and useUnifiedTopology 
    // are no longer supported or necessary. Just pass the URI.
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure
    process.exit(1); 
  }
};

module.exports = connectDB;