import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { Keyboard, TextInput, TextInputProps } from "react-native";

// ============================================
// Types
// ============================================

export interface AutoAdvanceNumberInputRef {
  focus: () => void;
  blur: () => void;
}

export interface AutoAdvanceNumberInputProps extends Omit<
  TextInputProps,
  "value" | "onChangeText" | "onChange" | "ref"
> {
  /** Current value (null = empty, 0 = cleared, >0 = valid) */
  value: number | null;
  /** Called when value changes */
  onChange: (value: number) => void;
  /** Ref to the next input (for auto-advance) */
  nextInputRef?: React.RefObject<AutoAdvanceNumberInputRef | null>;
  /** If true, dismisses keyboard instead of advancing */
  isLast?: boolean;
  /** Maximum allowed value (default: 99) */
  maxValue?: number;
  /** Minimum value to trigger auto-advance (default: 1) */
  minValidValue?: number;
}

/**
 * Reusable number input with auto-advance focus behavior.
 *
 * WHY THIS EXISTS:
 * - Paid workout flows require fast reps entry across multiple sets
 * - Auto-advancing focus reduces taps and speeds up logging
 * - Editability must NEVER be broken (users can always go back)
 *
 * FOCUS LOGIC:
 * - Auto-advance triggers ONLY when:
 *   1. Previous value was empty/null/0
 *   2. New value becomes valid (>= minValidValue)
 * - Clearing input does NOT trigger focus change
 * - User can always tap any input to edit
 *
 * STATE RULES:
 * - Fully controlled (parent owns value)
 * - No internal "completed" flags
 * - No disabling based on index
 * - All state transitions are reversible
 */
export const AutoAdvanceNumberInput = forwardRef<
  AutoAdvanceNumberInputRef,
  AutoAdvanceNumberInputProps
>(function AutoAdvanceNumberInput(
  {
    value,
    onChange,
    nextInputRef,
    isLast = false,
    maxValue = 99,
    minValidValue = 1,
    className,
    ...textInputProps
  },
  ref,
) {
  const inputRef = useRef<TextInput>(null);
  const previousValueRef = useRef<number | null>(value);

  // Expose focus/blur methods to parent
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
  }));

  const handleChangeText = useCallback(
    (text: string) => {
      const previousValue = previousValueRef.current;
      const parsed = parseInt(text, 10);

      let newValue: number;
      if (isNaN(parsed) || text === "") {
        newValue = 0;
      } else {
        // Clamp to valid range
        newValue = Math.min(Math.max(parsed, 0), maxValue);
      }

      // Update previous value tracker
      previousValueRef.current = newValue > 0 ? newValue : null;

      // Notify parent
      onChange(newValue);

      // AUTO-ADVANCE LOGIC:
      // Only advance if:
      // 1. Previous value was empty/null/0 (not editing existing value)
      // 2. New value is valid (>= minValidValue)
      // 3. Not the last input
      const wasEmpty = previousValue === null || previousValue === 0;
      const isNowValid = newValue >= minValidValue;
      const shouldAdvance = wasEmpty && isNowValid && !isLast;

      if (shouldAdvance && nextInputRef?.current) {
        // Small delay to ensure state update completes
        // This is the ONLY acceptable use of setTimeout for focus
        requestAnimationFrame(() => {
          nextInputRef.current?.focus();
        });
      } else if (isLast && isNowValid && wasEmpty) {
        // Dismiss keyboard on last input
        Keyboard.dismiss();
      }
    },
    [onChange, nextInputRef, isLast, maxValue, minValidValue],
  );

  // Display value: show empty string for null/0
  const displayValue = value !== null && value > 0 ? String(value) : "";

  return (
    <TextInput
      ref={inputRef}
      value={displayValue}
      onChangeText={handleChangeText}
      keyboardType="number-pad"
      maxLength={2}
      selectTextOnFocus
      className={className}
      {...textInputProps}
    />
  );
});
