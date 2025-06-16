const pool = require("../database/");

// Add new feedback
const addFeedback = async (account_id, feedback_text) => {
  const sql = `
    INSERT INTO feedback (account_id, feedback_text, status)
    VALUES ($1, $2, 'Pending')
    RETURNING *;
  `;
  const result = await pool.query(sql, [account_id, feedback_text]);
  return result.rows[0];
};

// Get all feedback
// feedbackModel.js
const getAllFeedback = async () => {
  try {
    const sql = `
      SELECT f.feedback_id, f.feedback_text, f.feedback_date, 
             f.status, f.admin_response, f.response_date,
             a.account_firstname, a.account_lastname
      FROM feedback f
      LEFT JOIN account a ON f.account_id = a.account_id
      ORDER BY feedback_date DESC;
    `;
    const result = await pool.query(sql);
    console.log("Fetched Feedback Rows:", result.rows); // ✅ Still useful for debugging
    return result.rows;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    throw new Error("Database error");
  }
};


// const respondToFeedback = async (feedback_id, admin_response) => {
//   const sql = `
//     UPDATE feedback
//     SET admin_response = $1,
//         response_date = CURRENT_TIMESTAMP,
//         status = 'Responded'
//     WHERE feedback_id = $2
//     RETURNING *;
//   `;
//   const result = await pool.query(sql, [admin_response, feedback_id]);
//   return result.rows[0];
// };
const respondToFeedback = async (feedback_id, response_text) => {
  const sql = `
    UPDATE feedback
    SET admin_response = $1,
        response_date = CURRENT_TIMESTAMP,
        status = 'Replied'
    WHERE feedback_id = $2
    RETURNING *;
  `;
  const result = await pool.query(sql, [response_text, feedback_id]);
  return result.rows[0];
};

const getFeedbackById = async (id) => {
  const result = await pool.query("SELECT * FROM feedback WHERE feedback_id = $1", [id]);
  return result.rows[0];
};

const deleteResponse = async (id) => {
  const sql = `
    UPDATE feedback
    SET admin_response = NULL, response_date = NULL, status = 'Pending'
    WHERE feedback_id = $1;
  `;
  return pool.query(sql, [id]);
};




module.exports = {
  addFeedback,
  getAllFeedback,
  respondToFeedback,
  getFeedbackById,
  deleteResponse,
};
