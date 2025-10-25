const express = require("express");
const path = require('path');
require('dotenv').config();
const { connectDB } = require('./config/db');

const app = express();


// Basic middleware
app.use(express.json());

// Routes
app.use('/api/auth', require('./Routes/auth'));
app.use('/api/friends', require('./Routes/friends'));
app.use('/api/posts', require('./Routes/posts'));
app.use('/api/user', require('./Routes/user'));
app.use('/api/groups', require('./Routes/groups'));

// Static files for uploaded media
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
	res.send("Campus Connect API is running");
});

// Start server after DB connects (non-blocking fire-and-forget with top-level await simulation)
(async () => {
	try {
		await connectDB(process.env.MONGODB_URI);
		app.listen(PORT, () => {
			console.log(`Server listening on http://localhost:${PORT}`);
		});
	} catch (err) {
		console.error('Failed to start server due to DB error:', err);
		process.exit(1);
	}
})();

module.exports = app;


