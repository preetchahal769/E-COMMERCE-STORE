import Coupon from "../models/coupon.model.js";

export const getCoupons = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });
    res.json(coupon || null);
  } catch (error) {
    console.log(`error in getting coupons ${error}`);
    res.status(500).json({ msg: "server error", error: error.message });
  }
};

export const validateCoupons = async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({
      code: code,
      userId: req.user._id,
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ msg: "Coupon not found" });
    }

    if (coupon.expriationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(404).json({ msg: "Coupon expired" });
    }
    res.json({
      message: "Coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    console.log(`Error in validateCoupons ${error}`);
    res.status(500).json({ msg: "server error", error: error.message });
  }
};
