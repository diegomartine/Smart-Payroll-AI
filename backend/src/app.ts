import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Smart Payroll AI API",
        version: "1.0.0",
        status: "running"
    });
});

export default app;