const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const feedbackCategoryCollection = client.db('experiment-labs').collection('feedbackCategories');


module.exports.addAFeedbackCategory = async (req, res, next) => {
    // Check if the organizationId exists in the database
    const { organizationId, categoryName, courseId, rating } = req.body;
    const existingData = await feedbackCategoryCollection.findOne({ organizationId });

    if (existingData) {
        // If the organizationId exists, find the corresponding course
        const existingCourse = existingData.courses.find(
            (course) => course.courseId === courseId
        );

        if (existingCourse) {
            // If the courseId exists, check if the categoryName exists in categories
            const existingCategory = existingCourse.categories.find(
                (category) => category.categoryName.toLowerCase() === categoryName.toLowerCase()
            );

            if (!existingCategory) {
                // If the categoryName doesn't exist, add it to the categories array
                const result1 = await feedbackCategoryCollection.updateOne(
                    {
                        organizationId,
                        "courses.courseId": courseId,
                    },
                    {
                        $push: {
                            "courses.$.categories": {
                                categoryName,
                                rating,
                            },
                        },
                    }
                );

                res.send(result1);
            }
        }
        else {
            // If the courseId doesn't exist, create a new course object and add it to the courses array
            const result2 = await feedbackCategoryCollection.updateOne(
                {
                    organizationId,
                },
                {
                    $push: {
                        courses: {
                            courseId,
                            categories: [
                                {
                                    categoryName,
                                    rating,
                                },
                            ],
                        },
                    },
                }
            );

            res.send(result2)
        }
    } else {
        // If the organizationId doesn't exist, create a new document
        const result3 = await feedbackCategoryCollection.insertOne({
            organizationId,
            courses: [
                {
                    courseId,
                    categories: [
                        {
                            categoryName,
                            rating,
                        },
                    ],
                },
            ],
        });

        res.send(result3)
    }
};


module.exports.updateACategoryNameAndRating = async (req, res, next) => {
    const { organizationId, courseId, oldCategoryName, newCategoryName, oldRating, newRating } = req.body;

    // Find the organization
    const organization = await feedbackCategoryCollection.findOne({ organizationId });
    if (!organization) {
        res.status(404).json({ error: "Organization not found" });
        return;
    }

    // Find the course
    const course = organization.courses.find((c) => c.courseId === courseId);
    if (!course) {
        res.status(404).json({ error: "Course not found" });
        return;
    }

    const categoryExists = course.categories.some(
        (cat) => cat.categoryName.toLowerCase() === newCategoryName.toLowerCase()
    );

    if (categoryExists) {
        res.status(400).json({ error: "Category already exists. Please choose another name." });
        return;
    }

    // Find the category
    const category = course.categories.find(
        (cat) => cat.categoryName.toLowerCase() === oldCategoryName.toLowerCase()
    );

    if (!category) {
        res.status(404).json({ error: "Category not found" });
        return;
    }

    // Update the category name
    category.categoryName = newCategoryName;
    category.rating = newRating;

    // Update the organization in the database
    const result = await feedbackCategoryCollection.updateOne(
        { organizationId },
        { $set: { courses: organization.courses } }
    );



    res.send(result);
};


module.exports.removeACategory = async (req, res, next) => {
    const { organizationId, courseId, categoryName } = req.body;

    const organization = await feedbackCategoryCollection.findOne({ organizationId });
    if (!organization) {
        res.status(404).json({ error: "Organization not found" });
        return;
    }

    // Find the course
    const course = organization.courses.find((c) => c.courseId === courseId);
    if (!course) {
        res.status(404).json({ error: "Course not found" });
        return;
    }

    // Find the category index
    const categoryIndex = course.categories.findIndex(
        (cat) => cat.categoryName.toLowerCase() === categoryName.toLowerCase()
    );

    console.log(categoryIndex);

    if (categoryIndex === -1) {
        res.status(404).json({ error: "Category not found" });
        return;
    }


    // Remove the category
    course.categories.splice(categoryIndex, 1);


    // Update the organization in the database
    const result = await feedbackCategoryCollection.updateOne(
        { organizationId },
        { $set: { courses: organization.courses } }
    );

    res.send(result);
};


