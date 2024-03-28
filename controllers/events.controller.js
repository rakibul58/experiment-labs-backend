const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const eventCollection = client.db("experiment-labs").collection("events");
const eventRequestCollection = client.db("experiment-labs").collection("eventRequests");

module.exports.addAnEvent = async (req, res, next) => {
  const event = req.body;
  const result = await eventCollection.insertOne(event);
  res.send(result);
};

module.exports.getAllEvent = async (req, res, next) => {
  const result = await eventCollection.find({}).toArray();
  res.send(result);
};

module.exports.getAnEvent = async (req, res, next) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const result = await eventCollection.findOne(filter);
  res.send(result);
};

module.exports.getEventsByEmail = async (req, res, next) => {
  try {
    const email = req.params.email;
    const filter = { requester: email };
    const result = await eventCollection.find(filter).toArray();
    //   res.send(result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports.eventRequest = async (req, res, next) => {
  try {
    const data = req.body;
    const result = await eventRequestCollection.insertOne(data);
    res.send(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


module.exports.fetchEventRequest = async (req, res, next) => {
  try {
    const organizationId = req.params.organizationId;
    const result = await eventRequestCollection.find(organizationId).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}