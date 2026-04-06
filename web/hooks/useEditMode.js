import { useEffect } from 'react';
import { api } from '../api';

export function useEditMode({
    isEditMode,
    fontIdFromUrl,
    setSelected,
    setFileName,
    setFile,
    setFontNamesSelected,
    setFontSize,
    setSizeMode,
    setSelectedElements,
    setAllElementsSelected,
    setInputs,
    setCheckedPages,
    setTextFields,
    setToastContent,
    setToastActive,
}) {
    useEffect(() => {
        const loadFontData = async () => {
            if (isEditMode && fontIdFromUrl) {
                try {
                    const fontData = await api.font.findOne(fontIdFromUrl, {
                        select: {
                            id: true,
                            name: true,
                            keyfont: true,
                            link: true,
                            checkbox: true,
                            size: true,
                            visibilityMode: true,
                            homePage: true,
                            cartPage: true,
                            blogPage: true,
                            productsPage: true,
                            collectionsPage: true,
                            customUrl: true,
                            customUrls: true,
                        },
                    });

                    if (fontData.keyfont === 'google') {
                        setSelected(1);
                        setFontNamesSelected(fontData.name);
                    } else {
                        setSelected(0);
                        setFileName(fontData.name);
                    }

                    const elements = fontData.checkbox?.split(',') || [];
                    const newSelectedElements = {
                        h1: false, h2: false, h3: false, h4: false, h5: false,
                        h6: false, body: false, p: false, a: false, li: false,
                    };
                    elements.forEach((tag) => {
                        if (Object.prototype.hasOwnProperty.call(newSelectedElements, tag)) {
                            newSelectedElements[tag] = true;
                        }
                    });
                    setSelectedElements(newSelectedElements);
                    setAllElementsSelected(elements.length === Object.keys(newSelectedElements).length);

                    if (fontData.size === 'default' || !fontData.size) {
                        setSizeMode('default');
                        setFontSize('default');
                    } else {
                        setSizeMode('custom');
                        setFontSize(fontData.size);
                    }

                    setInputs((prev) => ({
                        ...prev,
                        visibilityMode: fontData.visibilityMode || 'all',
                    }));

                    setCheckedPages({
                        homePage: fontData.homePage || false,
                        cartPage: fontData.cartPage || false,
                        blogPage: fontData.blogPage || false,
                        productsPage: fontData.productsPage || false,
                        collectionsPage: fontData.collectionsPage || false,
                        customUrl: fontData.customUrl || false,
                    });

                    const urlsArray = fontData.customUrls ? fontData.customUrls.split(',') : [];
                    setTextFields(urlsArray.length > 0 ? urlsArray : ['']);
                } catch (error) {
                    console.error('Error loading font data:', error);
                    setToastContent('Error loading font data: ' + error.message);
                    setToastActive(true);
                }
            } else {
                setFileName('');
                setFile(null);
                setSelectedElements({
                    h1: false, h2: false, h3: false, h4: false, h5: false,
                    h6: false, body: false, p: false, a: false, li: false,
                });
                setAllElementsSelected(false);
                setSizeMode('default');
                setFontSize('default');
                setInputs({
                    visibilityMode: 'all',
                    homePage: false,
                    cartPage: false,
                    blogPage: false,
                    productsPage: false,
                    collectionsPage: false,
                    customUrl: false,
                    customUrls: [],
                });
                setCheckedPages({
                    homePage: false,
                    cartPage: false,
                    blogPage: false,
                    productsPage: false,
                    collectionsPage: false,
                    customUrl: false,
                });
                setTextFields(['']);
                setSelected(0);
                setFontNamesSelected('');
            }
        };

        loadFontData();
    }, [isEditMode, fontIdFromUrl]);
}
