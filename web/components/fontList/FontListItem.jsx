import React from 'react';
import {
    ResourceList,
    Text,
    Badge,
    Button,
    Popover,
    ActionList,
    Icon,
    Spinner,
} from '@shopify/polaris';
import {
    EditIcon,
    DeleteIcon,
    CheckIcon,
    MenuIcon,
    TextFontListIcon,
} from '@shopify/polaris-icons';

export default function FontListItem({
    item,
    currentAppliedFont,
    applyingFontId,
    activePopover,
    onTogglePopover,
    onClosePopover,
    onApplyFont,
    onEditFont,
    onDeleteFont,
}) {
    const { id, name, keyfont, checkbox, size } = item;
    const isActive = currentAppliedFont === id;
    const media = <Icon source={TextFontListIcon} tone="base" />;

    return (
        <ResourceList.Item
            id={id}
            accessibilityLabel={`View details for ${name}`}
            persistActions
            media={media}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginRight: '20px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <Text variant="headingMd" as="h6">Name font: </Text>
                        <Text as="p" fontWeight="medium">{name}</Text>
                        {isActive && (
                            <Badge tone="success" progress="complete">Active</Badge>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <Text as="p" fontWeight="bold">Type:</Text>
                        <Text as="p" fontWeight="medium">{keyfont}</Text>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <Text as="p" fontWeight="bold">Size:</Text>
                        <Text as="p" fontWeight="medium">{size}</Text>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <Text as="p" fontWeight="bold">Elements:</Text>
                        <Text as="p" fontWeight="medium">{checkbox}</Text>
                    </div>
                </div>
                <Popover
                    active={activePopover === id}
                    activator={<Button onClick={() => onTogglePopover(id)} icon={MenuIcon} />}
                    onClose={onClosePopover}
                >
                    <ActionList
                        items={[
                            ...(!isActive ? [{
                                content: applyingFontId === id ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Spinner size="small" />
                                        Applying...
                                    </div>
                                ) : 'Active',
                                icon: applyingFontId === id ? null : CheckIcon,
                                onAction: () => onApplyFont(item),
                                disabled: applyingFontId !== null,
                            }] : []),
                            {
                                content: 'Update',
                                icon: EditIcon,
                                onAction: () => onEditFont(item),
                                disabled: applyingFontId !== null,
                            },
                            ...(!isActive ? [{
                                content: 'Delete',
                                icon: DeleteIcon,
                                onAction: () => onDeleteFont(id),
                                disabled: applyingFontId !== null,
                            }] : []),
                        ]}
                    />
                </Popover>
            </div>
        </ResourceList.Item>
    );
}
