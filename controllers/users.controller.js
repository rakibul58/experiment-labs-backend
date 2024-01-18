const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const userCollection = client.db('experiment-labs').collection('users');
const Razorpay = require('razorpay');
const crypto = require("crypto");


module.exports.getAnUserByEmail = async (req, res, next) => {

    const email = req.query.email;
    const query = { email: email };
    const user = await userCollection.findOne(query);
    res.send(user);

};

module.exports.saveAUser = async (req, res, next) => {

    const user = req.body;

    const email = await userCollection.findOne({ email: user.email });

    if (email) {
        return res.status(400).json({ message: "sorry a user already exists" });
    }
    const result = await userCollection.insertOne(user);
    res.send(result);

};


module.exports.getAllMentors = async (req, res, next) => {

    const organizationId = req.params.organizationId;
    const rolesToMatch = ["execution mentor", "expert mentor"];
    const result = await userCollection.find({
        $and: [
            { "organizationId": organizationId },
            { "role": { $in: rolesToMatch } }
        ]
    }).toArray();

    res.send(result);

}


module.exports.checkoutPayment = async (req, res, next) => {
    const { price, paymentInstance } = req.body;
    const instance = new Razorpay(paymentInstance);
    const options = {
        amount: Number(price * 100),
        currency: "INR"
    };
    const order = await instance.orders.create(options);
    res.status(200).json({
        success: true,
        order,
    });
}


module.exports.verifyPayment = async (req, res, next) => {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto.createHmac('sha256', razorpay_key_secret)
        .update(body.toString())
        .digest('hex');


    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {

        res.redirect('http://localhost:3000/courseAccess')

    }
    else {
        res.status(400).json({
            success: false,
        });
    }
}