export function getHrefForVariant({ productSlug, variantId }: { productSlug: string; variantId: string }): string {
	const pathname = `/products/${encodeURIComponent(productSlug)}`;
	const query = new URLSearchParams({ variant: variantId });
	return `${pathname}?${query.toString()}`;
}
