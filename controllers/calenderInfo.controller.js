const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");

const calenderInfoCollection = client.db("experiment-labs").collection("calenderInfo");


module.exports.updateOrInsertCalendarInfo = async (req, res) => {
    try {
        const email = req.params.email;
        const newData = req.body;

        // Check if the email already exists
        const existingData = await calenderInfoCollection.findOne({ email });

        if (existingData) {
            // Update the existing document
            await calenderInfoCollection.updateOne({ email }, { $set: newData });
          //  console.log("Data updated successfully for email:", email);
            return res.status(200).json({ message: "Data updated successfully" });
        } else {
            // Insert a new document
            await calenderInfoCollection.insertOne({ email, ...newData });
           // console.log("New data inserted for email:", email);
            return res.status(200).json({ message: "New data inserted successfully" });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports.getCalendarInfoByEmail = async (req, res) => {
    try {
        const email = req.params.email;

        // Check if the email is provided
        if (!email) {
            return res.status(400).json({ error: "Email parameter is missing" });
        }

        // Retrieve data based on email
        const calendarInfo = await calenderInfoCollection.findOne({ email });

        // Check if data is found
        if (!calendarInfo) {
            return res.status(404).json({ error: "Calendar info not found for the provided email" });
        }

        // Return the retrieved data
        return res.status(200).json(calendarInfo);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


