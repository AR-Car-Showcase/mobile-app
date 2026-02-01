import React from 'react';
import ARCustomMarkerScene from './ARCustomMarkerScene';

export default function ARCustomMarkerWrapper(props?: any) {
  const customImageUri = props.sceneNavigator?.viroAppProps?.customImageUri || null;

  return <ARCustomMarkerScene customImageUri={customImageUri} sceneNavigator={props.sceneNavigator} />;
}
