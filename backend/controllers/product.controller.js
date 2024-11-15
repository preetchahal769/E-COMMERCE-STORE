import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ products });
  } catch (error) {
    console.log(`error in getting products ${error}`);
    res.status(500).json({ msg: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await redis.get(`featured_products`);
    if (featuredProducts) {
      return res.json({ featuredProducts });
    }
    featuredProducts = await Product.find({ isFeatured: true }).lean();
    if (!featuredProducts) {
      return res.status(404).json({ msg: "No featured products found" });
    }
    await redis.set(`featured_products`, JSON.stringify(featuredProducts));
  } catch (error) {
    console.log(`error in getting featured products ${error}`);
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }
    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
    });
    res.status(201).json({ product });
  } catch (error) {
    console.log(`error in creating product ${error}`);
    res.status(500).json({ msg: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("image deleted successfully");
      } catch (error) {
        console.log(`error in deleting image ${error}`);
      }
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          image: 1,
        },
      },
    ]);
    res.json({ products });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    res.json({ products });
  } catch (error) {
    console.log(`error in getting products by category ${error}`);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await upadteFeaturedProductsCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ msg: "Product not found" });
    }
  } catch (error) {
    console.log("error in toggling featured product", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

async function upadteFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set(`featured_products`, JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("error in updating featured products cache", error.message);
    res.json({
      msg: "error in updating featured products cache",
      error: error.message,
    });
  }
}
