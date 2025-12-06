const mongoose = require("mongoose");

// Sub-schema for order items (snapshot to avoid price changes)
const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product reference is required"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
    max: [50, "Quantity cannot exceed 50 per item"],
  },
  priceAtOrder: {
    type: Number,
    required: [true, "Price at time of order is required"],
    min: [0, "Price cannot be negative"],
  },
  productName: { type: String },
  productImage: { type: String },
}, { _id: false });

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    items: {
      type: [OrderItemSchema],
      required: [true, "At least one item is required"],
      validate: {
        validator: (v) => v.length > 0,
        message: "Order must have at least one item",
      },
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total cannot be negative"],
    },
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["Processing", "In-Transit", "Delivered", "Cancelled"],
        message: "Status must be valid (Processing, In-Transit, Delivered, Cancelled)",
      },
      default: "Processing",
    },
    address: {
      type: Object,
    },
    payment: {
      method: {
        type: String,
        required: [true, "Payment method is required"],
        enum: {
          values: ["M-Pesa", "Card", "Bank Transfer"],
          message: "Invalid payment method",
        },
      },
      paymentId: { type: String },
      paidAt: { type: Date },
      mpesaCode: { type: String}
    },
    trackingNumber: { type: String },
    estimatedDelivery: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance (queries on userId, status, date)
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ createdAt: -1 }); // Recent orders first
OrderSchema.index({ orderNumber: 1 }); // Unique lookups

// Virtual for total items count (computed, not stored)
OrderSchema.virtual('totalItems').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Pre-save middleware: Generate order number, snapshot product details, validate stock
OrderSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Generate unique order number (e.g., VIS-2025-001)
    const year = new Date().getFullYear();
    const count = await mongoose.model('Order').countDocuments({ orderNumber: { $regex: `VIS-${year}` } });
    this.orderNumber = `VIS-${year}-${String(count + 1).padStart(3, '0')}`;

    // Snapshot product details (prevent changes)
    for (let item of this.items) {
      const product = await mongoose.model('Product').findById(item.productId);
      if (!product) return next(new Error(`Product ${item.productId} not found`));
      item.productName = product.name;
      item.productImage = product.image;
      item.priceAtOrder = product.price; // Lock price at order time

      // Optional: Check stock
      if (product.stock < item.quantity) {
        return next(new Error(`Insufficient stock for ${product.name}`));
      }
    }
  }
  next();
});

// Post-save: Update product stock (if you add stock field)
OrderSchema.post('save', async function (doc) {
  for (let item of doc.items) {
    await mongoose.model('Product').findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }
});

// Query helpers (static methods)
OrderSchema.statics.findByUser = function (userId) {
  return this.find({ userId }).populate('items.product', 'name image price');
};

OrderSchema.statics.findRecent = function (userId, limit = 5) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('items.product', 'name image price');
};

module.exports = mongoose.model("Order", OrderSchema);