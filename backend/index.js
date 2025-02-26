const express = require("express");
const cors = require("cors")
const app = express();

app.use(express.json());
app.use(cors({ origin: '*' })); 

const mainRouter = require('./routes/index');
app.use("/api/v1" , mainRouter);

// app.use("/api/v2" , mainRo   uter);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'backend ekdam changa hai ji' });
  });
  
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});