import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    });


// Schema + model for user enquiries
const enquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String }, // optional
    service: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Enquiry = mongoose.model("Enquiry", enquirySchema);

// POST route to receive enquiries
app.post("/api/enquiries", async(req, res) => {
    try {
        const { name, email, company, service, message } = req.body;

        if (!name || !email || !service || !message) {
            return res
                .status(400)
                .json({ error: "Name, email, service, and message are required" });
        }

        const doc = new Enquiry({ name, email, company, service, message });
        await doc.save();

        res.status(201).json({ message: "✅ Enquiry saved successfully" });
    } catch (err) {
        console.error("Error saving enquiry:", err);
        res.status(500).json({ error: "Server error while saving enquiry" });
    }
});

// (Optional) GET route to check all enquiries (for admin/debug)
app.get("/api/enquiries", async(req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        res.json(enquiries);
    } catch (err) {
        res.status(500).json({ error: "Error fetching enquiries" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));