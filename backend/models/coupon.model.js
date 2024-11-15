import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Code is required"],
      unique: true,
    },
    discountPercentage: {
      type: Number,
      required: [true, "Discount percentage is required"],
      min: 0,
      max: 100,
    },
    expriationDate: {
      type: Date,
      required: [true, "Expriation date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },
  },
  { timestamps: true }
);
const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
