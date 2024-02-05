const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const userCollection = client.db("experiment-labs").collection("users");
const assignmentSubmitCollection = client
  .db("experiment-labs")
  .collection("assignments-submit");
const eventCollection = client.db("experiment-labs").collection("events");

/*   module.exports.getUsersByOrganizationId = async (req, res) => {
    try {
      const organizationId = req.params.organizationId;
      console.log(organizationId);
  
      // Updated query to filter by organizationId and role: "user"
      const query = { organizationId: organizationId, role: "user" };
  
      const users = await userCollection.find(query).toArray();
      res.send(users);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }; */

module.exports.getUsersByOrganizationId = async (req, res, next) => {
  try {
    const organizationId = req.params.organizationId;

    // Query for users with the role "user"
    const userQuery = { organizationId: organizationId, role: "user" };
    const totalStudent = await userCollection.countDocuments(userQuery);

    // Query for users with non-empty "courses" array
    const courseQuery = {
      organizationId: organizationId,
      role: "user",
      courses: { $exists: true, $ne: [] },
    };

    const enrollStudents = await userCollection.countDocuments(courseQuery);
    const enrollStudentsData = await userCollection.find(courseQuery).toArray();
    // console.log(enrollStudentsData);

    const totalPaidAmount = enrollStudentsData.reduce((total, student) => {
      if (student.courses && Array.isArray(student.courses)) {
        student.courses.forEach((course) => {
          if (course.paidAmount) {
            total += course.paidAmount;
          }
        });
      }
      return total;
    }, 0);

    // Query for students with unevaluated result array
    const resultQuery = {
      "submitter.organizationId": organizationId,
      "submitter.role": "user",
      "submitter.result": { $exists: false },
    };

    const unevaluatedStudents = await assignmentSubmitCollection.countDocuments(
      resultQuery
    );

    // Query for total meeting
    // Get the start of the current day
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toISOString().slice(0, 10);

    // Query for total meetings within today
    const meetingQuery = {
      "organization.organizationId": organizationId,

      start: { $regex: `^${formattedCurrentDate}` },
    };

    const totalMeeting = await eventCollection.countDocuments(meetingQuery);

    res.send({
      totalStudent,
      enrollStudents,
      unevaluatedStudents,
      totalMeeting,
      totalPaidAmount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
