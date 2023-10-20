// const orgCollection = client.db('experiment-labs').collection('organizations');
        // const userCollection = client.db('experiment-labs').collection('users');
        // const userdetailsCollection = client.db('experiment-labs').collection('userdetails');
        // const redeem_categoriesCollection = client.db('experiment-labs').collection('redeem_categories');
        // const gamification_SettingsCollection = client.db('experiment-labs').collection('gamification_Settings');
        // const earnings_logicCollection = client.db('experiment-labs').collection('earnings_logic');
        // const item_earning_parameterCollection = client.db('experiment-labs').collection('item_earning_parameter');
        // const item_redemption_parameter_internalCollection = client.db('experiment-labs').collection('item_redemption_parameter_internal');

        const courseCollection = client.db('experiment-labs').collection('courses');

        const chapterCollection = client.db('experiment-labs').collection('chapters');

        const weekCollection = client.db('experiment-labs').collection('weeks');

        // const testCollection = client.db('experiment-labs').collection('test');

        const assignmentCollection = client.db('experiment-labs').collection('assignments');
        const classCollection = client.db('experiment-labs').collection('classes');
        const readingCollection = client.db('experiment-labs').collection('readings');
        const quizCollection = client.db('experiment-labs').collection('quizes');
        const liveTestCollection = client.db('experiment-labs').collection('liveTests');
        const videoCollection = client.db('experiment-labs').collection('videos');
        const audioCollection = client.db('experiment-labs').collection('audios');
        const fileCollection = client.db('experiment-labs').collection('files');

        const skillCategoryCollection = client.db('experiment-labs').collection('skillCategories');

        const earningCategoryCollection = client.db('experiment-labs').collection('earningCategories');


        const assignmentSubmitCollection = client.db('experiment-labs').collection('assignments-submit');


        const eventCollection = client.db('experiment-labs').collection('events');
        const redemptionCategoryCollection = client.db('experiment-labs').collection('redemptionCategories');
        const redemptionAccessCollection = client.db('experiment-labs').collection('redemptionAccess');



        const batchCollection = client.db('experiment-labs').collection('batches');
        const feedbackCategoryCollection = client.db('experiment-labs').collection('feedbackCategories');
        const givenFeedbackCollection = client.db('experiment-labs').collection('givenFeedbacks');