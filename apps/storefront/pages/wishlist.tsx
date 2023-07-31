import React, { ReactElement, useEffect, useState } from "react";

import { Layout } from "@/components";
import { useWishlist } from "context/WishlistContext";
import { ProductCard } from "@/components/ProductCard";

function WishlistPage() {
  const { wishlist } = useWishlist();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="container w-full px-8 mt-18 mb-18">
      <h1 className="mb-4 font-bold text-5xl md:text-6xl xl:text-7xl tracking-tight max-w-[647px] md:max-w-full">
        Twoja lista życzeń
      </h1>
      <ul
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mt-12"
        data-testid="productsList"
      >
        {wishlist?.length > 0 ? (
          wishlist.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <p className="text-md">Nie masz aktualnie żadnych produktów na liście życzeń</p>
        )}
      </ul>
    </main>
  );
}

WishlistPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default WishlistPage;
