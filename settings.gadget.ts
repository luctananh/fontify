import type { GadgetSettings } from "gadget-server";

export const settings: GadgetSettings = {
  type: "gadget/settings/v1",
  frameworkVersion: "v1.3.0",
  plugins: {
    connections: {
      shopify: {
        apiVersion: "2025-07",
        enabledModels: [
          "shopifyAsset",
          "shopifyDomain",
          "shopifyProduct",
          "shopifyTheme",
        ],
        type: "partner",
        scopes: [
          "read_products",
          "read_themes",
          "write_themes",
          "write_products",
        ],
      },
    },
  },
};
