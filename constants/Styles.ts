import { StyleSheet } from 'react-native';
import { Colors as ColorPalette } from './Colors';

const Colors = ColorPalette.dark;

export const CommonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  title: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 8,
    letterSpacing: 0.3,
  },

  modeSelector: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
    gap: 12,
  },

  modeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modeButtonActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.glassBackground,
  },

  modeButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 6,
    letterSpacing: 0.2,
  },

  modeButtonLabelActive: {
    color: Colors.accentLight,
  },

  modeButtonIcon: {
    fontSize: 24,
  },

  actionButton: {
    marginHorizontal: 24,
    marginVertical: 12,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    elevation: 8,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  actionButtonDisabled: {
    opacity: 0.5,
  },

  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  actionButtonText: {
    paddingLeft: 12,
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  uploadButton: {
    marginHorizontal: 24,
    marginVertical: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    borderStyle: 'dashed',
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
  },

  uploadButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },

  preview: {
    marginHorizontal: 24,
    marginVertical: 12,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  previewLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  previewLabelText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },

  card: {
    marginHorizontal: 24,
    marginVertical: 10,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.cardBackground,
  },

  cardTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    letterSpacing: -0.3,
  },

  cardText: {
    color: Colors.textSecondary,
    fontSize: 14.5,
    lineHeight: 22,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
});

export const ARStyles = StyleSheet.create({
  arView: {
    flex: 1,
  },

  overlayControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingHorizontal: 20,
    zIndex: 100,
  },

  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassOverlay,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  backButtonText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 15,
  },

  modeIndicator: {
    position: 'absolute',
    top: 60,
    right: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.glassOverlay,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  modeIndicatorText: {
    color: Colors.accentLight,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  controlButtons: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 100,
  },

  rotationButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  zoomButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.glassOverlay,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

});
