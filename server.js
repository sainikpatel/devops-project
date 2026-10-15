const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(`
    <h1>DevOps CI/CD Project</h1>
    <p>Node.js application deployed using Jenkins!</p>
    <h1>Devops CI/CD </h1>
  `);
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    message: "Application is running"
  });
});

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`App running on port ${PORT}`);
  });
}

module.exports = app;