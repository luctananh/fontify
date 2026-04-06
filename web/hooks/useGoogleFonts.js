import { useState } from 'react';

const GOOGLE_FONTS_PER_PAGE = 15;

export function useGoogleFonts() {
    const [googleFonts, setGoogleFonts] = useState([]);
    const [loadedFonts, setLoadedFonts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const loadFontsForPage = (page, fonts = googleFonts) => {
        const start = (page - 1) * GOOGLE_FONTS_PER_PAGE;
        const end = start + GOOGLE_FONTS_PER_PAGE;
        const fontsToLoad = fonts.slice(start, end);
        fontsToLoad.forEach((font) => {
            if (!loadedFonts.includes(font.value)) {
                const style = document.createElement('style');
                style.textContent = font.style;
                document.head.appendChild(style);
                setLoadedFonts((prev) => [...prev, font.value]);
            }
        });
    };

    const fetchGoogleFonts = async (onError) => {
        try {
            const apiKey = import.meta.env.VITE_GOOGLE_FONTS_API_KEY;
            const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const options = data.items.map((font) => ({
                label: font.family,
                value: font.family,
                variants: font.variants,
                style: `@import url('https://fonts.googleapis.com/css2?family=${font.family.replace(/ /g, '+')}&display=swap');`,
            }));
            setGoogleFonts(options);
            loadFontsForPage(1, options);
        } catch (error) {
            console.error('Error fetching Google Fonts API:', error);
            onError?.('Error fetching Google Fonts: ' + error);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        loadFontsForPage(newPage);
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const filteredFonts = googleFonts.filter((font) =>
        font.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const totalPages = Math.ceil(filteredFonts.length / GOOGLE_FONTS_PER_PAGE);
    const paginatedFonts = filteredFonts.slice(
        (currentPage - 1) * GOOGLE_FONTS_PER_PAGE,
        currentPage * GOOGLE_FONTS_PER_PAGE
    );

    return {
        googleFonts,
        searchQuery,
        currentPage,
        paginatedFonts,
        totalPages,
        fetchGoogleFonts,
        handlePageChange,
        handleSearchChange,
    };
}
