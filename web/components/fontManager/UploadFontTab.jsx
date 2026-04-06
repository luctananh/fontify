import React from 'react';
import { BlockStack, Text, DropZone, Thumbnail, Button, TextField, InlineError } from '@shopify/polaris';
import { NoteIcon } from '@shopify/polaris-icons';

export default function UploadFontTab({
    file,
    fileName,
    isEditMode,
    isCleared,
    saveButtonClicked,
    fileError,
    nameError,
    onDrop,
    onNameChange,
    onClear,
}) {
    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

    const uploadedFile = file && (
        <BlockStack>
            <Thumbnail
                size="small"
                alt={file.name}
                source={validImageTypes.includes(file.type) ? window.URL.createObjectURL(file) : NoteIcon}
            />
            <div>
                {file.name}{' '}
                <Text variant="bodySm" as="p">{file.size} bytes</Text>
            </div>
        </BlockStack>
    );

    const fileUpload = !file && !(isEditMode && fileName) && (
        <DropZone.FileUpload actionHint="Accepts .woff, .otf, and .ttf" actionTitle="Add file" />
    );

    return (
        <BlockStack style={{ flexDirection: 'column', gap: '10px' }}>
            <BlockStack style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="headingMd" as="h6">Add file</Text>
                {((file || (isEditMode && fileName)) && !isCleared) && (
                    <Button onClick={onClear}>Clear</Button>
                )}
            </BlockStack>

            <DropZone allowMultiple={false} onDrop={onDrop}>
                {!isCleared && (uploadedFile || (isEditMode && !file && fileName && (
                    <BlockStack>
                        <Thumbnail size="small" alt="Existing font" source={NoteIcon} />
                        <div>
                            {fileName}
                            <Text variant="bodySm" as="p">(Existing font file)</Text>
                        </div>
                    </BlockStack>
                )))}
                {fileUpload || isCleared}
            </DropZone>

            {saveButtonClicked && fileError && (
                <InlineError message="Please upload a font file" fieldID="addFileError" />
            )}

            <div>
                <p>
                    1.Need more fonts? Let's buy the recommended font from NitroApps here:
                    <a href="https://www.fontspring.com?refby=NitroApps" target="_blank" rel="noopener noreferrer"> https://www.fontspring.com?refby=NitroApps </a>
                </p>
                <p>
                    2.or free fonts here:
                    <a href="https://fonts.adobe.com" target="_blank" rel="noopener noreferrer"> https://fonts.adobe.com </a>,
                    <a href="https://www.fonts.com" target="_blank" rel="noopener noreferrer"> https://www.fonts.com </a>,
                    <a href="https://webfonts.ffonts.net" target="_blank" rel="noopener noreferrer"> https://webfonts.ffonts.net </a>,
                    <a href="https://fontsforweb.com" target="_blank" rel="noopener noreferrer"> https://fontsforweb.com </a>,
                    <a href="https://www.dafont.com" target="_blank" rel="noopener noreferrer"> https://www.dafont.com </a>
                </p>
                <p>
                    3.Convert file to woff:
                    <a href="https://cloudconvert.com/otf-to-ttf" target="_blank" rel="noopener noreferrer"> https://cloudconvert.com/otf-to-ttf </a>
                </p>
            </div>

            <Text variant="headingMd" as="h6">Name file</Text>
            <TextField value={fileName} onChange={onNameChange} />
            {saveButtonClicked && nameError && (
                <InlineError message="Please enter a font name" fieldID="nameFileError" />
            )}
        </BlockStack>
    );
}
