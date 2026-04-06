import React from 'react';
import { Grid, Card, BlockStack, Text } from '@shopify/polaris';

export default function FontStatsGrid({ fontData }) {
    const googleFontsCount = fontData.filter((f) => f.keyfont === 'google').length;
    const uploadFontsCount = fontData.filter((f) => f.keyfont && f.keyfont !== 'google').length;
    const totalFontsCount = fontData.length;

    const stats = [
        { label: 'Google Fonts', value: googleFontsCount },
        { label: 'Upload Fonts', value: uploadFontsCount },
        { label: 'Total Fonts', value: totalFontsCount },
    ];

    return (
        <Grid>
            {stats.map(({ label, value }) => (
                <Grid.Cell key={label} columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                    <Card padding="400" roundedAbove="sm">
                        <BlockStack gap="200" inlineAlign="center">
                            <Text variant="headingSm" as="h3" alignment="center">{label}</Text>
                            <Text variant="headingLg" as="p" alignment="center">{value}</Text>
                        </BlockStack>
                    </Card>
                </Grid.Cell>
            ))}
        </Grid>
    );
}
