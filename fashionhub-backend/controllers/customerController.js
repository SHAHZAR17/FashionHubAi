// Member 2 — Customer controller
const Customer = require("../models/Customer");

// POST /api/customers
// Called by Member 3's webhook the first time a customer messages in,
// and by the admin dashboard for manual entry.
exports.createOrUpdateCustomer = async (req, res) => {
  try {
    const { instagramId, whatsappId, name, phoneNumber, address } = req.body;

    if (!instagramId && !whatsappId) {
      return res.status(400).json({ error: "instagramId or whatsappId is required" });
    }

    const filter = instagramId ? { instagramId } : { whatsappId };
    const update = {
      ...(name && { name }),
      ...(phoneNumber && { phoneNumber }),
      ...(address && { address }),
      ...(instagramId && { instagramId }),
      ...(whatsappId && { whatsappId }),
    };

    const customer = await Customer.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    res.status(200).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/customers  (admin)
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json({ count: customers.length, customers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/customers/:id
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate("orderHistory");
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Internal helper — used by Member 3 to resolve/create a customer from a
// platform-specific ID before logging a conversation
exports.findOrCreateByPlatformId = async (platform, platformId) => {
  const filter = platform === "instagram" ? { instagramId: platformId } : { whatsappId: platformId };
  let customer = await Customer.findOne(filter);
  if (!customer) {
    customer = await Customer.create(filter);
  }
  return customer;
};
