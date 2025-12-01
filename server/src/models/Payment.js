const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  amount: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return v > 0;
      },
      message: (props) => `Amount must be greater than zero. Received: ${props.value}`,
    },
  },
  checkoutId: {
    type: String,
    unique: true,
    sparse: true,
  },
  mpesaCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  transactionDate: {
    type: String,
  },
  message: {
    type: String,
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^254\d{9}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },
}, {
  timestamps: true,
});

// indexes
PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ checkoutId: 1 });
PaymentSchema.index({ mpesaCode: 1 });

PaymentSchema.pre("save", function (next) {
  console.log(`Payment saving: ${this}`);
  next();
});

PaymentSchema.pre("findOneAndUpdate", function (next) {
  console.log(`Payment updating: ${JSON.stringify(this.getUpdate())}`);
  next();
});

module.exports = mongoose.model("Payment", PaymentSchema);