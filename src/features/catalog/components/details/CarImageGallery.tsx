import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { Image as ExpoImage } from 'expo-image';
import { radius, spacing } from '../../../../theme';

const { width } = Dimensions.get('window');

const MemoizedThumbnail = memo(({ item, isSelected, onPress, colors, index }: { item: string, isSelected: boolean, onPress: () => void, colors: any, index: number }) => {
    console.log('[Thumbnail] Rendering index:', index, 'URI:', item.substring(0, 50), 'Selected:', isSelected);
    
    return (
        <Pressable
            onPress={() => {
                console.log('[Thumbnail] Pressed index:', index);
                onPress();
            }}
            style={[styles.thumbnailWrapper, isSelected && { borderColor: colors.accent, borderWidth: 2 }]}
        >
            <ExpoImage
                source={{ uri: item }}
                style={styles.thumbnail}
                contentFit="cover"
                transition={0}
                cachePolicy="memory-disk"
                recyclingKey={item}
                priority="high"
                onLoad={() => console.log('[Thumbnail] Image LOADED:', index)}
                onError={(error) => console.log('[Thumbnail] Image ERROR:', index, error)}
                onDisplay={() => console.log('[Thumbnail] Image DISPLAYED:', index)}
            />
        </Pressable>
    );
});
MemoizedThumbnail.displayName = 'MemoizedThumbnail';

interface CarImageGalleryProps {
    images: {
        exterior: string[];
        interior: string[];
    };
    colors: any;
    selectedImageIndex: number;
    setSelectedImageIndex: (index: number) => void;
    selectedImageType: 'exterior' | 'interior';
    setSelectedImageType: (type: 'exterior' | 'interior') => void;
    mainImageRef: React.RefObject<any>;
    thumbnailRef: React.RefObject<any>;
}

export function CarImageGallery({
    images,
    colors,
    selectedImageIndex,
    setSelectedImageIndex,
    selectedImageType,
    setSelectedImageType,
    mainImageRef,
    thumbnailRef
}: CarImageGalleryProps) {
    const currentImages = selectedImageType === 'exterior' ? images.exterior : images.interior;
    
    console.log('[Gallery] Rendering with', currentImages.length, 'images, selected:', selectedImageIndex, 'type:', selectedImageType);

    return (
        <>
            <View style={{ height: 250 }}>
                <Animated.FlatList
                    ref={mainImageRef}
                    data={currentImages}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(ev) => {
                        const newIndex = Math.round(ev.nativeEvent.contentOffset.x / width);
                        console.log('[Gallery] Main scroll ended. Offset:', ev.nativeEvent.contentOffset.x, 'New index:', newIndex, 'Current:', selectedImageIndex);
                        if (newIndex !== selectedImageIndex && newIndex >= 0 && newIndex < currentImages.length) {
                            console.log('[Gallery] Updating selected index from', selectedImageIndex, 'to', newIndex);
                            setSelectedImageIndex(newIndex);
                            const thumbnailWidth = 80 + 8;
                            thumbnailRef.current?.scrollToOffset({
                                offset: newIndex * thumbnailWidth - (width / 2) + (thumbnailWidth / 2),
                                animated: true
                            });
                        }
                    }}
                    renderItem={({ item, index }) => {
                        console.log('[Gallery] Rendering main image index:', index, 'URI:', item.substring(0, 50));
                        return (
                            <ExpoImage
                                source={{ uri: item }}
                                style={{ width: width, height: 250 }}
                                contentFit="cover"
                                transition={0}
                                cachePolicy="memory-disk"
                                priority="normal"
                                onLoad={() => console.log('[Gallery] Main image LOADED:', index)}
                                onError={(error) => console.log('[Gallery] Main image ERROR:', index, error)}
                            />
                        );
                    }}
                    removeClippedSubviews={false}
                    getItemLayout={(_, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                    initialNumToRender={3}
                    maxToRenderPerBatch={3}
                    windowSize={5}
                />
            </View>

            <View style={styles.imageTypeSelector}>
                <Pressable
                    style={[styles.imageTypeBtn, selectedImageType === 'exterior' && { backgroundColor: colors.accent }]}
                    onPress={() => {
                        setSelectedImageType('exterior');
                        setSelectedImageIndex(0);
                        mainImageRef.current?.scrollToOffset({ offset: 0, animated: false });
                    }}
                >
                    <Text style={[styles.imageTypeBtnText, { color: selectedImageType === 'exterior' ? '#FFF' : colors.textSecondary }]}>
                        Exterior ({images.exterior.length})
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.imageTypeBtn, selectedImageType === 'interior' && { backgroundColor: colors.accent }]}
                    onPress={() => {
                        setSelectedImageType('interior');
                        setSelectedImageIndex(0);
                        mainImageRef.current?.scrollToOffset({ offset: 0, animated: false });
                    }}
                >
                    <Text style={[styles.imageTypeBtnText, { color: selectedImageType === 'interior' ? '#FFF' : colors.textSecondary }]}>
                        Interior ({images.interior.length})
                    </Text>
                </Pressable>
            </View>

            <View style={styles.thumbnailsContainer}>
                <Animated.FlatList
                    ref={thumbnailRef}
                    data={currentImages}
                    keyExtractor={(item, index) => `thumb-${item}-${index}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.xs }}
                    renderItem={({ item, index }) => (
                        <MemoizedThumbnail
                            key={`${item}-${index}`}
                            item={item}
                            index={index}
                            isSelected={index === selectedImageIndex}
                            onPress={() => {
                                console.log('[Gallery] Thumbnail clicked, switching from', selectedImageIndex, 'to', index);
                                setSelectedImageIndex(index);
                                mainImageRef.current?.scrollToIndex({ index, animated: true });
                            }}
                            colors={colors}
                        />
                    )}
                    initialNumToRender={5}
                    maxToRenderPerBatch={3}
                    windowSize={7}
                    removeClippedSubviews={false}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    imageTypeSelector: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: spacing.md,
        gap: spacing.md,
    },
    imageTypeBtn: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.lg,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    imageTypeBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    thumbnailsContainer: {
        marginBottom: spacing.md,
    },
    thumbnailWrapper: {
        borderRadius: radius.sm,
        overflow: 'hidden',
    },
    thumbnail: {
        width: 80,
        height: 60,
        resizeMode: 'cover',
    },
});
