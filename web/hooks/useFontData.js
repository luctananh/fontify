import { useState, useEffect } from 'react';
import { api } from '../api';

const FONT_LIST_PER_PAGE = 5;
const SELECTED_THEME_KEY = 'selectedThemeId';

export function useFontData({ setToastContent, setToastActive, setErrorContent, setErrorActive }) {
    const [themes, setThemes] = useState([]);
    const [selectedThemeId, setSelectedThemeId] = useState(null);
    const [fontData, setFontData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [queryValue, setQueryValue] = useState('');
    const [currentAppliedFont, setCurrentAppliedFont] = useState(null);
    const [shopHandle, setShopHandle] = useState(null);
    const [applyingFontId, setApplyingFontId] = useState(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const shop = await api.shopifyShop.findFirst({ select: { id: true, myshopifyDomain: true } });
                const shopid = shop?.id ? String(shop.id) : null;
                const handle = shop?.myshopifyDomain?.replace('.myshopify.com', '') ?? null;

                const themeResult = await api.shopifyTheme.findMany();
                setThemes(themeResult.map((t) => ({ label: t.name, value: t.id })));
                setShopHandle(handle);

                const fontResult = await api.font.findMany();
                setFontData(fontResult);

                if (shopid) {
                    const fontSettingRecords = await api.fontSetting.findMany({
                        filter: { shopid: { equals: shopid }, namespace: { equals: 'setting' }, key: { equals: 'style' } },
                        select: { value: true },
                    });
                    if (fontSettingRecords.length > 0 && fontSettingRecords[0].value?.id) {
                        setCurrentAppliedFont(fontSettingRecords[0].value.id);
                    }
                }

                const storedThemeId = localStorage.getItem(SELECTED_THEME_KEY);
                if (storedThemeId) {
                    if (themeResult.some(t => String(t.id) === String(storedThemeId))) {
                        setSelectedThemeId(storedThemeId);
                    } else {
                        localStorage.removeItem(SELECTED_THEME_KEY);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setErrorContent('Failed to load initial data. Please try refreshing.');
                setErrorActive(true);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleThemeChange = (value) => {
        setSelectedThemeId(value);
        localStorage.setItem(SELECTED_THEME_KEY, value);
    };

    const handleDeleteFont = async (id) => {
        try {
            await api.font.delete(id);
            const updated = fontData.filter((f) => f.id !== id);
            setFontData(updated);
            const totalPages = Math.ceil(updated.length / FONT_LIST_PER_PAGE);
            if (currentPage > totalPages && currentPage > 1) setCurrentPage(currentPage - 1);
            setToastContent('Font deleted successfully!');
            setToastActive(true);
        } catch (error) {
            console.error('Error deleting font:', error);
            setErrorContent('Failed to delete font: ' + error);
            setErrorActive(true);
        }
    };

    const handleApplyFont = async (font) => {
        try {
            setApplyingFontId(font.id);
            if (!font.checkbox) throw new Error('Font has no assigned elements');
            const shop = await api.shopifyShop.findFirst({ select: { id: true } });
            if (!shop?.id) throw new Error('Could not fetch Shop ID');
            const shopid = String(shop.id);
            const value = {
                id: font.id,
                name: font.name,
                link: font.link,
                selectedElements: font.checkbox || '',
                keyfont: font.keyfont,
                updatedAt: new Date().toISOString(),
            };
            const fontSettingRecords = await api.fontSetting.findMany({
                filter: { shopid: { equals: shopid }, namespace: { equals: 'setting' }, key: { equals: 'style' } },
            });
            if (fontSettingRecords.length === 0) {
                await api.fontSetting.create({ shopid, namespace: 'setting', key: 'style', value });
            } else {
                await api.fontSetting.update(fontSettingRecords[0].id, { value });
            }
            await api.applyFontToTheme();
            setCurrentAppliedFont(font.id);
            setToastContent('Font applied successfully!');
            setToastActive(true);
        } catch (error) {
            setErrorContent(`Failed to apply font: ${error.message}`);
            setErrorActive(true);
        } finally {
            setApplyingFontId(null);
        }
    };

    const filteredFonts = fontData
        .filter((f) => f.name.toLowerCase().includes(queryValue?.toLowerCase() || ''))
        .sort((a, b) => {
            if (a.id === currentAppliedFont) return -1;
            if (b.id === currentAppliedFont) return 1;
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

    const totalPages = Math.ceil(filteredFonts.length / FONT_LIST_PER_PAGE);
    const paginatedFonts = filteredFonts.slice(
        (currentPage - 1) * FONT_LIST_PER_PAGE,
        currentPage * FONT_LIST_PER_PAGE
    );

    return {
        themes,
        selectedThemeId,
        fontData,
        currentPage,
        loading,
        queryValue,
        currentAppliedFont,
        shopHandle,
        applyingFontId,
        paginatedFonts,
        totalPages,
        setQueryValue,
        setCurrentPage,
        handleThemeChange,
        handleDeleteFont,
        handleApplyFont,
    };
}
