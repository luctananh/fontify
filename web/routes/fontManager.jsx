import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
    Tabs,
    Button,
    Layout,
    Page,
    Card,
    Toast,
    Text,
    ButtonGroup,
    MediaCard,
    VideoThumbnail,
    Banner,
    BlockStack,
    Grid,
    AppProvider,
    Frame,
} from '@shopify/polaris';
import { XIcon } from '@shopify/polaris-icons';
import { api } from '../api';
import { useGoogleFonts } from '../hooks/useGoogleFonts';
import { useEditMode } from '../hooks/useEditMode';
import FontPreview from '../components/fontManager/FontPreview';
import ElementSelector from '../components/fontManager/ElementSelector';
import FontSizeCard from '../components/fontManager/FontSizeCard';
import VisibilityCard from '../components/fontManager/VisibilityCard';
import UploadFontTab from '../components/fontManager/UploadFontTab';
import GoogleFontsTab from '../components/fontManager/GoogleFontsTab';

export default function FontManager() {
    // const [showModal, setShowModal] = useState(false);
    const location = useLocation();
    const setFontDataFromAppPage = location.state?.setFontDataProp;
    const isEditMode = new URLSearchParams(location.search).get('edit') === 'true';
    const fontIdFromUrl = new URLSearchParams(location.search).get('fontId');
    const [fontToDeleteId, setFontToDeleteId] = useState(fontIdFromUrl);
    const [selected, setSelected] = useState(0);
    const [fileName, setFileName] = useState('');
    const [file, setFile] = useState(null);
    const [allElementsSelected, setAllElementsSelected] = useState(false);
    const [selectedFont, setSelectedFont] = useState(null);
    const [fontDetails, setFontDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toastActive, setToastActive] = useState(false);
    const [toastContent, setToastContent] = useState('');
    const [fontsSelected, setFontsSelected] = useState({});
    const [fontNamesSelected, setFontNamesSelected] = useState('');
    const [bannerActive, setBannerActive] = useState(false);

    const {
        googleFonts,
        searchQuery,
        currentPage,
        paginatedFonts,
        totalPages,
        fetchGoogleFonts,
        handlePageChange,
        handleSearchChange,
    } = useGoogleFonts();
    const [bannerContent, setBannerContent] = useState('');
    const [fileError, setFileError] = useState(true); // Ban đầu hiển thị lỗi Add file
    const [nameError, setNameError] = useState(true); // Ban đầu hiển thị lỗi Name file
    const [elementsError, setElementsError] = useState(true); // Ban đầu hiển thị lỗi Assign font to elements
    const [fontNameError, setFontNameError] = useState(true); // Ban đầu hiển thị lỗi Font Name
    const [saveButtonClicked, setSaveButtonClicked] = useState(false); // Thêm state mới
    const [isCleared, setIsCleared] = useState(false); // Track if file upload has been cleared
    const [showMediaCard, setShowMediaCard] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [showVideoCard, setShowVideoCard] = useState(false);
    const [fontSize, setFontSize] = useState('');
    const [sizeMode, setSizeMode] = useState("default");
    const [selectedElements, setSelectedElements] = useState({
        h1: false,
        h2: false,
        h3: false,
        h4: false,
        h5: false,
        h6: false,
        body: false,
        p: false,
        a: false,
        li: false,
    });
    const [inputs, setInputs] = useState({
        visibilityMode: 'all', // Giá trị khởi tạo mặc định, ví dụ: 'all' hoặc 'specific'
        homePage: false,          // Giá trị mặc định cho homePage
        cartPage: false,          // Giá trị mặc định cho cartPage
        blogPage: false,          // Giá trị mặc định cho blogPage
        productsPage: false,      // Giá trị mặc định cho Products
        collectionsPage: false,   // Giá trị mặc định cho Collections
        customUrl: false,         // Giá trị mặc định cho customUrl
        customUrls: [],           // Giá trị mặc định cho customUrls
    });
    // Giả sử bạn cũng cần các state và hàm xử lý cho phần Visibility, thêm chúng vào đây:
    const [checkedPages, setCheckedPages] = useState({
        homePage: false,
        cartPage: false,
        blogPage: false,
        productsPage: false,
        collectionsPage: false,
        customUrl: false,
    });
    const [textFields, setTextFields] = useState(['']); // State cho các URL tùy chỉnh
    const [checkboxError, setCheckboxError] = useState(false); // State cho lỗi checkbox
    const [customUrlsError, setCustomUrlsError] = useState(''); // State cho lỗi URL tùy chỉnh
    const [fontSizeError, setFontSizeError] = useState(false);
    const uploadedFontFaceRef = useRef(null);
    const bannerRef = useRef(null);

    const navigate = useNavigate();

    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelected(selectedTabIndex);
        if (selectedTabIndex === 1) {
            // Reset fileName if switching to Google Fonts tab
            setFileName('');
        } else {
            // Reset fontNamesSelected if switching to Upload tab
            setFontNamesSelected('');
        }
    }, []);

    const handleNameChange = useCallback((newName) => {
        setFileName(newName);
        if (newName) {
            setNameError(false); // Ẩn lỗi "Name file" khi có giá trị
        } else {
            setNameError(true); // Hiển thị lỗi nếu tên file rỗng (tùy logic validation)
        }
    }, []);

    const handleLearnMoreClick = () => {
        setShowVideoCard(true);
        setShowMediaCard(false); // Ẩn MediaCard khi mở video card
    };

    const fetchFonts = async () => {
        try {
            await api.font.findMany();
            fetchGoogleFonts((msg) => { setToastContent(msg); setToastActive(true); });
        } catch (error) {
            console.error('Error fetching fonts:', error);
            setToastContent('Error fetching fonts: ' + error);
            setToastActive(true);
        }
    };

    const uploadFileToGadget = async (file, keyfont, visibilityData) => {
        setLoading(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64Data = reader.result.split(',')[1];
                const selectedTags = Object.keys(selectedElements)
                    .filter((key) => selectedElements[key])
                    .join(',');
                try {
                    let finalCustomUrlsString = null;
                    if (visibilityData.visibilityMode === "specific" && visibilityData.checkedPages.customUrl) {
                        const filteredUrls = visibilityData.textFields.filter(url => url.trim() !== '');
                        if (filteredUrls.length > 0) {
                            // Nối mảng thành một chuỗi duy nhất bằng dấu phẩy
                            finalCustomUrlsString = filteredUrls.join(',');
                        }
                        // Nếu filteredUrls rỗng, finalCustomUrlsString vẫn là null
                    }
                    const createPayload = {
                        name: fileName,
                        link: base64Data,
                        keyfont: keyfont,
                        checkbox: selectedTags,
                        size: sizeMode === "default" ? "default" : fontSize,
                        visibilityMode: visibilityData.visibilityMode,
                        homePage: visibilityData.checkedPages.homePage,
                        cartPage: visibilityData.checkedPages.cartPage,
                        blogPage: visibilityData.checkedPages.blogPage,
                        productsPage: visibilityData.checkedPages.productsPage,
                        collectionsPage: visibilityData.checkedPages.collectionsPage,
                        customUrl: visibilityData.checkedPages.customUrl,
                        // Chỉ lưu customUrls nếu customUrl được check và visibilityMode là specific
                        customUrls: finalCustomUrlsString,
                    };
                    const response = await api.font.create(createPayload);
                    setFontNamesSelected(fileName);
                    fetchFonts();
                    await handleCreateUpdateFontSetting(keyfont, null, response, visibilityData);
                } catch (error) {
                    console.error('Error uploading/updating file to Gadget:', error);
                    setToastContent('Upload failed. Please try again: ' + error.message);
                    setToastActive(true);
                } finally {
                    setLoading(false);
                }
            };

            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                setToastContent('Error reading file. Please try again.');
                setToastActive(true);
                setLoading(false);
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            setToastContent('Upload failed. Please try again: ' + error.message);
            setToastActive(true);
            setLoading(false);
        }
    };

    const handleDropZoneDrop = useCallback(
        (_dropFiles, acceptedFiles, _rejectedFiles) => {
            const file = acceptedFiles[0];
            const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
            setFile(file);
            setFileName(fileNameWithoutExt);
            setNameError(false); // Thêm dòng này để ẩn lỗi "Name file"
            setIsCleared(false); // Reset cleared state when new file is uploaded

            // Xóa font cũ nếu tồn tại
            if (uploadedFontFaceRef.current) {
                document.fonts.delete(uploadedFontFaceRef.current);
                uploadedFontFaceRef.current = null;
            }

            const fontUrl = URL.createObjectURL(file);
            const fontFace = new FontFace(fileNameWithoutExt, `url(${fontUrl})`);

            fontFace.load()
                .then(() => {
                    document.fonts.add(fontFace);
                    setFontNamesSelected(fileNameWithoutExt);
                    uploadedFontFaceRef.current = fontFace;
                    setFileError(false); // Đã có dòng này để ẩn lỗi "Add file"
                })
                .catch((error) => {
                    console.error('Error loading font:', error);
                    setToastContent('Failed to load font for preview. Please check the file format.');
                    setToastActive(true);
                });
        },
        []
    );

    const handleElementChange = useCallback((element) => {
        setSelectedElements((prevState) => {
            const newState = { ...prevState, [element]: !prevState[element] };
            setAllElementsSelected(Object.values(newState).every((v) => v));
            return newState;
        });
        setElementsError(false); // Thêm dòng này để ẩn lỗi khi có thao tác chọn element
    }, []);

    const handleAllElementsChange = useCallback(() => {
        setAllElementsSelected((prev) => {
            const newState = !prev;
            setSelectedElements({
                h1: newState,
                h2: newState,
                h3: newState,
                h4: newState,
                h5: newState,
                h6: newState,
                body: newState,
                p: newState,
                a: newState,
                li: newState,
            });
            return newState;
        });
        setElementsError(false); // Thêm dòng này để ẩn lỗi khi có thao tác chọn "All" hoặc bỏ chọn "All"
    }, []);

    const validateVisibility = (visibilityMode, checkedPages, textFields) => {
        let isVisibilityError = false;
        let visibilityCustomUrlError = '';
        if (visibilityMode === 'specific') {
            const anyPageChecked = Object.values(checkedPages).some(isChecked => isChecked);
            if (!anyPageChecked) {
                isVisibilityError = true;
            } else if (checkedPages.customUrl) {
                const hasEmptyUrlField = textFields.some(field => field.trim() === '');
                const allEmpty = textFields.every(field => !field.trim());
                if (textFields.length === 0 || allEmpty) {
                    visibilityCustomUrlError = "Please Add at least one URL.";
                } else if (hasEmptyUrlField) {
                    visibilityCustomUrlError = "Please enter the URL.";
                }
            }
        }
        return { isVisibilityError, visibilityCustomUrlError };
    };

    const validateFontSize = (sizeMode, fontSize) => {
        return sizeMode === 'custom' && (!fontSize || String(fontSize).trim() === '');
    };

    const handleSubmit = async (mode) => {
        // mode: 'create' | 'update'
        const isUpdate = mode === 'update';
        setSaveButtonClicked(true);
        if (isUpdate) setLoading(true);

        // --- Step 1: Validation ---
        let hasAnyError = false;

        // File required only on create (upload tab)
        const isFileMissing = !isUpdate && !file;
        setFileError(isFileMissing);
        if (isFileMissing) hasAnyError = true;

        // Name / font selection
        let isNameOrFontMissing = false;
        if (!isUpdate) {
            // Create: upload tab only, fileName required
            const isNameMissing = !fileName;
            setNameError(isNameMissing);
            setFontNameError(false);
            if (isNameMissing) { isNameOrFontMissing = true; hasAnyError = true; }
        } else {
            // Update: check by active tab
            if (selected === 0) {
                if (!fileName) {
                    isNameOrFontMissing = true;
                    setNameError(true);
                    setFontNameError(false);
                    hasAnyError = true;
                } else {
                    setNameError(false);
                    setFontNameError(false);
                }
            } else {
                if (!fontNamesSelected) {
                    isNameOrFontMissing = true;
                    setFontNameError(true);
                    setNameError(false);
                    hasAnyError = true;
                } else {
                    setNameError(false);
                    setFontNameError(false);
                }
            }
        }

        const selectedTagsArr = Object.keys(selectedElements).filter((key) => selectedElements[key]);
        const selectedTagsStr = selectedTagsArr.join(',');
        const areElementsMissing = selectedTagsArr.length === 0;
        setElementsError(areElementsMissing);
        if (areElementsMissing) hasAnyError = true;

        const { isVisibilityError, visibilityCustomUrlError } = validateVisibility(inputs.visibilityMode, checkedPages, textFields);
        if (isVisibilityError) hasAnyError = true;
        setCheckboxError(isVisibilityError);
        setCustomUrlsError(visibilityCustomUrlError);

        const isFontSizeMissing = validateFontSize(sizeMode, fontSize);
        setFontSizeError(isFontSizeMissing);
        if (isFontSizeMissing) hasAnyError = true;

        if (isUpdate) setFileError(false);

        // --- Step 2: Banner for first error ---
        setBannerActive(false);
        if (hasAnyError) {
            if (!isUpdate && isFileMissing) {
                setBannerContent("Drop zone can't be blank.");
            } else if (!isUpdate && isNameOrFontMissing) {
                setBannerContent("The name field can't be blank.");
            } else if (isUpdate && areElementsMissing) {
                setBannerContent("Option checkbox can't be blank.");
            } else if (isUpdate && selected === 0 && isNameOrFontMissing) {
                setBannerContent("The name field can't be blank.");
            } else if (isUpdate && selected === 1 && isNameOrFontMissing) {
                setBannerContent("Option checkbox can't be blank.");
            } else if (!isUpdate && areElementsMissing) {
                setBannerContent("Option checkbox can't be blank.");
            } else if (isVisibilityError) {
                setBannerContent("Option page can't be blank.");
            } else if (visibilityCustomUrlError === "Please Add at least one URL.") {
                setBannerContent("Please add at least one Custom URL handle when 'Custom URL handle' is checked.");
            } else if (visibilityCustomUrlError === "Please enter the URL.") {
                setBannerContent("The URL field can't be blank.");
            } else if (isFontSizeMissing) {
                setBannerContent("Custom font size can't be blank.");
            }
            setBannerActive(true);
            if (isUpdate) setLoading(false);
            return;
        }

        // --- Step 3: Save or Update ---
        const visibilityData = {
            visibilityMode: inputs?.visibilityMode || 'all',
            checkedPages,
            textFields,
        };

        if (!isUpdate) {
            // CREATE
            try {
                await uploadFileToGadget(file, 'upload', visibilityData);
            } catch (error) {
                console.error('Error saving font:', error);
                setBannerContent('Failed to save font: ' + error.message);
                setBannerActive(true);
            }
        } else {
            // UPDATE
            try {
                const shop = await api.shopifyShop.findFirst({ select: { id: true } });
                if (!shop?.id) throw new Error('Could not fetch Shop ID');
                const shopid = String(shop.id);

                const existingFont = await api.font.findOne(fontIdFromUrl, {
                    select: { id: true, name: true, link: true, keyfont: true, checkbox: true },
                });
                const originalFontType = existingFont.keyfont;
                const newFontType = selected === 0 ? 'upload' : 'google';

                let finalCustomUrlsString = null;
                if (inputs?.visibilityMode === 'specific' && checkedPages.customUrl) {
                    const filteredUrls = textFields.filter((url) => url.trim() !== '');
                    if (filteredUrls.length > 0) finalCustomUrlsString = filteredUrls.join(',');
                }
                const visibilityPayload = {
                    visibilityMode: inputs?.visibilityMode || 'all',
                    homePage: checkedPages.homePage,
                    cartPage: checkedPages.cartPage,
                    blogPage: checkedPages.blogPage,
                    productsPage: checkedPages.productsPage,
                    collectionsPage: checkedPages.collectionsPage,
                    customUrl: checkedPages.customUrl,
                    customUrls: finalCustomUrlsString,
                };

                const updateData = {
                    name: selected === 1 ? fontNamesSelected : fileName,
                    checkbox: selectedTagsStr,
                    keyfont: newFontType,
                    size: sizeMode === 'default' ? 'default' : fontSize,
                    ...visibilityPayload,
                };

                let fontLink = existingFont.link;
                if (newFontType === 'google') {
                    fontLink = `https://fonts.googleapis.com/css2?family=${fontNamesSelected.trim().replace(/ /g, '+')}&display=swap`;
                    updateData.link = fontLink;
                } else if (file) {
                    await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onloadend = () => {
                            const base64Data = reader.result.split(',')[1];
                            updateData.link = base64Data;
                            fontLink = base64Data;
                            resolve();
                        };
                        reader.onerror = reject;
                    });
                }

                const updatedFont = await api.font.update(fontIdFromUrl, updateData);

                const fontSettingRecords = await api.fontSetting.findMany({
                    filter: { shopid: { equals: shopid }, namespace: { equals: 'setting' }, key: { equals: 'style' } },
                });
                const settingValue = {
                    id: updatedFont.id,
                    name: updatedFont.name,
                    link: newFontType === 'google' ? fontLink : (file ? updatedFont.link : existingFont.link),
                    selectedElements: selectedTagsStr,
                    keyfont: newFontType,
                    fontSize: sizeMode === 'default' ? 'default' : fontSize,
                    updatedAt: new Date().toISOString(),
                    fontType: newFontType === 'google' ? 'google' : 'custom',
                    fontFamily: newFontType === 'google' ? fontNamesSelected : fileName,
                    ...visibilityPayload,
                };
                if (fontSettingRecords.length === 0) {
                    await api.fontSetting.create({ shopid, namespace: 'setting', key: 'style', value: settingValue });
                } else {
                    await api.fontSetting.update(fontSettingRecords[0].id, { value: settingValue });
                }

                await api.applyFontToTheme();

                if (originalFontType !== newFontType) {
                    setToastContent(`Font type changed to ${newFontType === 'google' ? 'Google Font' : 'Upload Font'}`);
                    setToastActive(true);
                }
                navigate('/', { state: { toastMessage: 'Font updated successfully!' } });
            } catch (error) {
                console.error('Error updating font:', error);
                setBannerContent('Failed to update font: ' + error.message);
                setBannerActive(true);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCreateUpdateFontSetting = async (keyfont, selectedFonts, createdFontData = null, visibilityData = null) => {
        setSaveButtonClicked(true); // Keep this to trigger InlineError visibility
        let hasAnyError = false; // Flag for overall errors
        const shop = await api.shopifyShop.findFirst({ select: { id: true } });
        if (!shop || !shop.id) {
            setToastContent('Could not fetch Shop ID');
            setToastActive(true);
            return;
        }
        const shopid = String(shop.id);

        let selectedFontDetail;
        const selectedTags = Object.keys(selectedElements)
            .filter((key) => selectedElements[key])
            .join(',');

        // Visibility payload setup (needed for validation and creation)
        const currentVisibilityData = visibilityData || {
            visibilityMode: inputs?.visibilityMode || "all",
            checkedPages: checkedPages,
            textFields: textFields
        };
        let finalCustomUrlsString = null;
        if (currentVisibilityData.visibilityMode === "specific" && currentVisibilityData.checkedPages.customUrl) {
            const filteredUrls = currentVisibilityData.textFields.filter(url => url.trim() !== '');
            if (filteredUrls.length > 0) {
                finalCustomUrlsString = filteredUrls.join(',');
            }
        }
        const visibilityPayload = {
            visibilityMode: currentVisibilityData.visibilityMode,
            homePage: currentVisibilityData.checkedPages.homePage,
            cartPage: currentVisibilityData.checkedPages.cartPage,
            blogPage: currentVisibilityData.checkedPages.blogPage,
            productsPage: currentVisibilityData.checkedPages.productsPage,
            collectionsPage: currentVisibilityData.checkedPages.collectionsPage,
            customUrl: currentVisibilityData.checkedPages.customUrl,
            customUrls: finalCustomUrlsString,
        };

        if (keyfont === 'google') {

            // --- Step 1: VALIDATE and SET specific error states based on CURRENT check ---
            const areElementsMissing = !selectedTags;
            setElementsError(areElementsMissing);
            if (areElementsMissing) hasAnyError = true;

            const isFontNameMissing = !fontNamesSelected;
            setFontNameError(isFontNameMissing);
            if (isFontNameMissing) hasAnyError = true;

            // Visibility and Font Size Validation
            let isVisibilityError = false;
            let visibilityCustomUrlErrorMsg = ''; // Use a distinct variable for the message
            if (visibilityPayload.visibilityMode === 'specific') {
                const anyPageChecked = Object.values(currentVisibilityData.checkedPages).some(isChecked => isChecked);
                if (!anyPageChecked) {
                    isVisibilityError = true;
                } else if (currentVisibilityData.checkedPages.customUrl) {
                    // Check if the array is empty OR if all existing fields are empty/whitespace
                    if (textFields.length === 0 || textFields.every(field => field.trim() === '')) {
                        // Error: Need to add at least one URL
                        visibilityCustomUrlErrorMsg = "Please Add at least one URL.";
                    } else {
                        // Check if *any* field is empty/whitespace among non-empty array
                        const hasEmptyUrlField = textFields.some(field => field.trim() === '');
                        if (hasEmptyUrlField) {
                            // Error: Need to fill in the empty field(s)
                            visibilityCustomUrlErrorMsg = "Please enter the URL.";
                        }
                    }
                }
            }
            setCheckboxError(isVisibilityError); // For "select at least one page"
            setCustomUrlsError(visibilityCustomUrlErrorMsg); // Set state with the specific message or ''
            if (isVisibilityError || visibilityCustomUrlErrorMsg) hasAnyError = true; // Update hasAnyError


            const isFontSizeMissing = sizeMode === 'custom' && (!fontSize || String(fontSize).trim() === '');
            setFontSizeError(isFontSizeMissing);
            if (isFontSizeMissing) hasAnyError = true;

            if (hasAnyError) {
                let firstErrorMessage = '';
                // Determine the *first* error sequentially for the banner
                if (areElementsMissing) { firstErrorMessage = "Option checkbox can't be blank."; }
                else if (isFontNameMissing) { firstErrorMessage = "The Font Name can't be blank."; }
                else if (isVisibilityError) { firstErrorMessage = "Option page can't be blank."; }
                // Use the message variable directly for banner content
                else if (visibilityCustomUrlErrorMsg === "Please Add at least one URL.") { firstErrorMessage = "Please add at least one Custom URL handle when 'Custom URL handle' is checked."; }
                else if (visibilityCustomUrlErrorMsg === "Please enter the URL.") { firstErrorMessage = "The URL field can't be blank."; } // Or "Please fill in all added..."
                else if (isFontSizeMissing) { firstErrorMessage = "Custom font size can't be blank."; }

                // Banner activation logic (remains the same)
                if (!bannerActive) {
                    setBannerContent(firstErrorMessage);
                    setBannerActive(true);
                } else {
                    setBannerContent(firstErrorMessage);
                }
                return; // Stop execution
            } else {
                setBannerActive(false);
                setLoading(true);
                const fontDetails = googleFonts.find((font) => font.label === fontNamesSelected);
                if (!fontDetails) {
                    setBannerContent('Please select a valid font.'); // Failsafe
                    setBannerActive(true);
                    setLoading(false);
                    return;
                }

                try {
                    // 1. Create font record
                    const createdGoogleFontRecord = await api.font.create({
                        name: fontDetails.label,
                        link: `https://fonts.googleapis.com/css2?family=${fontDetails.label.replace(/ /g, '+')}&display=swap`,
                        keyfont: 'google',
                        checkbox: selectedTags,
                        size: sizeMode === "default" ? "default" : fontSize,
                        ...visibilityPayload
                    });
                    fetchFonts(); // Optional

                    selectedFontDetail = createdGoogleFontRecord;

                } catch (apiError) {
                    console.error('Error creating Google Font record:', apiError);
                    setBannerContent('Error saving Google Font: ' + apiError.message);
                    setBannerActive(true); // Show API error
                    setLoading(false);
                    return; // Stop if API creation fails
                }
            }

        } else if (keyfont === 'upload') {
            if (!createdFontData) {
                console.warn("handleCreateUpdateFontSetting called for upload without createdFontData.");
                setToastContent('Error processing uploaded font data.');
                setToastActive(true);
                return;
            }
            const areElementsMissing_Upload = !selectedTags; // Re-check elements here
            setElementsError(areElementsMissing_Upload); // Set inline error state for upload context
            if (areElementsMissing_Upload) {
                if (!bannerActive) { // Avoid redundant banner if handleSave already showed one
                    setBannerContent('Option checkbox can\'t be blank.');
                    setBannerActive(true);
                }
                return; // Stop execution
            }
            selectedFontDetail = createdFontData;
            setFontNamesSelected(createdFontData.name);

        } else {
            // Invalid keyfont type
            setLoading(false);
            setBannerContent(`Invalid font key type: ${keyfont}`);
            setBannerActive(true);
            return;
        }

        try {
            const fontSettingRecords = await api.fontSetting.findMany({
                filter: { shopid: { equals: shopid }, namespace: { equals: 'setting' }, key: { equals: 'style' } },
            });

            const finalVisibilityForSelect = {
                visibilityMode: selectedFontDetail.visibilityMode || 'all',
                homePage: selectedFontDetail.homePage ?? false,
                cartPage: selectedFontDetail.cartPage ?? false,
                blogPage: selectedFontDetail.blogPage ?? false,
                productsPage: selectedFontDetail.productsPage ?? false,
                collectionsPage: selectedFontDetail.collectionsPage ?? false,
                customUrl: selectedFontDetail.customUrl ?? false,
                customUrls: selectedFontDetail.customUrls,
            };

            const value = {
                id: selectedFontDetail.id,
                name: selectedFontDetail.name,
                link: selectedFontDetail.link,
                selectedElements: selectedTags,
                keyfont: selectedFontDetail.keyfont,
                fontSize: selectedFontDetail.size,
                updatedAt: new Date().toISOString(),
                ...finalVisibilityForSelect
            };

            if (fontSettingRecords.length === 0) {
                await api.fontSetting.create({ shopid: shopid, namespace: 'setting', key: 'style', value: value });
            } else {
                await api.fontSetting.update(fontSettingRecords[0].id, { value: value });
            }

            // Update local UI state *after* successful save/update
            if (value && value.selectedElements) {
                const tagsArray = value.selectedElements.split(',');
                const initialSelectedElements = {
                    h1: false,
                    h2: false,
                    h3: false,
                    h4: false,
                    h5: false,
                    h6: false,
                    body: false,
                    p: false,
                    a: false,
                    li: false
                };
                tagsArray.forEach((tag) => { if (initialSelectedElements.hasOwnProperty(tag)) { initialSelectedElements[tag] = true; } });
                setSelectedElements(initialSelectedElements);
                setAllElementsSelected(tagsArray.length === Object.keys(initialSelectedElements).length);
            } else {
                setSelectedElements({
                    h1: false,
                    h2: false,
                    h3: false,
                    h4: false,
                    h5: false,
                    h6: false,
                    body: false,
                    p: false,
                    a: false,
                    li: false
                });
                setAllElementsSelected(false);
            }
            setFontDetails(selectedFontDetail);
            handleInputChange("visibilityMode", value.visibilityMode);
            setCheckedPages({
                homePage: value.homePage,
                cartPage: value.cartPage,
                blogPage: value.blogPage,
                productsPage: value.productsPage,
                collectionsPage: value.collectionsPage,
                customUrl: value.customUrl
            });
            const urlsArrayForUI = value.customUrls ? value.customUrls.split(',') : [];
            setTextFields(urlsArrayForUI.length > 0 ? urlsArrayForUI : ['']);

            await api.applyFontToTheme(); // Apply font to theme

            setToastContent('Font applied successfully!');
            setToastActive(true);
            setBannerActive(false); // Ensure banner off on final success

            navigate('/', { state: { toastMessage: 'Font saved successfully!' } });

        } catch (error) {
            console.error('Error creating/updating fontSetting or applying theme:', error);
            setBannerContent('Error applying font: ' + error.message); // Show final step errors
            setBannerActive(true);
        } finally {
            setLoading(false); // Ensure loading stops
        }
    };

    const handleFontChange = (value) => {
        setFontsSelected((prevFonts) => {
            const newFonts = {};
            newFonts[value] = !prevFonts[value];

            const selectedFontArray = Object.keys(newFonts)
                .filter(key => newFonts[key]); // Lọc lấy các font được chọn

            let newFontName = "";
            if (selectedFontArray.length > 0) {
                newFontName = selectedFontArray[0]; // Lấy tên font đầu tiên được chọn (nếu có)
            }

            setFontNamesSelected(newFontName); // Cập nhật fontNamesSelected dựa trên checkbox

            return newFonts;
        });
        setFontNameError(false);
    };

    const handleFontSelect = async () => {
        const selectedFonts = Object.keys(fontsSelected)
            .filter((key) => fontsSelected[key])
            .join(',');
        const selectedFontNames = Object.keys(fontsSelected)
            .filter((key) => fontsSelected[key])
            .join(', ');

        setSelectedFont(selectedFonts);
        setFontNamesSelected(selectedFontNames);
        setShowModal(false);
        if (!selectedFonts) {
            setBannerContent('Please select at least one font.');
            setBannerActive(true);
            return;
        }
    };

    const handleClearDropZone = () => {
        if (uploadedFontFaceRef.current) {
            document.fonts.delete(uploadedFontFaceRef.current);
            uploadedFontFaceRef.current = null;
        }
        setFile(null);
        setFileName('');
        setFontNamesSelected('');
        setIsCleared(true); // Set cleared state to true
    };
    const handleDeleteFont = async (id) => {
        try {
            setDeleting(true);
            await api.font.delete(id);

            // Kiểm tra nếu font bị xóa là font đang active
            const shop = await api.shopifyShop.findFirst({ select: { id: true } });
            if (!shop || !shop.id) {
                throw new Error('Could not fetch Shop ID');
            }
            const shopid = String(shop.id);

            // Lấy thông tin fontSetting hiện tại
            const fontSettingRecords = await api.fontSetting.findMany({
                filter: {
                    shopid: { equals: shopid },
                    namespace: { equals: 'setting' },
                    key: { equals: 'style' },
                },
            });

            // Nếu có bản ghi fontSetting và font đang active trùng với font bị xóa
            if (fontSettingRecords.length > 0 && fontSettingRecords[0].value?.id === id) {
                // Xóa thông tin font khỏi fontSetting
                await api.fontSetting.update(fontSettingRecords[0].id, {
                    value: null
                });

                // Cập nhật theme để xóa font
                await api.applyFontToTheme();
            }

            navigate('/', {
                state: {
                    showDeleteToast: true,
                    toastMessage: 'Font deleted successfully!'
                }
            });

            if (setFontDataFromAppPage) {
                const updatedFontData = await api.font.findMany();
                setFontDataFromAppPage(updatedFontData);
            }
        } catch (error) {
            console.error('Error deleting font:', error);
            setToastContent('Failed to delete font: ' + error);
            setToastActive(true);
        }
    }

    const handleModalOpen = useCallback(() => {
        setFontsSelected({});
        if (selectedFont) {
            const selectedFontArray = selectedFont.split(',');
            const newFontSelected = {};
            googleFonts.forEach((font) => {
                if (selectedFontArray.includes(font.value)) {
                    newFontSelected[font.value] = true;
                }
            });
            setFontsSelected(newFontSelected);
        }
        setShowModal(true);
    }, [selectedFont, googleFonts]);

    const handleModalClose = useCallback(() => {
        setShowModal(false);
    }, []);

    const tabs = [
        {
            id: 'upload-tab',
            content: 'Upload Font',
            panelID: 'upload-tab-content',
        },
        {
            id: 'google-font-tab',
            content: 'Google Fonts',
            panelID: 'google-font-tab-content',
        },
    ];
    const urlParams = new URLSearchParams(location.search);
    const typeParam = urlParams.get("type");

    // handleInputChange: only updates inputs state
    const handleInputChange = useCallback((name, value) => {
        setInputs(prevInputs => ({
            ...prevInputs,
            [name]: value
        }));
    }, [setInputs]); // Chỉ cần dependency setInputs

    // handleChanger: Chỉ cập nhật checkedPages, không set lỗi ngay
    const handleChanger = useCallback((pageKey, isChecked) => {
        setCheckedPages(prev => {
            const newState = { ...prev, [pageKey]: isChecked };
            return newState;
        });
    }, []); // Không cần dependency ở đây

    // handleTextFieldChange: Chỉ cập nhật textFields, không set lỗi ngay
    const handleTextFieldChange = (index, value) => {
        setTextFields(prev => {
            const newFields = [...prev];
            newFields[index] = value;
            return newFields;
        });
    };

    // handleAddField: Chỉ thêm field, không set lỗi ngay
    const handleAddField = () => {
        setTextFields(prev => [...prev, '']);
    };

    // handleRemoveField: Chỉ xóa field, không set lỗi ngay
    const handleRemoveField = (indexToRemove) => {
        setTextFields(prev => {
            const newFields = prev.filter((_, index) => index !== indexToRemove);
            return newFields;
        });
    };

    useEffect(() => {
        fetchFonts();
    }, []);

    useEffect(() => {
        if (typeParam === 'google-font-tab') {
            setSelected(1);
        } else {
            setSelected(0);
        }
    }, [typeParam]);
    useEffect(() => {
        if (fontNamesSelected) {
            const fontDetails = googleFonts.find((font) => font.label === fontNamesSelected);
            if (fontDetails) {
                const style = document.createElement('style');
                style.textContent = `@import url('https://fonts.googleapis.com/css2?family=${fontDetails.label.replace(/ /g, '+')}&display=swap');`;
                document.head.appendChild(style);
                return () => {
                    document.head.removeChild(style); // Cleanup on unmount or font change
                };
            }
        }
    }, [fontNamesSelected, googleFonts]);
    useEffect(() => {
        if (fontDetails?.keyfont === 'upload' && fontDetails?.link) {
            // Lấy định dạng file từ tên font
            const getFontFormat = (fileName) => {
                const extension = fileName.split('.').pop().toLowerCase();
                switch (extension) {
                    case 'woff': return 'woff';
                    case 'woff2': return 'woff2';
                    case 'ttf': return 'truetype';
                    case 'otf': return 'opentype';
                    default: return 'woff2';
                }
            };

            const fontName = fontDetails.name.replace(/\.[^/.]+$/, ""); // Bỏ phần mở rộng
            const format = getFontFormat(fontDetails.name);

            const style = document.createElement('style');
            style.textContent = `
            @font-face {
              font-family: '${fontName}';
              src: url(data:font/${format};base64,${fontDetails.link}) format('${format}');
            }
          `;

            document.head.appendChild(style);
            return () => document.head.removeChild(style);
        }
    }, [fontDetails]);

    // Reset error states on component mount
    useEffect(() => {
        setFileError(false);
        setNameError(false);
        setElementsError(false);
        setFontNameError(false);
        setIsCleared(false); // Reset cleared state on component mount
    }, []);

    useEffect(() => {
        if (bannerActive && bannerRef.current) {
            bannerRef.current.focus(); // Focus vào Banner
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll lên đầu trang
        }
    }, [bannerActive]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const typeParam = params.get('type');
        const nameParam = params.get('name');
        const elementsParam = params.get('elements');

        if (typeParam) {
            if (typeParam === 'google-font-tab') {
                setSelected(1);
            } else {
                setSelected(0);
            }
        }
        if (nameParam) {
            setFileName(nameParam);
            setFontNamesSelected(nameParam);
            setNameError(false);
        }
        if (elementsParam) {
            const elementsArray = elementsParam.split(',');
            //  Đảm bảo dùng functional update và tạo bản sao state (đã sửa ở các lần trước)
            setSelectedElements(prevState => {
                const updatedElements = { ...prevState };
                elementsArray.forEach(tag => {
                    if (updatedElements.hasOwnProperty(tag)) {
                        updatedElements[tag] = true;
                    }
                });
                return updatedElements;
            });
            setElementsError(false);
        }
    }, [location.search]); // Dependency array chỉ cần location.search

    useEditMode({
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
    });

    return (
        <AppProvider>
            <Frame>
                <Page title="Fonts" backAction={{ content: 'Shop Information', onAction: () => navigate('/'), }}>
                    {showMediaCard && (
                        <div style={{ marginBottom: '20px', width: '100%', height: '25%' }}>
                            <MediaCard
                                title="Getting started video guide"
                                primaryAction={{
                                    content: 'Learn more',
                                    onAction: handleLearnMoreClick,
                                }}
                                description={`Let see video guide to learn how to use App`}
                                popoverActions={[{
                                    content: 'Dismiss',
                                    onAction: () => setShowMediaCard(false) // Thêm logic ẩn card
                                }]}
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
                                <Card
                                    title="Video Guide"
                                    sectioned
                                    actions={[{
                                        content: 'Close video',
                                        onAction: () => setShowVideoCard(false)
                                    }]}
                                >
                                    {/* Thêm nút close icon ở góc phải trên */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        zIndex: 1
                                    }}>
                                        <Button
                                            icon={XIcon}
                                            onClick={() => setShowVideoCard(false)}
                                            accessibilityLabel="Dismiss video"
                                            plain
                                        />
                                    </div>

                                    <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                                        <iframe
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                border: 'none',
                                                borderRadius: '8px'
                                            }}
                                            src="https://cdn.shopify.com/videos/c/o/v/80d4e79e2e094db2a21192ca5826543f.mp4"
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                </Card>
                            </div>
                        </BlockStack>
                    )}

                    <Layout>
                        <Layout.Section >
                            <BlockStack style={{ flexDirection: 'column', gap: '15px', marginBottom: '50px' }}>
                                {bannerActive && (
                                    <Banner ref={bannerRef} title="There’s an error with this Fonts setting" onDismiss={() => setBannerActive(false)} tone="critical">
                                        <p>{bannerContent}</p>
                                    </Banner>
                                )}
                                <Card>
                                    <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} fitted>
                                        <BlockStack>
                                            {selected === 0 && (
                                                <UploadFontTab
                                                    file={file}
                                                    fileName={fileName}
                                                    isEditMode={isEditMode}
                                                    isCleared={isCleared}
                                                    saveButtonClicked={saveButtonClicked}
                                                    fileError={fileError}
                                                    nameError={nameError}
                                                    onDrop={handleDropZoneDrop}
                                                    onNameChange={handleNameChange}
                                                    onClear={handleClearDropZone}
                                                />
                                            )}
                                            {selected === 1 && (
                                                <GoogleFontsTab
                                                    fontNamesSelected={fontNamesSelected}
                                                    paginatedFonts={paginatedFonts}
                                                    fontsSelected={fontsSelected}
                                                    fontNameError={fontNameError}
                                                    currentPage={currentPage}
                                                    totalPages={totalPages}
                                                    onFontChange={(value, isText) => {
                                                        if (isText) {
                                                            setFontNamesSelected(value);
                                                        } else {
                                                            handleFontChange(value);
                                                        }
                                                    }}
                                                    onSearchChange={handleSearchChange}
                                                    onPageChange={handlePageChange}
                                                />
                                            )}
                                        </BlockStack>
                                    </Tabs>
                                </Card>

                                <Grid>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                                        <ElementSelector
                                            selectedElements={selectedElements}
                                            allElementsSelected={allElementsSelected}
                                            onElementChange={handleElementChange}
                                            onAllElementsChange={handleAllElementsChange}
                                            saveButtonClicked={saveButtonClicked}
                                            elementsError={elementsError}
                                        />
                                    </Grid.Cell>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                                        <FontPreview fontNamesSelected={fontNamesSelected} />
                                    </Grid.Cell>
                                </Grid>

                                {/* Custom stylesheets */}
                                <FontSizeCard
                                    sizeMode={sizeMode}
                                    fontSize={fontSize}
                                    fontSizeError={fontSizeError}
                                    saveButtonClicked={saveButtonClicked}
                                    onSizeModeChange={(mode) => {
                                        setSizeMode(mode);
                                        if (mode === 'default') {
                                            setFontSize('default');
                                            setFontSizeError(false);
                                        } else if (fontSize === 'default' || !fontSize) {
                                            setFontSize('');
                                        }
                                    }}
                                    onFontSizeChange={(value) => {
                                        const numericValue = parseInt(value, 10);
                                        if (!isNaN(numericValue) && numericValue >= 0) {
                                            setFontSize(value.toString());
                                            setFontSizeError(false);
                                        } else if (value === '') {
                                            setFontSize('');
                                            setFontSizeError(true);
                                        }
                                    }}
                                />

                                {/* Visibility */}
                                <VisibilityCard
                                    visibilityMode={inputs?.visibilityMode}
                                    checkedPages={checkedPages}
                                    textFields={textFields}
                                    saveButtonClicked={saveButtonClicked}
                                    checkboxError={checkboxError}
                                    onVisibilityModeChange={(mode) => handleInputChange('visibilityMode', mode)}
                                    onPageChange={handleChanger}
                                    onTextFieldChange={handleTextFieldChange}
                                    onAddField={handleAddField}
                                    onRemoveField={handleRemoveField}
                                />

                                {/* Actions */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    {isEditMode ? (
                                        <ButtonGroup>
                                            <Button destructive onClick={() => handleDeleteFont(fontToDeleteId)} loading={deleting}>
                                                Delete
                                            </Button>
                                            <Button primary onClick={() => handleSubmit('update')} loading={loading} variant="primary">
                                                Update
                                            </Button>
                                        </ButtonGroup>
                                    ) : (
                                        <ButtonGroup>
                                            <Button onClick={() => navigate('/')}>Back</Button>
                                            <Button primary onClick={selected === 0 ? () => handleSubmit('create') : () => handleCreateUpdateFontSetting('google', fontNamesSelected)} loading={loading} variant="primary">
                                                Save
                                            </Button>
                                        </ButtonGroup>
                                    )}
                                </div>
                            </BlockStack>
                        </Layout.Section>
                    </Layout>
                    {toastActive && (<Toast content={toastContent} onDismiss={() => setToastActive(false)} />)}
                </Page>
            </Frame>
        </AppProvider>
    );
}
