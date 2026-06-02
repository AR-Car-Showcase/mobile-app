import { useMemo, MutableRefObject } from 'react';
import { PanResponder, PanResponderInstance, GestureResponderEvent, PanResponderGestureState } from 'react-native';

interface TouchGestureCallbacks {
    onRotationYChange: (rotation: number) => void;
    onRotationXChange: (rotation: number) => void;
    onZoomChange: (zoom: number) => void;
}

interface GestureState {
    _lastDist: number | null;
    _lastDx: number;
    _lastDy: number;
}

const ROTATION_SENSITIVITY = 0.01;
const ZOOM_SENSITIVITY = 0.02;
const MIN_ZOOM = 1.5;
const MAX_ZOOM = 20;
const MAX_ROTATION_X = 1.2;

export function useTouchGestures(
    touchEnabled: boolean,
    rotationYRef: MutableRefObject<number>,
    rotationXRef: MutableRefObject<number>,
    zoomRef: MutableRefObject<number>,
    callbacks: TouchGestureCallbacks
): PanResponderInstance {
    return useMemo(() => {
        const gestureState: GestureState = {
            _lastDist: null,
            _lastDx: 0,
            _lastDy: 0,
        };

        return PanResponder.create({
            onStartShouldSetPanResponder: () => touchEnabled,
            onMoveShouldSetPanResponder: () => touchEnabled,
            onPanResponderMove: (event: GestureResponderEvent, gesture: PanResponderGestureState) => {
                const touches = event.nativeEvent.touches;

                if (touches.length === 2) {
                    const [touch1, touch2] = touches;
                    const currentDistance = Math.sqrt(
                        Math.pow(touch2.pageX - touch1.pageX, 2) +
                        Math.pow(touch2.pageY - touch1.pageY, 2)
                    );

                    if (gestureState._lastDist === null) {
                        gestureState._lastDist = currentDistance;
                        return;
                    }

                    const delta = (gestureState._lastDist - currentDistance) * ZOOM_SENSITIVITY;
                    gestureState._lastDist = currentDistance;
                    zoomRef.current = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomRef.current + delta));
                } else if (touches.length === 1) {
                    const deltaX = (gesture.dx - gestureState._lastDx) * ROTATION_SENSITIVITY;
                    const deltaY = (gesture.dy - gestureState._lastDy) * ROTATION_SENSITIVITY;

                    gestureState._lastDx = gesture.dx;
                    gestureState._lastDy = gesture.dy;

                    rotationYRef.current += deltaX;
                    rotationXRef.current = Math.max(
                        -MAX_ROTATION_X,
                        Math.min(MAX_ROTATION_X, rotationXRef.current + deltaY)
                    );
                }
            },
            onPanResponderRelease: () => {
                gestureState._lastDist = null;
                gestureState._lastDx = 0;
                gestureState._lastDy = 0;

                callbacks.onRotationYChange(rotationYRef.current);
                callbacks.onRotationXChange(rotationXRef.current);
                callbacks.onZoomChange(zoomRef.current);
            },
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [touchEnabled]);
}
