import React from 'react';
import { Card, BlockStack, Text, Select, Button, ButtonGroup } from '@shopify/polaris';

export default function ThemeSelectorCard({ themes, selectedThemeId, onThemeChange, onApplyNow }) {
    return (
        <Card>
            <BlockStack gap="4" style={{ marginBottom: '10px' }}>
                <Text variant="headingMd" as="h6">Select your theme</Text>
            </BlockStack>
            <BlockStack gap="200">
                <Select
                    options={themes}
                    onChange={onThemeChange}
                    value={selectedThemeId}
                    placeholder="Select a theme"
                />
                <Text as="p" variant="bodyMd">
                    Click on Apply now button to go to the theme editor, after that
                    you can click on Save button to apply your fonts to the theme.
                    Back to the app to continue your work.
                </Text>
                <ButtonGroup>
                    <Button onClick={onApplyNow} variant="primary" primary>
                        Apply now
                    </Button>
                </ButtonGroup>
            </BlockStack>
        </Card>
    );
}
