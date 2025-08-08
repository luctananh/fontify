import type { GadgetModel } from "gadget-server";

// This file describes the schema for the "shopifyAsset" model, go to https://appfont.gadget.app/edit to view/edit your model in Gadget
// For more information on how to update this file http://docs.gadget.dev

export const schema: GadgetModel = {
  type: "gadget/model-schema/v1",
  storageKey: "DataModel-Shopify-Asset",
  fields: {
    attachment: {
      type: "string",
      storageKey:
        "ModelField-DataModel-Shopify-Asset-attachment::FieldStorageEpoch-DataModel-Shopify-Asset-attachment-initial",
    },
    publicUrl: {
      type: "url",
      storageKey:
        "ModelField-DataModel-Shopify-Asset-public_url::FieldStorageEpoch-DataModel-Shopify-Asset-public_url-initial",
    },
    size: {
      type: "number",
      storageKey:
        "ModelField-DataModel-Shopify-Asset-size::FieldStorageEpoch-DataModel-Shopify-Asset-size-initial",
    },
  },
  shopify: {
    fields: [
      "checksum",
      "contentType",
      "shop",
      "shopifyCreatedAt",
      "shopifyUpdatedAt",
    ],
  },
};
