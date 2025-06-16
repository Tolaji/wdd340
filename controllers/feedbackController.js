// feedbackController.js
const feedbackModel = require("../models/feedbackModel");
const utilities = require("../utilities/index");

// Render the feedback form
const showFeedbackForm = async (req, res) => {
  try {
    const nav = await utilities.getNav();
    res.render("feedback/feedback-form", {
      title: "Leave Feedback",
      nav,
      errors: [],
      notice: req.flash("info"),
    });
  } catch (error) {
    console.error("Error rendering feedback form:", error);
    res.status(500).render("500", {
      title: "Internal Server Error",
    });
  }
};


// Process feedback form submission
const processFeedbackForm = async (req, res) => {
  const { feedback_text } = req.body;
  const account_id = req.session.accountData?.account_id;
  const nav = await utilities.getNav();

  if (!feedback_text || feedback_text.trim().length < 5) {
    return res.render("feedback/feedback-form", {
      title: "Leave Feedback",
      nav,
      errors: ["Feedback must be at least 5 characters long."],
      notice: req.flash("info"),
    });
  }

  try {
    await feedbackModel.addFeedback(account_id, feedback_text.trim());
    req.flash("info", "Feedback has been received! Thank you for being a loyal customer.");
    res.redirect("/feedback");
  } catch (error) {
    console.error("Error processing feedback:", error);
    res.render("feedback/feedback-form", {
      title: "Leave Feedback",
      nav,
      errors: ["An error occurred. Please try again later."],
      notice: req.flash("info"),
    });
  }
};

// Display all feedback for admin view
const displayAllFeedback = async (req, res) => {
  try {
    const nav = await utilities.getNav();
    const feedbackList = await feedbackModel.getAllFeedback();

    res.render("feedback/feedback-list", {
      title: "User Feedback",
      nav,
      feedbackList,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).render("500", { title: "Internal Server Error" });
  }
};

const showReplyForm = async (req, res) => {
  const nav = await utilities.getNav();
  const feedbackId = req.params.id;
  const feedbackList = await feedbackModel.getAllFeedback(); // You can also make a getSingleFeedback(id)
  const feedback = feedbackList.find(f => f.feedback_id == feedbackId);

  if (!feedback) {
    req.flash("info", "Feedback not found.");
    return res.redirect("/feedback/all");
  }

  res.render("feedback/reply-form", {
    title: "Reply to Feedback",
    nav,
    feedback,
    errors: [],
    notice: req.flash("info")
  });
};

const processReply = async (req, res) => {
  const { feedback_id } = req.params;
  const { admin_response } = req.body;

  if (!admin_response || admin_response.trim().length < 5) {
    req.flash("info", "Response must be at least 5 characters.");
    return res.redirect(`/feedback/reply/${feedback_id}`);
  }

  try {
    await feedbackModel.respondToFeedback(feedback_id, admin_response.trim());
    req.flash("info", "Response submitted successfully.");
    res.redirect("/feedback/all");
  } catch (err) {
    console.error("Error submitting response:", err);
    req.flash("info", "An error occurred while responding.");
    res.redirect(`/feedback/reply/${feedback_id}`);
  }
};

/* ---------------------------
 * POST /feedback/respond/:id
 * Admin submits response
 * -------------------------- */
const respondToFeedback = async (req, res) => {
  try {
    const feedback_id = req.params.id;
    const { response_text } = req.body;

    if (!response_text || response_text.trim().length === 0) {
      req.flash("info", "Response text cannot be empty.");
      return res.redirect("/feedback/all");
    }

    await feedbackModel.respondToFeedback(feedback_id, response_text.trim());

    req.flash("info", "Admin response submitted successfully.");
    res.redirect("/feedback/all");
  } catch (error) {
    console.error("Error submitting admin response:", error);
    res.status(500).render("500", { title: "Internal Server Error" });
  }
};


const editResponseForm = async (req, res) => {
  const feedback = await feedbackModel.getFeedbackById(req.params.id);
  res.render("feedback/edit-response", { title: "Edit Response", feedback });
};

const updateResponse = async (req, res) => {
  await feedbackModel.respondToFeedback(req.params.id, req.body.response_text);
  res.redirect("/feedback/all");
};

const deleteResponse = async (req, res) => {
  await feedbackModel.deleteResponse(req.params.id);
  res.redirect("/feedback/all");
};

module.exports = {
  showFeedbackForm,
  processFeedbackForm,
  displayAllFeedback,
  showReplyForm,
  processReply,
  respondToFeedback,
  editResponseForm,
  updateResponse,
  deleteResponse,
 };
