import { VARIANT_CATEGORY_PROJECTIONS } from "@/config/taxonomy-v3";
import {
  getSourceCategoryIds,
  sourceBelongsToCategory,
} from "@/utils/categoryTree";
import { getSourceVariantOptions } from "@/utils/sourceSubtypes";

const normalizeOptions = (sourceName) =>
  getSourceVariantOptions(sourceName)
    .map((option) => ({
      ...option,
      value: String(option?.value || "").trim(),
      label: String(option?.label || option?.value || "").trim(),
    }))
    .filter((option) => option.value);

export const getCategoryScopedVariantOptions = (
  source,
  categoryRef,
  categories = [],
) => {
  const sourceName = String(source?.name || "").trim();
  if (!sourceName || !categoryRef) return [];

  const options = normalizeOptions(sourceName);
  if (!options.length) return [];

  const optionByValue = new Map(options.map((option) => [option.value, option]));
  const sourceProjections = VARIANT_CATEGORY_PROJECTIONS.filter(
    (projection) =>
      projection.sourceName === sourceName &&
      optionByValue.has(String(projection.variant || "")),
  );
  const projectedVariants = new Set(
    sourceProjections.map((projection) => String(projection.variant || "")),
  );
  const scopedProjectionByVariant = new Map();

  for (const projection of sourceProjections) {
    if (
      sourceBelongsToCategory(
        { ...source, categoryIds: projection.categoryIds || [] },
        categoryRef,
        categories,
      )
    ) {
      scopedProjectionByVariant.set(String(projection.variant), projection);
    }
  }

  const baseBelongs = sourceBelongsToCategory(
    source,
    categoryRef,
    categories,
  );
  const baseCategoryIds = getSourceCategoryIds(source, categories);

  return options
    .map((option) => {
      const projection = scopedProjectionByVariant.get(option.value);
      if (projection) {
        return {
          ...option,
          categoryIds: (projection.categoryIds || []).slice(),
          projectionId: projection.id,
          projectionLabel: projection.label || option.label,
        };
      }
      if (!baseBelongs || projectedVariants.has(option.value)) return null;
      return {
        ...option,
        categoryIds: baseCategoryIds.slice(),
        projectionId: "",
        projectionLabel: option.label,
      };
    })
    .filter(Boolean);
};
