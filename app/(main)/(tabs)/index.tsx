import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useRef, useState, useEffect, useMemo } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, withTiming, useSharedValue, interpolate, Extrapolate } from 'react-native-reanimated';
import { ARStyles, Colors, CommonStyles } from '../../../constants';
import { useAuth } from '../../context/AuthContext';
import LoginRequiredModal from '../../../components/LoginRequiredModal';
import { useScrollContext } from '../../context/ScrollContext';
import { useTheme } from '../../context/ThemeContext';
import { useCarCatalog } from '../../context/CarCatalogContext';
import CarCard from '../../../components/CarCard';
import { recommendationsApi } from '../../../api/recommendations';
import { Car } from '../../../types/car';
import { useSmartScroll } from '../../hooks/useSmartScroll';

type ARMode = 'surface' | 'marker' | 'custom';

export default function HomeScreen() {
  const { isAuthenticated, user } = useAuth();
  const { colors } = useTheme();
  const { scrollY } = useScrollContext();
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [showCachePopup, setShowCachePopup] = useState(false);
  const [pendingFeature, setPendingFeature] = useState('');
  const params = useLocalSearchParams();
  const [showAR, setShowAR] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ARMode>('surface');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const sceneRef = useRef<any>(null);
  const [recommendedCars, setRecommendedCars] = useState<Car[]>([]);
  const { cars: allCars, loading: catalogLoading, refreshing, meta, refreshCatalog } = useCarCatalog();
  const featuredCars = useMemo(
    () => [...allCars].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 5),
    [allCars]
  );

  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: 0 }],
      opacity: 1,
    };
  });
  const onRefresh = async () => {
    try {
      await refreshCatalog();
    } catch (e) {
      console.error('[Home] Refresh failed', e);
    }
  };

  useEffect(() => {
    if (catalogLoading || allCars.length === 0) {
      return;
    }

    const loadRecommendations = async () => {
      if (
        isAuthenticated &&
        user &&
        (
          (user.favBrands && user.favBrands.length > 0) ||
          (user.preferredBodyTypes && user.preferredBodyTypes.length > 0) ||
          (user.preferredFuelTypes && user.preferredFuelTypes.length > 0) ||
          (user.preferredTransmissions && user.preferredTransmissions.length > 0) ||
          (user.maxBudget && user.maxBudget > 0)
        )
      ) {
        try {
          const recs = await recommendationsApi.getUserRecommendations();
          if (recs && recs.length > 0) {
            setRecommendedCars(recs);
            return;
          }
        } catch (e) {
          console.error('[Home] Recommendation fetch failed, using fallback', e);
        }
      }

      setRecommendedCars(allCars.slice(0, 5).sort(() => 0.5 - Math.random()));
    };

    void loadRecommendations();
  }, [allCars, catalogLoading, isAuthenticated, user]);

  const handleModeSelect = (mode: ARMode) => {
    setSelectedMode(mode);
    if (mode !== 'custom') {
      setCustomImage(null);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera roll access is needed to upload marker images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setCustomImage(result.assets[0].uri);
      setSelectedMode('custom');
    }
  };

  const handleStartAR = () => {
    if (selectedMode === 'custom' && !customImage) {
      Alert.alert('No Image Selected', 'Please upload a marker image first.');
      return;
    }
    setShowAR(true);
  };

  const getARScene = (): any => {
    switch (selectedMode) {
      case 'surface':
        return require('../../scenes/ARSurfaceScene').default;
      case 'marker':
        return require('../../scenes/ARMarkerScene').default;
      case 'custom':
        return require('../../scenes/ARCustomMarkerWrapper').default;
      default:
        return require('../../scenes/ARSurfaceScene').default;
    }
  };

  const handleRotateLeft = () => {
    if (sceneRef.current?.rotateLeft) {
      sceneRef.current.rotateLeft();
    }
  };

  const handleRotateRight = () => {
    if (sceneRef.current?.rotateRight) {
      sceneRef.current.rotateRight();
    }
  };

  const handleZoomIn = () => {
    if (sceneRef.current?.zoomIn) {
      sceneRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (sceneRef.current?.zoomOut) {
      sceneRef.current.zoomOut();
    }
  };

  if (showAR) {
    const { ViroARSceneNavigator } = require('@reactvision/react-viro');

    return (
      <View style={CommonStyles.container}>
        <ViroARSceneNavigator
          autofocus={true}
          initialScene={{
            scene: getARScene(),
          }}
          viroAppProps={{ sceneRef, customImageUri: customImage }}
          style={ARStyles.arView}
        />

        <View style={ARStyles.overlayControls}>
          <Pressable
            style={ARStyles.backButton}
            onPress={() => setShowAR(false)}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
            <Text style={ARStyles.backButtonText}>Back</Text>
          </Pressable>

          <View style={ARStyles.modeIndicator}>
            <Text style={ARStyles.modeIndicatorText}>
              {selectedMode === 'surface' ? 'Surface' : selectedMode === 'marker' ? 'Marker' : 'Custom'}
            </Text>
          </View>
        </View>

        <View style={ARStyles.controlButtons}>
          <View style={ARStyles.rotationButtons}>
            <Pressable style={ARStyles.controlBtn} onPress={handleRotateLeft}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <Pressable style={ARStyles.controlBtn} onPress={handleRotateRight}>
              <Ionicons name="arrow-forward" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={ARStyles.zoomButtons}>
            <Pressable style={ARStyles.controlBtn} onPress={handleZoomIn}>
              <Ionicons name="add" size={24} color={colors.text} />
            </Pressable>
            <Pressable style={ARStyles.controlBtn} onPress={handleZoomOut}>
              <Ionicons name="remove" size={24} color={colors.text} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[CommonStyles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.header, { backgroundColor: colors.background }, headerStyle]}>
        <View style={styles.headerContent}>
          <Pressable
            style={[styles.menuButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.openDrawer()}
          >
            <Ionicons name="menu" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.homeTitle, { color: colors.text }]}>Home</Text>
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => setShowCachePopup(!showCachePopup)} style={{ position: 'relative', padding: 4 }}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {refreshing && <View style={{ position: 'absolute', top: 4, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent }} />}
          </Pressable>
        </View>
      </Animated.View>

      {showCachePopup && (
        <View style={[styles.cachePopup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold', color: colors.text }}>Data Status</Text>
            <Pressable onPress={() => setShowCachePopup(false)}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name={refreshing ? "sync" : "checkmark-circle-outline"} size={16} color={colors.accent} />
            <Text style={{ color: colors.textSecondary, fontSize: 13, flex: 1 }}>
              {refreshing
                ? 'Refreshing from server…'
                : meta?.source === 'cache'
                  ? meta.backgroundRefreshStarted
                    ? 'Loaded from cache. Refreshing in background.'
                    : 'Loaded from cache.'
                  : 'Loaded fresh from server.'}
            </Text>
          </View>
        </View>
      )}

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.heroSection}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop' }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Experience the Future</Text>
            <Text style={styles.heroSubtitle}>Visualize your dream car in your driveway today.</Text>
            <Pressable
              style={[styles.heroButton, { backgroundColor: colors.accent }]}
              onPress={() => router.push('/explore')}
            >
              <Text style={styles.heroButtonText}>Explore Cars</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Cars</Text>
          <Pressable onPress={() => router.push('/explore')}>
            <Text style={{ color: colors.accent }}>View All</Text>
          </Pressable>
        </View>

        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {featuredCars.map((car, index) => (
              <CarCard
                key={`${car.brand}-${car.model}-${index}`}
                id={`${car.brand}-${car.model}`}
                name={`${car.brand.charAt(0).toUpperCase() + car.brand.slice(1)} ${car.model.charAt(0).toUpperCase() + car.model.slice(1)}`}
                image={car.images.exterior[0]}
                price={car.priceRange}
                rating={Number(car.rating) || 4.5}
                onPress={() => router.push({
                  pathname: '/details',
                  params: { id: car.id }
                })}
                modelPath={car.model3D}
                featured
              />
            ))}
          </ScrollView>
        </View>

        <Pressable
          style={[styles.promoCard, { backgroundColor: colors.surface }]}
          onPress={() => {
            if (isAuthenticated) {
              router.push('/hybrid');
            } else {
              setPendingFeature('3D Customization');
              setLoginModalVisible(true);
            }
          }}
        >
          <MaterialIcons name="3d-rotation" size={40} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.promoTitle, { color: colors.text }]}>3D Studio & AR</Text>
            <Text style={{ color: colors.textSecondary }}>Customize every detail and view in your space.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          style={[styles.promoCard, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/compare')}
        >
          <MaterialIcons name="compare-arrows" size={40} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.promoTitle, { color: colors.text }]}>Compare Cars</Text>
            <Text style={{ color: colors.textSecondary }}>Side-by-side comparison of specs and features.</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended for You</Text>
        </View>

        <View style={styles.verticalList}>
          {recommendedCars.map((car, index) => (
            <Pressable
              key={`${car.brand}-${car.model}-rec-${index}`}
              style={[styles.recommendedCard, { backgroundColor: colors.surface }]}
              onPress={() => {
                recommendationsApi.trackInteraction(car.id, 'click');
                router.push({
                  pathname: '/details',
                  params: { id: car.id }
                });
              }}
            >
              <Image
                source={{ uri: car.images.exterior[0] }}
                style={styles.recommendedImage}
              />
              <View style={styles.recommendedContent}>
                <Text style={[styles.recommendedTitle, { color: colors.text }]}>
                  {car.brand.charAt(0).toUpperCase() + car.brand.slice(1)} {car.model.charAt(0).toUpperCase() + car.model.slice(1)}
                </Text>
                <Text style={{ color: colors.textSecondary }}>{car.bodyType} • {car.fuelType}</Text>
                <Text style={{ color: colors.accent, fontWeight: 'bold', marginTop: 4 }}>{car.priceRange}</Text>
              </View>
              <View style={[styles.actionIcon, { backgroundColor: colors.surfaceHighlight }]}>
                <Ionicons name="arrow-forward" size={20} color={colors.text} />
              </View>
            </Pressable>
          ))}
        </View>

        <LoginRequiredModal
          visible={loginModalVisible}
          onClose={() => setLoginModalVisible(false)}
          featureName={pendingFeature}
        />
        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  header: {
    zIndex: 100,
    paddingTop: 50,
    paddingBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cachePopup: {
    position: 'absolute',
    top: 90,
    right: 16,
    width: 250,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 200,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  homeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchText: {
    fontSize: 14,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  specText: {
    fontSize: 12,
  },
  heroSection: {
    height: 350,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 24,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#E0E0E0',
    fontSize: 16,
    marginBottom: 24,
  },
  heroButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 24,
  },
  featuredCard: {
    width: 200,
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
  },
  featuredImage: {
    width: '100%',
    height: 120,
  },
  featuredContent: {
    padding: 12,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  verticalList: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 24,
  },
  recommendedCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  recommendedImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  recommendedContent: {
    flex: 1,
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionIcon: {
    padding: 8,
    borderRadius: 20,
  },
  promoCard: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 16,
    marginBottom: 24,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
