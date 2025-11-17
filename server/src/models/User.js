const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowecase: true },
    password: { type: String, required: true },
    phone: { type: String },
    profilePic: { type: String },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
    const user = this;
    if (!user.isModified("password")) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash(user.password, salt);

    user.password = passHash;
    next();
});

UserSchema.methods.comparePassword = async function(password) {
    const user = this;

    return await bcrypt.compare(password, user.password);
}

module.exports = mongoose.model("User", UserSchema);