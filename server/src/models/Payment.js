const mongoose = require("mongoose");

const Payment = new mongoose.Schema(
  {
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
    amount: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          return v > 0;
        },
        message: (props) =>
          `Amount must be greater than zero. Received: ${props.value}`,
      },
    },
    checkoutId: {
      type: String,
      unique: true,
    },
    mpesaCode: {
      type: String,
      unique: true,
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
  },
  {
    timestamps: true,
  }
);

// Virtual field for a string representation of the transaction
Payment.virtual("description").get(function () {
  return `${this.mpesaCode} - ${(this.amount / 100).toFixed(2)} KES`;
});

Payment.index({ mpesaCode: 1, checkoutId: 1, phoneNumber: 1 });

Payment.pre("save", function (next) {
  console.log(`Transaction is being saved: ${this}`);
  next();
});

Payment.pre("findOneAndUpdate", function (next) {
  console.log(`Transaction is being updated: ${this.getUpdate()}`);
  next();
});

module.exports = mongoose.model("Payment", Payment);