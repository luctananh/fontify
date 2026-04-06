import React from 'react';
import { Card, Text, InlineGrid, BlockStack, RadioButton, TextField, InlineError } from '@shopify/polaris';

export default function FontSizeCard({
    sizeMode,
    fontSize,
    fontSizeError,
    saveButtonClicked,
    onSizeModeChange,
    onFontSizeChange,
}) {
    return (
        <Card>
            <div style={{ marginBottom: '10px' }}>
                <Text variant="headingMd">Custom stylesheets</Text>
            </div>
            <InlineGrid gap={100}>
                <BlockStack style={{ display: 'flex', flexDirection: 'column', marginLeft: '30px' }}>
                    <RadioButton
                        label="Default font size"
                        checked={sizeMode === 'default'}
                        onChange={() => onSizeModeChange('default')}
                    />
                    <RadioButton
                        label="Custom font size"
                        checked={sizeMode === 'custom'}
                        onChange={() => onSizeModeChange('custom')}
                        helpText={
                            sizeMode === 'custom' && (
                                <InlineGrid gap={200}>
                                    <BlockStack style={{ maxWidth: '90%' }}>
                                        <TextField
                                            value={fontSize === 'default' ? '' : fontSize}
                                            type="number"
                                            onChange={onFontSizeChange}
                                            prefix="font-size:"
                                            placeholder="Your-Size-Settings"
                                            autoSize
                                            clearButton
                                            onClearButtonClick={() => onFontSizeChange('')}
                                            autoComplete="off"
                                            error={saveButtonClicked && fontSizeError}
                                            id="customFontSizeInput"
                                        />
                                    </BlockStack>
                                    {saveButtonClicked && fontSizeError && (
                                        <InlineError message="Please enter a valid font size." fieldID="customFontSizeInput" />
                                    )}
                                </InlineGrid>
                            )
                        }
                    />
                </BlockStack>
            </InlineGrid>
        </Card>
    );
}
