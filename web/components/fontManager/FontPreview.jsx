import React from 'react';
import { Card, Text, BlockStack } from '@shopify/polaris';

const alphabetUpper = "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z";
const alphabetLower = "a b c d e f g h i j k l m n o p q r s t u v w x y z";
const numbers = "0 1 2 3 4 5 6 7 8 9";
const specialCharacters = "! @ # $ % ^ & * ( ) ~";

const previewStyle = (fontName) => ({
    fontFamily: fontName,
    fontSize: '22px',
    lineHeight: '1',
    letterSpacing: '0.05em',
    whiteSpace: 'pre-wrap',
});

const sampleBlock = (label, text, fontName) => (
    <BlockStack style={{ border: '2px dashed #ccc', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
        <Text variant="bodySm" fontWeight="bold">{label} </Text>
        <div style={previewStyle(fontName)}>{'\n' + text}</div>
    </BlockStack>
);

export default function FontPreview({ fontNamesSelected }) {
    return (
        <Card>
            <Text variant="headingMd" as="h6">Preview font</Text>
            <BlockStack style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginTop: '5px' }}>
                {sampleBlock('Uppercase Alphabet:', alphabetUpper, fontNamesSelected)}
                {sampleBlock('Lowercase Alphabet:', alphabetLower, fontNamesSelected)}
                {sampleBlock('Numbers:', numbers, fontNamesSelected)}
                {sampleBlock('Special Characters:', specialCharacters, fontNamesSelected)}
            </BlockStack>
        </Card>
    );
}
