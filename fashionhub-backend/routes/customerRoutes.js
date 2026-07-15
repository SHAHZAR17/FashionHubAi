// Member 2 — Customer routes
const express = require("express");
const router = express.Router();
const {
  createOrUpdateCustomer,
  getCustomers,
  getCustomerById,
} = require("../controllers/customerController");

router.post("/", createOrUpdateCustomer);
router.get("/", getCustomers);
router.get("/:id", getCustomerById);

module.exports = router;
