import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';

const SQUARE_SIZE = 60;
const TARGET_SIZE = 100;
const { width, height } = Dimensions.get('window');

export default function App() {
  const [score, setScore] = useState(0);
  // Use one source of truth for the square’s (x, y, color)
  // We'll keep the color in separate state, but let the position be purely animated.
  const [color, setColor] = useState('red');

  // This Animated.ValueXY will *always* hold the square’s true position on screen.
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Create a new colored square at a random position along the edge
  const spawnNewSquare = () => {
    const side = Math.floor(Math.random() * 4);
    let startX = 0, startY = 0;

    switch (side) {
      case 0: // top
        startX = Math.random() * (width - SQUARE_SIZE);
        startY = 0;
        break;
      case 1: // right
        startX = width - SQUARE_SIZE;
        startY = Math.random() * (height - SQUARE_SIZE);
        break;
      case 2: // bottom
        startX = Math.random() * (width - SQUARE_SIZE);
        startY = height - SQUARE_SIZE;
        break;
      case 3: // left
        startX = 0;
        startY = Math.random() * (height - SQUARE_SIZE);
        break;
    }

    // Random color
    const colors = ['red', 'blue', 'green', 'purple', 'orange'];
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    setColor(newColor);

    // **Set the Animated.ValueXY** to this new position
    pan.setValue({ x: startX, y: startY });
  };

  // Initialize the first square
  useEffect(() => {
    spawnNewSquare();
  }, []);

  // Check if the colored square is over the target
  const isOverTarget = () => {
    // We can read the actual numeric values from the animated object.
    const squareX = pan.x.__getValue();
    const squareY = pan.y.__getValue();

    const targetX = width / 2 - TARGET_SIZE / 2;
    const targetY = height / 2 - TARGET_SIZE / 2;

    return (
      squareX < targetX + TARGET_SIZE &&
      squareX + SQUARE_SIZE > targetX &&
      squareY < targetY + TARGET_SIZE &&
      squareY + SQUARE_SIZE > targetY
    );
  };

  // Set up the PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Capture any existing offset so the square keeps its place after drags
        pan.setOffset({
          x: pan.x.__getValue(),
          y: pan.y.__getValue()
        });
        // Reset the delta to zero
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        // Merge offset + value
        pan.flattenOffset();

        if (isOverTarget()) {
          setScore(prev => prev + 1);
          spawnNewSquare();
        }
      }
    })
  ).current;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gameContainer}>
        <Text style={styles.scoreText}>Score: {score}</Text>

        {/* Target Square (Gray) */}
        <View style={styles.targetSquare} />

        {/* Draggable Square (Colored) */}
        <Animated.View
          style={[
            styles.draggableSquare,
            {
              backgroundColor: color,
              transform: [
                { translateX: pan.x },
                { translateY: pan.y }
              ]
            }
          ]}
          {...panResponder.panHandlers}
        />

        <Text style={styles.instructions}>
          Drag the colored square to the gray target
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gameContainer: {
    flex: 1,
    position: 'relative',
  },
  targetSquare: {
    position: 'absolute',
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    backgroundColor: 'gray',
    left: width / 2 - TARGET_SIZE / 2,
    top: height / 2 - TARGET_SIZE / 2,
  },
  draggableSquare: {
    position: 'absolute',
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
  },
  scoreText: {
    position: 'absolute',
    top: 40,
    left: 20,
    fontSize: 24,
    fontWeight: 'bold',
  },
  instructions: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
    userSelect: 'none'
  },
});