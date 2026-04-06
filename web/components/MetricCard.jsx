import React, { useState, useEffect } from "react";
import { Card, BlockStack, Text, SkeletonDisplayText } from "@shopify/polaris";

const MetricCard = ({ title, fetchConfig }) => {
    const [value, setValue] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(fetchConfig.url, fetchConfig.options);
                const data = await response.json();
                setValue(data[fetchConfig.field]);
            } catch (error) {
                console.error("Error fetching metric:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <Card>
            <BlockStack gap={200}>
                <Text variant="headingSm" as="h2">
                    {title}
                </Text>
                {loading ? (
                    <SkeletonDisplayText maxWidth="40px" size="small" />
                ) : (
                    <Text variant="headingXl">{value}</Text>
                )}
            </BlockStack>
        </Card>
    );
};

export default MetricCard;
