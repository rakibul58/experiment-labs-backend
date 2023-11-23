const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const earningCategoryCollection = client
  .db("experiment-labs")
  .collection("earningCategories");

module.exports.addAnEarningCategory = async (req, res, next) => {
  // Check if the organizationId exists in the database
  const { organizationId, categoryName, courseId, totalWeight, addedWeight } =
    req.body;
  const existingData = await earningCategoryCollection.findOne({
    organizationId,
  });

  if (existingData) {
    // If the organizationId exists, find the corresponding course
    const existingCourse = existingData.courses.find(
      (course) => course.courseId === courseId
    );

    if (existingCourse) {
      // If the courseId exists, check if the categoryName exists in categories
      const existingCategory = existingCourse.categories.find(
        (category) =>
          category.categoryName.toLowerCase() === categoryName.toLowerCase()
      );

      if (!existingCategory) {
        // If the categoryName doesn't exist, add it to the categories array
        const result1 = await earningCategoryCollection.updateOne(
          {
            organizationId,
            "courses.courseId": courseId,
          },
          {
            $push: {
              "courses.$.categories": {
                categoryName,
                totalWeight,
                addedWeight,
              },
            },
          }
        );

        res.send(result1);
      }
    } else {
      // If the courseId doesn't exist, create a new course object and add it to the courses array
      const result2 = await earningCategoryCollection.updateOne(
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
                  totalWeight,
                  addedWeight,
                },
              ],
            },
          },
        }
      );

      res.send(result2);
    }
  } else {
    // If the organizationId doesn't exist, create a new document
    const result3 = await earningCategoryCollection.insertOne({
      organizationId,
      courses: [
        {
          courseId,
          categories: [
            {
              categoryName,
              totalWeight,
              addedWeight,
            },
          ],
        },
      ],
    });

    res.send(result3);
  }
};

module.exports.getAllEarningCategory = async (req, res, next) => {
  const result = await earningCategoryCollection.find({}).toArray();
  res.send(result);
};

module.exports.getAnEarningCategoryByOrganizationId = async (
  req,
  res,
  next
) => {
  const organizationId = req.params.organizationId;
  const filter = { organizationId: organizationId };
  const result = await earningCategoryCollection.findOne(filter);
  res.send(result);
};

module.exports.addAnEarningItem = async (req, res, next) => {
  const { organizationId, courseId, categoryName, earningItem } = req.body;

  const document = await earningCategoryCollection.findOne({
    organizationId,
    "courses.courseId": courseId,
    "courses.categories.categoryName": categoryName,
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

  // Initialize the earningItems array if it doesn't exist
  if (!matchingCategory.earningItems) {
    matchingCategory.earningItems = [];
  }

  // Check if the earning item name already exists
  const existingEarningItem = matchingCategory.earningItems.find(
    (item) => item.earningItemName === earningItem.earningItemName
  );

  if (existingEarningItem) {
    res.status(400).json({
      error: "Earning item name already exists. Please provide another name.",
    });
    return;
  }

  // Add the new earning item to the array
  matchingCategory.earningItems.push(earningItem);

  // Save the updated document back to the collection
  const result = await earningCategoryCollection.replaceOne(
    { organizationId },
    document
  );

  res.send(result);
};

module.exports.updateACategoryName = async (req, res, next) => {
  const {
    organizationId,
    courseId,
    oldCategoryName,
    newCategoryName,
    totalWeight,
  } = req.body;

  // Find the organization
  const organization = await earningCategoryCollection.findOne({
    organizationId,
  });
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
    (cat) =>
      cat.categoryName.toLowerCase() === newCategoryName.toLowerCase() &&
      oldCategoryName.toLowerCase() !== newCategoryName.toLowerCase()
  );

  if (categoryExists) {
    res
      .status(400)
      .json({ error: "Category already exists. Please choose another name." });
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
  category.totalWeight = totalWeight;

  // Update the organization in the database
  const result = await earningCategoryCollection.updateOne(
    { organizationId },
    { $set: { courses: organization.courses } }
  );

  res.send(result);
};

module.exports.removeACategory = async (req, res, next) => {
  const { organizationId, courseId, categoryName } = req.body;

  // Find the organization
  const organization = await earningCategoryCollection.findOne({
    organizationId,
  });
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
  const result = await earningCategoryCollection.updateOne(
    { organizationId },
    { $set: { courses: organization.courses } }
  );

  res.send(result);
};

module.exports.deleteAnEarningItem = async (req, res, next) => {
  const { organizationId, courseId, categoryName, earningItemName } = req.body;

  // Find the document to update
  const document = await earningCategoryCollection.findOne({
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
        category.earningItems = category.earningItems.filter(
          (skill) => skill.earningItemName !== earningItemName
        );
      }
    });
  });

  // Save the updated document back to the collection
  const result = await earningCategoryCollection.replaceOne(
    { organizationId },
    document
  );

  res.send(result);
};

module.exports.updateAnEarningItem = async (req, res, next) => {
  const { organizationId, courseId, categoryName, oldItemName, item } =
    req.body;

  // Find the document to update
  const document = await earningCategoryCollection.findOne({
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
        category.earningItems = category.earningItems.map((existingItem) => {
          if (existingItem.earningItemName === oldItemName) {
            return {
              earningItemName: item.earningItemName,
              itemEarningValue: item.itemEarningValue,
              itemValues: item.itemValues,
            };
          }
          return existingItem;
        });
      }
    });
  });

  // Save the updated document back to the collection
  const result = await earningCategoryCollection.replaceOne(
    { organizationId },
    document
  );

  res.send(result);
};

module.exports.getAnEarningCategoryByOrganizationIdAndCourseId = async (
  req,
  res,
  next
) => {
  const organizationId = req.params.organizationId;
  const courseId = req.params.courseId;
  const filter = {
    organizationId: organizationId,
    "courses.courseId": courseId,
  };

  const document = await earningCategoryCollection.findOne(filter);

  console.log(filter);
  console.log(document);

  if (!document) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  // Extract and return the categories for the specified courseId
  const categories = document.courses.find(
    (course) => course.courseId === courseId
  ).categories;

  res.status(200).json(categories);
};
