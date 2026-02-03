import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, withTiming, useSharedValue, interpolate, Extrapolate } from 'react-native-reanimated';
import { ARStyles, Colors, CommonStyles } from '../../../constants';
import ARCustomMarkerWrapper from '../../scenes/ARCustomMarkerWrapper';
import ARMarkerScene from '../../scenes/ARMarkerScene';
import ARSurfaceScene from '../../scenes/ARSurfaceScene';
import VehicleSelector from '../../../components/VehicleSelector';
import { Trim } from '../../../api/carApi';
import { useAuth } from '../../context/AuthContext';
import LoginRequiredModal from '../../../components/LoginRequiredModal';
import { useScrollContext } from '../../context/ScrollContext';
import { useTheme } from '../../context/ThemeContext';
import CarCard from '../../../components/CarCard';

type ARMode = 'surface' | 'marker' | 'custom';

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();
  const { colors } = useTheme();
  const { scrollY } = useScrollContext();
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [pendingFeature, setPendingFeature] = useState('');
  const params = useLocalSearchParams();
  const [showAR, setShowAR] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ARMode>('surface');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Trim | null>(null);
  const sceneRef = useRef<any>(null);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const searchBarStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -100],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY }],
      opacity: interpolate(scrollY.value, [0, 50], [1, 0], Extrapolate.CLAMP),
      height: interpolate(scrollY.value, [0, 100], [70, 0], Extrapolate.CLAMP),
    };
  });



  useEffect(() => {
    if (params.startAR === 'true' && params.vehicle) {
      const vehicle = JSON.parse(params.vehicle as string);
      setSelectedVehicle(vehicle);
      setShowAR(true);

      router.setParams({ startAR: undefined, vehicle: undefined });
    }
  }, [params]);

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
        return ARSurfaceScene;
      case 'marker':
        return ARMarkerScene;
      case 'custom':
        return ARCustomMarkerWrapper;
      default:
        return ARSurfaceScene;
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
    <View style={CommonStyles.container}>
      <Animated.View style={[styles.searchContainerWrapper, searchBarStyle, { backgroundColor: colors.background }]}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <Text style={[styles.searchText, { color: colors.textTertiary }]}>Search cars, brands...</Text>
          </View>
          <Pressable style={[styles.filterButton, { backgroundColor: colors.accent }]}>
            <Ionicons name="options-outline" size={20} color={colors.text} />
          </Pressable>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: 80, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
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
            <CarCard
              id="1"
              name="Bugatti Chiron"
              image="https://images.unsplash.com/photo-1597687843302-f8c5c4c474d2?q=80&w=1000&auto=format&fit=crop"
              price="$3,000,000"
              rating={4.9}
              featured
            />
            <CarCard
              id="2"
              name="Lamborghini Aventador"
              image="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1000&auto=format&fit=crop"
              price="$500,000"
              rating={4.8}
              featured
            />
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

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended for You</Text>
        </View>

        <View style={styles.verticalList}>
          {[1, 2, 3].map((i) => (
            <Pressable key={i} style={[styles.recommendedCard, { backgroundColor: colors.surface }]} onPress={() => router.push('/details')}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1000&auto=format&fit=crop' }}
                style={styles.recommendedImage}
              />
              <View style={styles.recommendedContent}>
                <Text style={[styles.recommendedTitle, { color: colors.text }]}>Porsche 911 GT3</Text>
                <Text style={{ color: colors.textSecondary }}>Coupe • 2024</Text>
                <Text style={{ color: colors.accent, fontWeight: 'bold', marginTop: 4 }}>$180,000</Text>
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

        <VehicleSelector
          visible={selectorVisible}
          onClose={() => setSelectorVisible(false)}
          onSelect={(vehicle) => {
            setSelectorVisible(false);
            router.push({
              pathname: '/details',
              params: { vehicle: JSON.stringify(vehicle) }
            });
          }}
        />

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  searchContainerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
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