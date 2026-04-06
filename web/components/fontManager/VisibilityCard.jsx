import React from 'react';
import {
    Card, Text, InlineGrid, BlockStack, RadioButton,
    Checkbox, TextField, InlineError, InlineStack, Button,
} from '@shopify/polaris';
import { DeleteIcon, PlusIcon } from '@shopify/polaris-icons';

export default function VisibilityCard({
    visibilityMode,
    checkedPages,
    textFields,
    saveButtonClicked,
    checkboxError,
    onVisibilityModeChange,
    onPageChange,
    onTextFieldChange,
    onAddField,
    onRemoveField,
}) {
    return (
        <Card>
            <div style={{ marginBottom: '10px' }}>
                <Text variant="headingMd">Visibility</Text>
            </div>
            <InlineGrid gap={100}>
                <BlockStack style={{ display: 'flex', flexDirection: 'column', marginLeft: '30px' }}>
                    <RadioButton
                        label="Show on all pages"
                        checked={visibilityMode === 'all'}
                        onChange={() => onVisibilityModeChange('all')}
                    />
                    <RadioButton
                        label="Show on specific pages"
                        checked={visibilityMode === 'specific'}
                        onChange={() => onVisibilityModeChange('specific')}
                        helpText={
                            visibilityMode === 'specific' && (
                                <InlineGrid gap={200}>
                                    <InlineStack gap={200}>
                                        <BlockStack>
                                            <Checkbox label="Home page" checked={checkedPages.homePage} onChange={(v) => onPageChange('homePage', v)} />
                                            <Checkbox label="Cart pages" checked={checkedPages.cartPage} onChange={(v) => onPageChange('cartPage', v)} />
                                            <Checkbox label="Blog pages" checked={checkedPages.blogPage} onChange={(v) => onPageChange('blogPage', v)} />
                                            <Checkbox label="Products pages" checked={checkedPages.productsPage} onChange={(v) => onPageChange('productsPage', v)} />
                                            <Checkbox label="Collections pages" checked={checkedPages.collectionsPage} onChange={(v) => onPageChange('collectionsPage', v)} />
                                            <Checkbox label="Custom URL handle" checked={checkedPages.customUrl} onChange={(v) => onPageChange('customUrl', v)} />

                                            {saveButtonClicked && checkboxError &&
                                                !checkedPages.homePage && !checkedPages.cartPage &&
                                                !checkedPages.blogPage && !checkedPages.productsPage &&
                                                !checkedPages.collectionsPage && !checkedPages.customUrl && (
                                                    <InlineError message="Please select at least one option" />
                                                )}

                                            {checkedPages.customUrl && (
                                                <BlockStack>
                                                    {textFields.map((field, index) => (
                                                        <BlockStack key={index} style={{ flexDirection: 'column', marginTop: '5px', marginLeft: '26px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '5px' }}>
                                                                <TextField
                                                                    value={field}
                                                                    onChange={(value) => onTextFieldChange(index, value)}
                                                                    placeholder="your-url-handle"
                                                                    autoComplete="off"
                                                                    prefix="/"
                                                                    error={saveButtonClicked && checkedPages.customUrl && !field.trim()}
                                                                />
                                                                <Button
                                                                    icon={DeleteIcon}
                                                                    tone="base"
                                                                    onClick={() => onRemoveField(index)}
                                                                    size="small"
                                                                    disabled={textFields.length <= 1}
                                                                />
                                                            </div>
                                                            {saveButtonClicked && checkedPages.customUrl && !field.trim() && (
                                                                <InlineError message="Please enter the URL." fieldID={`customUrl-${index}`} />
                                                            )}
                                                        </BlockStack>
                                                    ))}
                                                    <div style={{ marginTop: '5px', marginBottom: '6px', marginLeft: '26px' }}>
                                                        <Button icon={PlusIcon} onClick={onAddField}>Add URL</Button>
                                                    </div>
                                                </BlockStack>
                                            )}
                                        </BlockStack>
                                    </InlineStack>
                                </InlineGrid>
                            )
                        }
                    />
                </BlockStack>
            </InlineGrid>
        </Card>
    );
}
