// import { Attachment } from '@/types';

export function displayImage(
  selectedVariationImage: string | undefined,
  gallery: string[] | undefined | null,
  image: string | undefined
) {
  if (selectedVariationImage) {
    return [selectedVariationImage];
  }
  if (gallery?.length) {
    return gallery;
  }
  if (image) {
    return [image];
  }
  return [];
}
