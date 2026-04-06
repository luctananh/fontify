import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Frame, Toast } from '@shopify/polaris';
import { useNavigate, useLocation } from 'react-router';
import {
    EmptyState,
    Banner,
    BlockStack,
    Button,
    Card,
    Layout,
    Page,
    Spinner,
    MediaCard,
    VideoThumbnail,
    ResourceList,
    Filters,
    Text,
} from '@shopify/polaris';
import { XIcon } from '@shopify/polaris-icons';
import { useFontData } from '../hooks/useFontData';
import FontStatsGrid from '../components/fontList/FontStatsGrid';
import ThemeSelectorCard from '../components/fontList/ThemeSelectorCard';
import FontListItem from '../components/fontList/FontListItem';

export default function AppPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const listCardRef = useRef(null);

    const [bannerActive, setBannerActive] = useState(false);
    const [bannerContent, setBannerContent] = useState('');
    const [toastActive, setToastActive] = useState(false);
    const [toastContent, setToastContent] = useState('');
    const [errorActive, setErrorActive] = useState(false);
    const [errorContent, setErrorContent] = useState('');
    const [activePopover, setActivePopover] = useState(null);
    const [showMediaCard, setShowMediaCard] = useState(true);
    const [showVideoCard, setShowVideoCard] = useState(false);

    const {
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
    } = useFontData({ setToastContent, setToastActive, setErrorContent, setErrorActive });

    useEffect(() => {
        if (listCardRef.current) {
            listCardRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentPage]);

    useEffect(() => {
        if (!location.state) return;
        if (location.state.toastMessage || location.state.deleteMessage) {
            setToastContent(location.state.toastMessage || location.state.deleteMessage);
            setToastActive(true);
        } else if (location.state.errorMessage) {
            setErrorContent(location.state.errorMessage);
            setErrorActive(true);
        }
        navigate(location.pathname, { replace: true, state: null });
    }, [location.state]);

    const handleApplyNow = () => {
        if (!selectedThemeId) {
            setBannerContent('Please select a theme first.');
            setBannerActive(true);
            return;
        }
        const storeHandle = shopHandle ?? 'mystore';
        const editorUrl = `https://admin.shopify.com/store/${storeHandle}/themes/${selectedThemeId}/editor?context=apps`;
        window.open(editorUrl, '_blank');
    };

    const handleRowClick = (font) => {
        const type = font.keyfont === 'google' ? 'google-font-tab' : 'upload-tab';
        navigate(`/fonts?type=${type}&name=${font.name}&elements=${font.checkbox || ''}&edit=true&fontId=${font.id}&size=${font.size}`);
    };

    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);

    const filterControl = (
        <Filters
            queryValue={queryValue}
            queryPlaceholder="Filter fonts"
            filters={[]}
            appliedFilters={[]}
            onQueryChange={setQueryValue}
            onQueryClear={handleQueryValueRemove}
            onClearAll={handleQueryValueRemove}
        />
    );

    const resourceName = { singular: 'Font', plural: 'Fonts' };

    return (
        <Frame>
            <Page title="Home">
                {showMediaCard && (
                    <div style={{ marginBottom: '20px', width: '100%', height: '25%' }}>
                        <MediaCard
                            title="Getting started video guide"
                            primaryAction={{ content: 'Learn more', onAction: () => { setShowVideoCard(true); setShowMediaCard(false); } }}
                            description="Let see video guide to learn how to use App"
                            popoverActions={[{ content: 'Dismiss', onAction: () => setShowMediaCard(false) }]}
                        >
                            <VideoThumbnail
                                videoLength={420}
                                videoProgress={420}
                                showVideoProgress
                                thumbnailUrl="https://blog.tcea.org/wp-content/uploads/2021/08/font-heading-image.png"
                                onClick={() => console.log('clicked')}
                            />
                        </MediaCard>
                    </div>
                )}

                {showVideoCard && (
                    <BlockStack>
                        <div style={{ marginBottom: '20px' }}>
                            <Card sectioned>
                                <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1 }}>
                                    <Button icon={XIcon} onClick={() => setShowVideoCard(false)} accessibilityLabel="Dismiss video" plain />
                                </div>
                                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                                    <iframe
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                                        src="https://cdn.shopify.com/videos/c/o/v/80d4e79e2e094db2a21192ca5826543f.mp4"
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </Card>
                        </div>
                    </BlockStack>
                )}

                {loading ? (
                    <Layout>
                        <Layout.Section>
                            <Card>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
                                    <Spinner size="large" accessibilityLabel="Loading" />
                                </div>
                            </Card>
                        </Layout.Section>
                    </Layout>
                ) : (
                    <Layout>
                        {bannerActive && (
                            <Layout.Section>
                                <Banner title="Error" onDismiss={() => setBannerActive(false)}>
                                    <p>{bannerContent}</p>
                                </Banner>
                            </Layout.Section>
                        )}
                        {errorActive && (
                            <Layout.Section>
                                <Banner title="Error" onDismiss={() => setErrorActive(false)}>
                                    <p>{errorContent}</p>
                                </Banner>
                            </Layout.Section>
                        )}

                        <Layout.Section>
                            <FontStatsGrid fontData={fontData} />
                        </Layout.Section>

                        <Layout.Section>
                            <ThemeSelectorCard
                                themes={themes}
                                selectedThemeId={selectedThemeId}
                                onThemeChange={handleThemeChange}
                                onApplyNow={handleApplyNow}
                            />
                        </Layout.Section>

                        <Layout.Section>
                            <div style={{ marginBottom: '20px' }} ref={listCardRef}>
                                {fontData.length === 0 ? (
                                    <Card>
                                        <BlockStack>
                                            <Text variant="headingMd" as="h6">Add fonts</Text>
                                        </BlockStack>
                                        <EmptyState
                                            heading="Create your first font"
                                            action={{ content: 'Add new font', url: '/fonts' }}
                                            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                                        >
                                            <p>You can upload a custom font or select the font from Google fonts.</p>
                                        </EmptyState>
                                    </Card>
                                ) : (
                                    <Card>
                                        <BlockStack style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0px 8px' }}>
                                            <Text variant="headingMd" as="h6">Add fonts</Text>
                                            <Button secondary url="/fonts" variant="primary">Add new font</Button>
                                        </BlockStack>
                                        <BlockStack>
                                            {filterControl}
                                            <ResourceList
                                                items={paginatedFonts}
                                                resourceName={resourceName}
                                                renderItem={(item) => (
                                                    <FontListItem
                                                        item={item}
                                                        currentAppliedFont={currentAppliedFont}
                                                        applyingFontId={applyingFontId}
                                                        activePopover={activePopover}
                                                        onTogglePopover={(id) => setActivePopover(activePopover === id ? null : id)}
                                                        onClosePopover={() => setActivePopover(null)}
                                                        onApplyFont={handleApplyFont}
                                                        onEditFont={handleRowClick}
                                                        onDeleteFont={handleDeleteFont}
                                                    />
                                                )}
                                                pagination={{
                                                    hasNext: currentPage < totalPages,
                                                    onNext: () => setCurrentPage(currentPage + 1),
                                                    hasPrevious: currentPage > 1,
                                                    onPrevious: () => setCurrentPage(currentPage - 1),
                                                }}
                                            />
                                        </BlockStack>
                                    </Card>
                                )}
                            </div>
                        </Layout.Section>
                    </Layout>
                )}
            </Page>
            {toastActive && <Toast content={toastContent} onDismiss={() => setToastActive(false)} />}
        </Frame>
    );
}
