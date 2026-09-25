import { onBeforeUnmount, onMounted, ref } from "vue";
import {
  getTrendsSourceCatalogRevision,
  subscribeTrendsSourceCatalog,
} from "@/utils/sourceSubtypes";

export const useTrendsCatalogRevision = () => {
  const revision = ref(getTrendsSourceCatalogRevision());
  let unsubscribe = null;

  onMounted(() => {
    unsubscribe = subscribeTrendsSourceCatalog(() => {
      revision.value = getTrendsSourceCatalogRevision();
    });
    // Catalog revalidation can finish between setup() and onMounted().
    // Reconcile once after subscribing so that window cannot lose a revision.
    revision.value = getTrendsSourceCatalogRevision();
  });

  onBeforeUnmount(() => {
    unsubscribe?.();
    unsubscribe = null;
  });

  return revision;
};
