const Feedback = require("../models/Feedback");

module.exports = async function (req, res) {
  const { name, message, email } = req.body;

  try {
    const newFeedback = await Feedback.create({
      name,
      message,
      email,
    });

    res.json(newFeedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
