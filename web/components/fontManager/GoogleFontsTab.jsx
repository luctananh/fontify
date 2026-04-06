import React from 'react';
import { BlockStack, Text, TextField, Checkbox, ButtonGroup, Button, InlineError } from '@shopify/polaris';

const COLUMNS = 3;

export default function GoogleFontsTab({
    fontNamesSelected,
    paginatedFonts,
    fontsSelected,
    fontNameError,
    currentPage,
    totalPages,
    onFontChange,
    onSearchChange,
    onPageChange,
}) {
    return (
        <BlockStack style={{ flexDirection: 'column', gap: '15px' }}>
            <Text variant="headingMd" as="h6">Font Name</Text>
            <TextField
                value={fontNamesSelected || ''}
                onChange={(newValue) => {
                    onSearchChange(newValue);
                    onFontChange(newValue, true); // true = direct text input
                }}
                placeholder="Search for the font name"
                autoComplete="off"
            />
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
                    gap: '10px',
                }}
            >
                {paginatedFonts.map((font) => (
                    <div key={font.value} style={{ padding: '5px' }}>
                        <Checkbox
                            label={<span style={{ fontFamily: font.label }}>{font.label}</span>}
                            checked={!!fontsSelected[font.value]}
                            onChange={() => onFontChange(font.value)}
                        />
                    </div>
                ))}
            </div>
            {fontNameError && (
                <InlineError message="Please select at least one font option" fieldID="fontNameSelectError" />
            )}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                    <ButtonGroup>
                        <Button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
                            Previous
                        </Button>
                        <Text variant="bodySm" as="span" fontWeight="bold">
                            {currentPage}/{totalPages}
                        </Text>
                        <Button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
                            Next
                        </Button>
                    </ButtonGroup>
                </div>
            )}
        </BlockStack>
    );
}
