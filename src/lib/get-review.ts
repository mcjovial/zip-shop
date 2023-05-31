export function getReview(product: any) {
  if (product?.variation_option_id) {
    return product?.my_review?.find(
      (review: any) =>
        review?.variation_option_id === product?.variation_option_id
    );
  } else {
    return product?.my_review?.[0];
  }
}