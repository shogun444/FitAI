import { Card } from "@/components/ui/Card";
import { useWorkoutStore } from "@/store";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

// ============================================
// Constants
// ============================================

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 3;
const MIN_REST_SECONDS = 30;
const MAX_REST_SECONDS = 600;
const MINUTES_VALUES = Array.from({ length: 11 }, (_, i) => i);
const SECONDS_VALUES = Array.from({ length: 12 }, (_, i) => i * 5);

// ============================================
// Helpers
// ============================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function validateRestTime(minutes: number, seconds: number): number {
  let totalSeconds = minutes * 60 + seconds;
  if (totalSeconds < MIN_REST_SECONDS) totalSeconds = MIN_REST_SECONDS;
  if (totalSeconds > MAX_REST_SECONDS) totalSeconds = MAX_REST_SECONDS;
  return totalSeconds;
}

// ============================================
// TimeWheel Component
// ============================================

interface TimeWheelProps {
  values: number[];
  selectedValue: number;
  onValueChange: (value: number) => void;
}

function TimeWheel({ values, selectedValue, onValueChange }: TimeWheelProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const isUserScrolling = useRef(false);
  const isProgrammaticScroll = useRef(false);
  const initialIndex = values.indexOf(selectedValue);

  useEffect(() => {
    if (!isUserScrolling.current && scrollViewRef.current) {
      const index = values.indexOf(selectedValue);
      if (index >= 0) {
        isProgrammaticScroll.current = true;
        scrollViewRef.current.scrollTo({
          y: index * ITEM_HEIGHT,
          animated: true,
        });
        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 300);
      }
    }
  }, [selectedValue, values]);

  const snapToNearestItem = useCallback(
    (offsetY: number) => {
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, values.length - 1));

      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: clampedIndex * ITEM_HEIGHT,
          animated: true,
        });
      }

      const newValue = values[clampedIndex];
      onValueChange(newValue);
      isUserScrolling.current = false;
    },
    [values, onValueChange],
  );

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isProgrammaticScroll.current) {
        isUserScrolling.current = false;
        return;
      }
      const offsetY = event.nativeEvent.contentOffset.y;
      snapToNearestItem(offsetY);
    },
    [snapToNearestItem],
  );

  const handleScrollBegin = useCallback(() => {
    isUserScrolling.current = true;
  }, []);

  return (
    <View
      className="overflow-hidden"
      style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
    >
      <View
        className="absolute left-0 right-0 border-t-2 border-b-2 border-primary z-10"
        style={{ top: ITEM_HEIGHT, height: ITEM_HEIGHT }}
        pointerEvents="none"
      />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        nestedScrollEnabled={true}
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{
          paddingTop: ITEM_HEIGHT,
          paddingBottom: ITEM_HEIGHT,
        }}
        contentOffset={{
          x: 0,
          y: initialIndex >= 0 ? initialIndex * ITEM_HEIGHT : 0,
        }}
      >
        {values.map((item) => {
          const isSelected = item === selectedValue;
          return (
            <View
              key={item}
              className="items-center justify-center"
              style={{ height: ITEM_HEIGHT }}
            >
              <Text
                className={`font-primaryBold text-3xl ${
                  isSelected
                    ? "text-primary"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              >
                {item.toString().padStart(2, "0")}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ============================================
// RestTimePicker Component
// ============================================

interface RestTimePickerProps {
  duration: number;
  onDurationChange: (seconds: number) => void;
  onTogglePicker?: () => void;
}

function RestTimePicker({
  duration,
  onDurationChange,
  onTogglePicker,
}: RestTimePickerProps) {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const roundedSeconds = Math.round(seconds / 5) * 5;

  const handleMinutesChange = (newMinutes: number) => {
    const effectiveSeconds = newMinutes >= 10 ? 0 : roundedSeconds;
    const validated = validateRestTime(newMinutes, effectiveSeconds);
    onDurationChange(validated);
  };

  const handleSecondsChange = (newSeconds: number) => {
    if (minutes >= 10) return;
    const validated = validateRestTime(minutes, newSeconds);
    onDurationChange(validated);
  };

  return (
    <View className="items-center">
      {/* Large Timer Display */}
      <Pressable onPress={onTogglePicker}>
        <View className="flex-row items-center justify-center mb-4">
          <Text className="font-primaryBold text-6xl text-primary">
            {minutes.toString().padStart(2, "0")}
          </Text>
          <Text className="font-primaryBold text-6xl text-primary mx-2">:</Text>
          <Text className="font-primaryBold text-6xl text-primary">
            {roundedSeconds.toString().padStart(2, "0")}
          </Text>
        </View>
      </Pressable>

      {/* Picker Wheels */}
      <View className="flex-row items-center">
        <View className="items-center">
          <Text className="font-secondaryMedium text-xs text-gray-500 mb-1">
            MIN
          </Text>
          <View className="w-20">
            <TimeWheel
              values={MINUTES_VALUES}
              selectedValue={minutes}
              onValueChange={handleMinutesChange}
            />
          </View>
        </View>

        <Text className="font-primaryBold text-2xl text-gray-400 mx-4">:</Text>

        <View className="items-center">
          <Text className="font-secondaryMedium text-xs text-gray-500 mb-1">
            SEC
          </Text>
          <View className="w-20">
            <TimeWheel
              values={SECONDS_VALUES}
              selectedValue={roundedSeconds}
              onValueChange={handleSecondsChange}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

// ============================================
// Main RestTimer Component
// ============================================

export function RestTimer() {
  const { timer, startTimer, pauseTimer, resetTimer, setRestDuration } =
    useWorkoutStore();
  const [showPicker, setShowPicker] = useState(false);

  return (
    <Card className="mb-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="font-primarySemiBold text-lg text-gray-900 dark:text-white">
          Rest Timer
        </Text>
        {!timer.isRunning && (
          <Pressable
            onPress={() => setShowPicker((prev) => !prev)}
            className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg"
          >
            <Text className="font-secondaryMedium text-sm text-gray-700 dark:text-gray-300">
              {formatTime(timer.duration)} {showPicker ? "▲" : "▼"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Duration Picker */}
      {showPicker && !timer.isRunning && (
        <View className="py-4">
          <RestTimePicker
            duration={timer.duration}
            onDurationChange={setRestDuration}
            onTogglePicker={() => setShowPicker(false)}
          />
        </View>
      )}

      {/* Timer Display */}
      {!showPicker && (
        <Pressable
          onPress={() => !timer.isRunning && setShowPicker(true)}
          disabled={timer.isRunning}
        >
          <Text className="font-primaryBold text-5xl text-primary text-center my-6">
            {formatTime(timer.remaining)}
          </Text>
        </Pressable>
      )}

      {/* Control Buttons */}
      <View className="flex-row gap-3">
        {timer.isRunning ? (
          <Pressable
            onPress={pauseTimer}
            className="flex-1 bg-yellow-500 rounded-xl py-3.5"
          >
            <Text className="font-secondaryMedium text-white text-center">
              Pause
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => {
              setShowPicker(false);
              startTimer(timer.duration);
            }}
            className="flex-1 bg-primary rounded-xl py-3.5"
          >
            <Text className="font-secondaryMedium text-background-dark text-center">
              Start
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={resetTimer}
          className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-xl py-3.5"
        >
          <Text className="font-secondaryMedium text-gray-900 dark:text-white text-center">
            Reset
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}
