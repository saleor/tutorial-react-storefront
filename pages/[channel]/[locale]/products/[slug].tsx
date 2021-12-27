import { ApolloQueryResult } from "@apollo/client";
import { useAuthState } from "@saleor/sdk";
import clsx from "clsx";
import {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import Custom404 from "pages/404";
import React, { ReactElement, useState } from "react";
import { useLocalStorage } from "react-use";

import { Layout, RichText, VariantSelector } from "@/components";
import { useChannels } from "@/components/ChannelsProvider/useChannels";
import { AttributeDetails } from "@/components/product/AttributeDetails";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPageSeo } from "@/components/seo/ProductPageSeo";
import { CHECKOUT_TOKEN } from "@/lib/const";
import apolloClient from "@/lib/graphql";
import { usePaths } from "@/lib/paths";
import { getSelectedVariantID } from "@/lib/product";
import { productPaths } from "@/lib/ssr/product";
import {
  CheckoutError,
  ProductBySlugDocument,
  ProductBySlugQuery,
  ProductBySlugQueryVariables,
  useCheckoutAddProductLineMutation,
  useCheckoutByTokenQuery,
  useCreateCheckoutMutation,
} from "@/saleor/api";

export type OptionalQuery = {
  variant?: string;
};

const ProductPage = ({
  product,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  const { paths } = usePaths();
  const { currentChannel } = useChannels();
  const [checkoutToken, setCheckoutToken] = useLocalStorage(CHECKOUT_TOKEN);
  const [createCheckout] = useCreateCheckoutMutation();
  const { user } = useAuthState();

  const { data: checkoutData } = useCheckoutByTokenQuery({
    variables: { checkoutToken },
    skip: !checkoutToken || !process.browser,
  });
  const [addProductToCheckout] = useCheckoutAddProductLineMutation();
  const [loadingAddToCheckout, setLoadingAddToCheckout] = useState(false);
  const [addToCartError, setAddToCartError] = useState("");

  if (!product?.id) {
    return <Custom404 />;
  }

  const selectedVariantID = getSelectedVariantID(product, router);

  const selectedVariant =
    product?.variants?.find((v) => v?.id === selectedVariantID) || undefined;

  const onAddToCart = async () => {
    // Clear previous error messages
    setAddToCartError("");

    // Block add to checkout button
    setLoadingAddToCheckout(true);
    const errors: CheckoutError[] = [];

    if (!selectedVariantID) {
      return;
    }

    if (!!checkoutData?.checkout) {
      // If checkout is already existing, add products
      const { data: addToCartData } = await addProductToCheckout({
        variables: {
          checkoutToken: checkoutToken,
          variantId: selectedVariantID,
        },
      });
      addToCartData?.checkoutLinesAdd?.errors.forEach((e) => {
        if (!!e) {
          errors.push(e);
        }
      });
    } else {
      // Theres no checkout, we have to create one
      const { data: createCheckoutData } = await createCheckout({
        variables: {
          email: user?.email || "anonymous@example.com",
          channel: currentChannel.slug,
          lines: [
            {
              quantity: 1,
              variantId: selectedVariantID,
            },
          ],
        },
      });
      createCheckoutData?.checkoutCreate?.errors.forEach((e) => {
        if (!!e) {
          errors.push(e);
        }
      });
      if (createCheckoutData?.checkoutCreate?.checkout?.token) {
        setCheckoutToken(createCheckoutData?.checkoutCreate?.checkout?.token);
      }
    }
    // Enable button
    setLoadingAddToCheckout(false);

    if (errors.length === 0) {
      // Product successfully added, redirect to cart page
      router.push(paths.cart.$url());
      return;
    }

    // Display error message
    const errorMessages =
      errors.map((e) => {
        return e.message || "";
      }) || [];
    setAddToCartError(errorMessages.join("\n"));
  };

  const isAddToCartButtonDisabled =
    !selectedVariant ||
    selectedVariant?.quantityAvailable === 0 ||
    loadingAddToCheckout;

  return (
    <>
      <ProductPageSeo product={product} />
      <main
        className={clsx(
          "grid grid-cols-1 gap-4 max-h-full overflow-auto md:overflow-hidden max-w-7xl mx-auto pt-8 px-8 md:grid-cols-3"
        )}
      >
        <div className="col-span-2">
          <ProductGallery product={product} selectedVariant={selectedVariant} />
        </div>
        <div className="space-y-8 mt-10 md:mt-0">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-800">
              {product?.name}
            </h1>
            {!!product?.category?.slug && (
              <Link
                href={paths.category._slug(product?.category?.slug).$url()}
                passHref
              >
                <p className="text-lg mt-2 font-medium text-gray-600 cursor-pointer">
                  {product?.category?.name}
                </p>
              </Link>
            )}
          </div>

          <VariantSelector
            product={product}
            selectedVariantID={selectedVariantID}
          />

          <button
            onClick={onAddToCart}
            type="submit"
            disabled={isAddToCartButtonDisabled}
            className={clsx(
              "max-w-xs w-full bg-blue-500 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-white hover:bg-blue-600 focus:outline-none",
              isAddToCartButtonDisabled && "bg-gray-400 hover:bg-gray-400"
            )}
          >
            {loadingAddToCheckout ? "Adding..." : "Add to cart"}
          </button>

          {!selectedVariant && (
            <p className="text-lg- text-yellow-600">Please choose a variant</p>
          )}

          {selectedVariant?.quantityAvailable === 0 && (
            <p className="text-lg- text-yellow-600">Sold out!</p>
          )}

          {!!addToCartError && <p>{addToCartError}</p>}

          {product?.description && (
            <div className="text-base text-gray-700 space-y-6">
              <RichText jsonStringData={product.description} />
            </div>
          )}

          <AttributeDetails
            product={product}
            selectedVariant={selectedVariant}
          />
        </div>
      </main>
    </>
  );
};

export default ProductPage;

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await productPaths();
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const productSlug = context.params?.slug?.toString() as string;
  const channelSlug = context.params?.channel?.toString() as string;
  const locale = context.params?.locale?.toString() as string;
  const response: ApolloQueryResult<ProductBySlugQuery> =
    await apolloClient.query<ProductBySlugQuery, ProductBySlugQueryVariables>({
      query: ProductBySlugDocument,
      variables: {
        slug: productSlug,
        channel: channelSlug,
      },
    });
  return {
    props: {
      product: response.data.product,
    },
    revalidate: 60, // value in seconds, how often ISR will trigger on the server
  };
};

ProductPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
