const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Use the Cloud URI if available, otherwise localhost
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kindleClone');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
module.exports = connectDB;