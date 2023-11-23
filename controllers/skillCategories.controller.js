const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const skillCategoryCollection = client
  .db("experiment-labs")
  .collection("skillCategories");

module.exports.addASkillCategory = async (req, res, next) => {
  const { organizationId, categoryName, courseId } = req.body;
  const existingData = await skillCategoryCollection.findOne({
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
        const result1 = await skillCategoryCollection.updateOne(
          {
            organizationId,
            "courses.courseId": courseId,
          },
          {
            $push: {
              "courses.$.categories": {
                categoryName,
              },
            },
          }
        );

        res.send(result1);
      }
    } else {
      // If the courseId doesn't exist, create a new course object and add it to the courses array
      const result2 = await skillCategoryCollection.updateOne(
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
    const result3 = await skillCategoryCollection.insertOne({
      organizationId,
      courses: [
        {
          courseId,
          categories: [
            {
              categoryName,
            },
          ],
        },
      ],
    });

    res.send(result3);
  }
};

module.exports.getAllSkillCategory = async (req, res, next) => {
  const result = await skillCategoryCollection.find({}).toArray();
  res.send(result);
};

module.exports.getASkillCategoryByOrganizationId = async (req, res, next) => {
  const organizationId = req.params.organizationId;
  const filter = { organizationId: organizationId };
  const result = await skillCategoryCollection.findOne(filter);
  res.send(result);
};

module.exports.deleteASkillCategory = async (req, res, next) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const result = await skillCategoryCollection.deleteOne(filter);
  res.send(result);
};

module.exports.addASkill = async (req, res, next) => {
  const { organizationId, categoryName, courseId } = req.body;
  const skillData = req.body.skill;

  // Find the organization
  const organization = await skillCategoryCollection.findOne({
    organizationId,
  });
  if (!organization) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }

  // Find the course and category
  const course = organization.courses.find((c) => c.courseId === courseId);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const category = course.categories.find(
    (cat) => cat.categoryName.toLowerCase() === categoryName.toLowerCase()
  );

  if (category) {
    if (!category.skills) {
      // If skills array doesn't exist, create it
      category.skills = [];
    }

    // Find the skill if it exists
    const existingSkillIndex = category.skills.findIndex(
      (skill) => skill.skillName === skillData.skillName
    );

    if (existingSkillIndex !== -1) {
      // If skill exists, update parameters
      const existingSkill = category.skills[existingSkillIndex];

      skillData.parameters.forEach((param) => {
        if (!existingSkill.parameters.includes(param)) {
          existingSkill.parameters.push(param);
        }
      });
    } else {
      // If skill doesn't exist, create it with parameters
      category.skills.push({
        skillName: skillData.skillName,
        parameters: skillData.parameters,
      });
    }
  } else {
    // If category doesn't exist, create it with skill
    course.categories.push({
      categoryName,
      skills: [
        {
          skillName: skillData.skillName,
          parameters: skillData.parameters,
        },
      ],
    });
  }

  // Update the organization in the database
  const result = await skillCategoryCollection.updateOne(
    { organizationId },
    { $set: { courses: organization.courses } }
  );

  res.send(result);
};

module.exports.updateACategoryName = async (req, res, next) => {
  const { organizationId, courseId, oldCategoryName, newCategoryName } =
    req.body;

  // Find the organization
  const organization = await skillCategoryCollection.findOne({
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
    (cat) => cat.categoryName.toLowerCase() === newCategoryName.toLowerCase()
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

  // Update the organization in the database
  await skillCategoryCollection.updateOne(
    { organizationId },
    { $set: { courses: organization.courses } }
  );

  res.status(200).json({ message: "Category name updated successfully!" });
};

module.exports.removeACategory = async (req, res, next) => {
  const { organizationId, courseId, categoryName } = req.body;

  const organization = await skillCategoryCollection.findOne({
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
  const result = await skillCategoryCollection.updateOne(
    { organizationId },
    { $set: { courses: organization.courses } }
  );

  res.send(result);
};

module.exports.getCategoriesByOrganizationIdAndCourseId = async (
  req,
  res,
  next
) => {
  const courseId = req.params.courseId;
  const organizationId = req.params.organizationId;
  const filter = {
    organizationId: organizationId,
    "courses.courseId": courseId,
  };

  const document = await skillCategoryCollection.findOne(filter);

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

module.exports.deleteASkill = async (req, res, next) => {
  const { organizationId, courseId, categoryName, skillName } = req.body;

  // Find the document to update
  const document = await skillCategoryCollection.findOne({
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
        category.skills = category.skills.filter(
          (skill) => skill.skillName !== skillName
        );
      }
    });
  });

  // Save the updated document back to the collection
  const result = await skillCategoryCollection.replaceOne(
    { organizationId },
    document
  );

  res.send(result);
};

module.exports.updateASkill = async (req, res, next) => {
  const { organizationId, courseId, categoryName, oldSkillName, skill } =
    req.body;

  // Find the document to update
  const document = await skillCategoryCollection.findOne({
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
        category.skills = category.skills.map((existingSkill) => {
          if (existingSkill.skillName === oldSkillName) {
            return {
              skillName: skill.skillName,
              parameters: skill.parameters,
              description: skill.description,
            };
          }
          return existingSkill;
        });
      }
    });
  });

  // Save the updated document back to the collection
  const result = await skillCategoryCollection.replaceOne(
    { organizationId },
    document
  );

  res.send(result);
};
