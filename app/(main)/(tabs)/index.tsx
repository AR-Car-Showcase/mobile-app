import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useRef, useState, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle } from 'react-native-reanimated';
import { ARStyles, CommonStyles } from '../../../constants';
import { useAuth, useCarCatalog, useScrollContext, useTheme } from '../../../src/providers';
import LoginRequiredModal from '../../../components/LoginRequiredModal';
import { recommendationsApi } from '../../../api/recommendations';
import { Car } from '../../../types/car';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import ARCustomMarkerWrapper from '../../scenes/ARCustomMarkerWrapper';
import ARMarkerScene from '../../scenes/ARMarkerScene';
import ARSurfaceScene from '../../scenes/ARSurfaceScene';

import { HomeHero } from '../../../src/features/home/components/HomeHero';
import { CatalogStatusBanner } from '../../../src/features/home/components/CatalogStatusBanner';
import { FeaturedCars } from '../../../src/features/home/components/FeaturedCars';
import { PersonalRecommendations } from '../../../src/features/home/components/PersonalRecommendations';

type ARMode = 'surface' | 'marker' | 'custom';

export default function HomeScreen() {
  const { isAuthenticated, user } = useAuth();
  const { colors } = useTheme();
  const { scrollY } = useScrollContext();
  const insets = useSafeAreaInsets();
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [showCachePopup, setShowCachePopup] = useState(false);
  const [pendingFeature, setPendingFeature] = useState('');
  const [showAR, setShowAR] = useState(false);
  const selectedMode = 'surface' as ARMode;
  const customImage: string | null = null;
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

  const getARScene = (): any => {
    switch (selectedMode) {
      case 'surface':
        return ARSurfaceScene;
      case 'marker':
        return ARMarkerScene;
      case 'custom':
        return ARCustomMarkerWrapper;
      default:
        return ARSurfaceScene;
    }
  };

  const handleRotateLeft = () => sceneRef.current?.rotateLeft?.();
  const handleRotateRight = () => sceneRef.current?.rotateRight?.();
  const handleZoomIn = () => {
    sceneRef.current?.zoomIn?.();
  };
  const handleZoomOut = () => {
    sceneRef.current?.zoomOut?.();
  };

  if (showAR) {
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
      <Animated.View style={[styles.header, { backgroundColor: colors.background, paddingTop: insets.top + 10 }, headerStyle]}>
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

      <CatalogStatusBanner 
        showCachePopup={showCachePopup}
        setShowCachePopup={setShowCachePopup}
        refreshing={refreshing}
        meta={meta}
        colors={colors}
      />

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 100 }}
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
        <HomeHero colors={colors} />

        <FeaturedCars featuredCars={featuredCars} colors={colors} />

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

        <PersonalRecommendations recommendedCars={recommendedCars} colors={colors} />

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
    paddingBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
