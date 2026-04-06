import { ActionOptions } from "gadget-server";

/** @type { ActionRun } */
export const run = async ({ logger, api, connections, sessionID }) => {
  try {
    const session = await api.session.findById(sessionID);
    const shopId = session.shopId;

    const fontSetting = await api.fontSetting.findFirst({
      filter: {
        shopid: { equals: String(shopId) },
        namespace: { equals: "setting" },
        key: { equals: "style" },
      },
    });

    if (!fontSetting?.value) {
      logger.info("No font setting found for this shop");
      return;
    }

    const shopifyClient = await connections.shopify.forShopId(shopId);

    const result = await shopifyClient.graphql(
      `mutation ($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            key
            namespace
            value
          }
          userErrors {
            message
          }
        }
      }`,
      {
        metafields: [{
          key: "style",
          namespace: "setting",
          ownerId: `gid://shopify/Shop/${shopId}`,
          type: "json",
          value: JSON.stringify(fontSetting.value),
        }],
      }
    );

    if (result.metafieldsSet.userErrors.length > 0) {
      throw new Error("Shopify errors: " + JSON.stringify(result.metafieldsSet.userErrors));
    }

    logger.info("Metafield updated successfully");
  } catch (error) {
    logger.error("Error updating metafield:", error);
    throw error;
  }
};
/** @type { ActionOptions } */
export const options = {
  actionType: "custom",
  triggers: { api: true },
};