module.exports.getAFeedbackCategoryByOrganizationId = async (req, res, next) => {
    const id = req.params.organizationId;
    const filter = { organizationId: id };
    const result = await feedbackCategoryCollection.findOne(filter);
    res.send(result);
};


module.exports.addAFeedbackItem = async (req, res, next) => {
    const { organizationId, courseId, categoryName, rating, feedbackItem } = req.body;

    const document = await feedbackCategoryCollection.findOne({
        organizationId,
        "courses.courseId": courseId,
        "courses.categories.categoryName": categoryName,
        "courses.categories.rating": rating,
    });

    if (!document) {
        res.status(404).json({ error: "Document not found" });
        return;
    }

    console.log(document);

    const matchingCourse = document.courses.find(
        (course) => course.courseId === courseId
    );

    // Find the category with matching categoryName
    const matchingCategory = matchingCourse.categories.find(
        (category) => category.categoryName === categoryName
    );

    if (!matchingCategory) {
        res.status(404).json({ error: "Category not found" });
        return;
    }

    // Initialize the feedbackItems array if it doesn't exist
    if (!matchingCategory.feedbackItems) {
        matchingCategory.feedbackItems = [];
    }

    // Check if the redemption item name already exists
    const existingFeedbackItem = matchingCategory.feedbackItems.find(
        (item) => item.feedbackItemName === feedbackItem.feedbackItemName
    );

    if (existingFeedbackItem) {
        res.status(400).json({ error: "redemption item name already exists. Please provide another name." });
        return;
    }

    // Add the new earning item to the array
    matchingCategory.feedbackItems.push(feedbackItem);

    // Save the updated document back to the collection
    const result = await feedbackCategoryCollection.replaceOne(
        { organizationId },
        document
    );

    res.send(result);
};


module.exports.updateAFeedbackItem = async (req, res, next) => {
    const {
        organizationId,
        courseId,
        categoryName,
        oldItemName,
        feedbackItem,
    } = req.body;

    // Find the document to update
    const document = await feedbackCategoryCollection.findOne({
        organizationId,
        "courses.courseId": courseId,
        "courses.categories.categoryName": categoryName,
    });

    if (!document) {
        res.status(404).json({ error: "Document not found" });
        return;
    }

    // Update the skill details within the category
    document.courses.forEach((course) => {
        course.categories.forEach((category) => {
            if (category.categoryName === categoryName) {
                category.feedbackItems = category.feedbackItems?.map((existingItem) => {
                    if (existingItem.feedbackItemName === oldItemName) {
                        return {
                            feedbackItemName: feedbackItem.feedbackItemName,
                            itemRating: feedbackItem.itemRating,

                            giveAccess: feedbackItem.giveAccess,
                            selectedIcon: feedbackItem.selectedIcon,

                        };
                    }
                    return existingItem;
                });
            }
        });
    });

    // Save the updated document back to the collection
    const result = await feedbackCategoryCollection.replaceOne(
        { organizationId },
        document
    );

    res.send(result);
};


module.exports.deleteAFeedbackItem = async (req, res, next) => {
    const { organizationId, courseId, categoryName, feedbackItemName } = req.body;


    // Find the document to update
    const document = await feedbackCategoryCollection.findOne({
        organizationId,
        "courses.courseId": courseId,
        "courses.categories.categoryName": categoryName,
    });

    if (!document) {
        res.status(404).json({ error: "Document not found" });
        return;
    }

    // Update the document by removing the skill
    document.courses.forEach((course) => {
        course.categories.forEach((category) => {
            if (category.categoryName === categoryName) {
                category.feedbackItems = category.feedbackItems?.filter(
                    (item) => item.feedbackItemName !== feedbackItemName
                );
            }
        });
    });

    // Save the updated document back to the collection
    const result = await feedbackCategoryCollection.replaceOne(
        { organizationId },
        document
    );

    res.send(result);
};