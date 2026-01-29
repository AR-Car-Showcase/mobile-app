import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ARStyles, Colors, CommonStyles } from '../constants';
import ARCustomMarkerWrapper from './scenes/ARCustomMarkerWrapper';
import ARMarkerScene from './scenes/ARMarkerScene';
import ARSurfaceScene from './scenes/ARSurfaceScene';
import VehicleSelector from '../components/VehicleSelector';
import { Trim } from '../api/carApi';

type ARMode = 'surface' | 'marker' | 'custom';

export default function HomeScreen() {
  const params = useLocalSearchParams();
  const [showAR, setShowAR] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ARMode>('surface');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Trim | null>(null);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    if (params.startAR === 'true' && params.vehicle) {
      const vehicle = JSON.parse(params.vehicle as string);
      setSelectedVehicle(vehicle);
      setShowAR(true);
      // Clear params to avoid re-triggering on reload
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
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
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
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </Pressable>
            <Pressable style={ARStyles.controlBtn} onPress={handleRotateRight}>
              <Ionicons name="arrow-forward" size={24} color={Colors.text} />
            </Pressable>
          </View>

          <View style={ARStyles.zoomButtons}>
            <Pressable style={ARStyles.controlBtn} onPress={handleZoomIn}>
              <Ionicons name="add" size={24} color={Colors.text} />
            </Pressable>
            <Pressable style={ARStyles.controlBtn} onPress={handleZoomOut}>
              <Ionicons name="remove" size={24} color={Colors.text} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={CommonStyles.container} showsVerticalScrollIndicator={false}>
      <View style={CommonStyles.header}>
        <Text style={CommonStyles.title}>AR Car Showcase</Text>
        <Text style={CommonStyles.subtitle}>
          Select your preferred AR experience mode
        </Text>
      </View>

      <View style={CommonStyles.card}>
        <Text style={CommonStyles.cardTitle}>Vehicle Selection</Text>
        {selectedVehicle ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: Colors.accentLight, fontSize: 18, fontWeight: 'bold' }}>
              {selectedVehicle.model_make_display} {selectedVehicle.model_name}
            </Text>
            <Text style={{ color: Colors.textSecondary }}>
              {selectedVehicle.model_year} • {selectedVehicle.model_trim || 'Base'}
            </Text>
            <View style={{ marginTop: 8, flexDirection: 'row', flexWrap: 'wrap' }}>
              <View style={styles.specBadge}><Text style={styles.specText}>{selectedVehicle.model_engine_cc}cc</Text></View>
              <View style={styles.specBadge}><Text style={styles.specText}>{selectedVehicle.model_transmission_type}</Text></View>
              <View style={styles.specBadge}><Text style={styles.specText}>{selectedVehicle.model_drive}</Text></View>
            </View>
          </View>
        ) : (
          <Text style={[CommonStyles.cardText, { marginBottom: 16 }]}>
            No vehicle selected. Choose a vehicle to view its specifications and see it in AR.
          </Text>
        )}
        <Pressable
          style={[CommonStyles.actionButton, { marginTop: 0 }]}
          onPress={() => setSelectorVisible(true)}
        >
          <View style={CommonStyles.actionButtonContent}>
            <Ionicons name="car-outline" size={20} color={Colors.text} />
            <Text style={CommonStyles.actionButtonText}>
              {selectedVehicle ? 'Change Vehicle' : 'Select Vehicle'}
            </Text>
          </View>
        </Pressable>
      </View>

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

      <View style={CommonStyles.modeSelector}>
        <Pressable
          style={[
            CommonStyles.modeButton,
            selectedMode === 'surface' && CommonStyles.modeButtonActive,
          ]}
          onPress={() => handleModeSelect('surface')}
        >
          <MaterialIcons
            name="layers"
            size={28}
            color={selectedMode === 'surface' ? Colors.accentLight : Colors.textSecondary}
          />
          <Text
            style={[
              CommonStyles.modeButtonLabel,
              selectedMode === 'surface' && CommonStyles.modeButtonLabelActive,
            ]}
          >
            Surface
          </Text>
        </Pressable>

        <Pressable
          style={[
            CommonStyles.modeButton,
            selectedMode === 'marker' && CommonStyles.modeButtonActive,
          ]}
          onPress={() => handleModeSelect('marker')}
        >
          <Ionicons
            name="image-outline"
            size={28}
            color={selectedMode === 'marker' ? Colors.accentLight : Colors.textSecondary}
          />
          <Text
            style={[
              CommonStyles.modeButtonLabel,
              selectedMode === 'marker' && CommonStyles.modeButtonLabelActive,
            ]}
          >
            Marker
          </Text>
        </Pressable>

        <Pressable
          style={[
            CommonStyles.modeButton,
            selectedMode === 'custom' && CommonStyles.modeButtonActive,
          ]}
          onPress={() => handleModeSelect('custom')}
        >
          <Feather
            name="upload-cloud"
            size={28}
            color={selectedMode === 'custom' ? Colors.accentLight : Colors.textSecondary}
          />
          <Text
            style={[
              CommonStyles.modeButtonLabel,
              selectedMode === 'custom' && CommonStyles.modeButtonLabelActive,
            ]}
          >
            Custom
          </Text>
        </Pressable>
      </View>

      {selectedMode === 'custom' && (
        <>
          <Pressable style={CommonStyles.uploadButton} onPress={pickImage}>
            <MaterialIcons name="add-photo-alternate" size={32} color={Colors.textSecondary} />
            <Text style={CommonStyles.uploadButtonText}>
              {customImage ? 'Change Marker Image' : 'Upload Marker Image'}
            </Text>
          </Pressable>

          {customImage && (
            <View style={CommonStyles.preview}>
              <Image source={{ uri: customImage }} style={CommonStyles.previewImage} />
              <View style={CommonStyles.previewLabel}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={CommonStyles.previewLabelText}>Ready to Track</Text>
              </View>
            </View>
          )}
        </>
      )}

      <Pressable
        style={[
          CommonStyles.actionButton,
          selectedMode === 'custom' && !customImage && CommonStyles.actionButtonDisabled,
        ]}
        onPress={handleStartAR}
        disabled={selectedMode === 'custom' && !customImage}
      >
        <View style={CommonStyles.actionButtonContent}>
          <Ionicons name="rocket" size={20} color={Colors.text} />
          <Text style={CommonStyles.actionButtonText}>Launch AR Experience</Text>
        </View>
      </Pressable>

      <View style={CommonStyles.card}>
        <Text style={CommonStyles.cardTitle}>
          {selectedMode === 'surface' ? 'Surface Detection' : selectedMode === 'marker' ? 'Marker Tracking' : 'Custom Marker'}
        </Text>

        {selectedMode === 'surface' && (
          <>
            <Text style={CommonStyles.cardText}>• Automatic flat surface detection</Text>
            <Text style={CommonStyles.cardText}>• Place car on any horizontal plane</Text>
            <Text style={CommonStyles.cardText}>• Real-time environment mapping</Text>
          </>
        )}

        {selectedMode === 'marker' && (
          <>
            <Text style={CommonStyles.cardText}>• Uses pre-configured marker image</Text>
            <Text style={CommonStyles.cardText}>• Point camera at the provided marker</Text>
            <Text style={CommonStyles.cardText}>• Precise 3D model positioning</Text>
          </>
        )}

        {selectedMode === 'custom' && (
          <>
            <Text style={CommonStyles.cardText}>• Upload your own marker image</Text>
            <Text style={CommonStyles.cardText}>• Use high-contrast, asymmetric images</Text>
            <Text style={CommonStyles.cardText}>• Print or display on screen for tracking</Text>
          </>
        )}
      </View>

      <View style={CommonStyles.card}>
        <Text style={CommonStyles.cardTitle}>Features</Text>
        <Text style={CommonStyles.cardText}>• Realistic 3D car visualization</Text>
        <Text style={CommonStyles.cardText}>• 360° rotation controls</Text>
        <Text style={CommonStyles.cardText}>• Dynamic zoom functionality</Text>
        <Text style={CommonStyles.cardText}>• Multiple AR tracking modes</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  specBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  specText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
