const nodeCron = require('node-cron');
const client = require("../utils/dbConnect");
const classCollection = client.db('experiment-labs').collection('classes');
const userCollection = client.db('experiment-labs').collection('users');


const addAttendance = async () => {
    const currentDate = new Date();

    const formattedCurrentDate = currentDate.toISOString().slice(0, 10);

    const classes = await classCollection.find({
        courseStartingDateTime: { $regex: `^${formattedCurrentDate}` }, // Use regex to match the formatted date
        duration: { $gt: 0 }
    }).toArray();


    const filteredClasses = classes.filter(classData => !classData.marked && classData.participants && classData.participants.length > 0);

    for (const classData of filteredClasses) {
        const courseStartingDateTime = new Date(classData.courseStartingDateTime);
        const courseEndTime = new Date(courseStartingDateTime.getTime() + classData.duration * 60000); // Convert duration to milliseconds

        // console.log(classData?.agenda,courseEndTime , currentDate);

        if (courseEndTime < currentDate) {
            // The class has not ended yet; you can perform your action here
            // For example, you can log or execute some code.

            // console.log("Time passed");

            for (const participantData of classData.participants) {
                const participantEmail = participantData.participant.email;

                const user = await userCollection.findOne({ "email": participantEmail });
                if (!user) {
                    // Handle the case where the user is not found
                    continue;
                }

                // console.log(user?.name);

                // Loop through categories, earning items, and values from the class
                classData.earningParameterData.forEach(category => {
                    const categoryName = category.categoryName;
                    // console.log(categoryName);
                    category.earningItems.forEach(item => {
                        const earningItemName = item.earningItemName;
                        const itemValue = parseFloat(item.itemValue); // Parse item value as a float
                        // console.log(earningItemName , itemValue);
                        // Process the category and earning item data
                        if (!user.earningData) {
                            user.earningData = [];
                        }

                        let categoryIndex = user.earningData.findIndex(category => category.categoryName === categoryName);

                        if (categoryIndex >= 0) {
                            let itemIndex = user.earningData[categoryIndex].earningItems.findIndex(item => item.earningItemName === earningItemName);
                            if (itemIndex >= 0) {
                                user.earningData[categoryIndex].earningItems[itemIndex].totalItemValue += itemValue;
                            } else {
                                user.earningData[categoryIndex].earningItems.push({
                                    "earningItemName": earningItemName,
                                    "totalItemValue": itemValue
                                });
                            }
                        } else {
                            user.earningData.push({
                                "categoryName": categoryName,
                                "earningItems": [
                                    {
                                        "earningItemName": earningItemName,
                                        "totalItemValue": itemValue
                                    }
                                ]
                            });
                        }

                        // console.log(user?.earningData);
                    });
                });

                await userCollection.updateOne({ "email": participantEmail }, { $set: { "earningData": user.earningData } });
            }

            // Mark the class as done
            await classCollection.updateOne({ "_id": classData._id }, { $set: { "marked": true } });
            console.log("Marked");
        }
    }
};


const startCronJob = () => {
    nodeCron.schedule('0 21 * * *', async () => {
        await addAttendance();
    });
};


module.exports = {
    startCronJob,
};