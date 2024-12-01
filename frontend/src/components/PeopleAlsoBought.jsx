import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import Product from "../../../backend/models/product.model";

const PeopleAlsoBought = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await axios.get("/products/recommendations");
        setRecommendations(res.data);
      } catch (error) {
        toast.error(
          error.response.data.message ||
            "An error occurred while fetching recommendations"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  } else {
    return (
      <div className="mt-8">
        <h3 className="text-2xl font-semibold text-emerald-400">
          People also bought
        </h3>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg: grid-col-3">
          {recommendations.products.map((Product) => {
            return <ProductCard key={Product._id} product={Product} />;
          })}
        </div>
      </div>
    );
  }
};
export default PeopleAlsoBought;
