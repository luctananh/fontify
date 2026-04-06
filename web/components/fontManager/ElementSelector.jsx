import React from 'react';
import { Card, Text, Checkbox, InlineError } from '@shopify/polaris';

const ELEMENTS = [
    { key: 'h1', label: 'Headline 1 (h1 tags)' },
    { key: 'h2', label: 'Headline 2 (h2 tags)' },
    { key: 'h3', label: 'Headline 3 (h3 tags)' },
    { key: 'h4', label: 'Headline 4 (h4 tags)' },
    { key: 'h5', label: 'Headline 5 (h5 tags)' },
    { key: 'h6', label: 'Headline 6 (h6 tags)' },
    { key: 'body', label: 'body (body tags)' },
    { key: 'p', label: 'Paragraph (p tags)' },
    { key: 'a', label: 'Anchor link (a tags)' },
    { key: 'li', label: 'List (li tags)' },
];

export default function ElementSelector({
    selectedElements,
    allElementsSelected,
    onElementChange,
    onAllElementsChange,
    saveButtonClicked,
    elementsError,
}) {
    return (
        <Card title="Select Elements to Apply Font">
            <Text variant="headingMd" as="h6">Assign font to elements</Text>
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '30px', marginTop: '10px' }}>
                <Checkbox
                    label="All"
                    checked={allElementsSelected}
                    onChange={onAllElementsChange}
                    style={{ marginBottom: '5px', display: 'block' }}
                />
                {ELEMENTS.map(({ key, label }) => (
                    <Checkbox
                        key={key}
                        label={label}
                        checked={selectedElements[key]}
                        onChange={() => onElementChange(key)}
                        style={{ marginBottom: '5px', display: 'block' }}
                    />
                ))}
            </div>
            {saveButtonClicked && elementsError && (
                <InlineError message="Please select at least one option" fieldID="assignElementsError" />
            )}
        </Card>
    );
}
