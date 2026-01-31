import { useRestTimer, UseRestTimerReturn } from "@/hooks/useRestTimer";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

// ============================================
// Context
// ============================================

interface RestTimerContextValue {
  /** Rest timer state and actions */
  timer: UseRestTimerReturn;
  /** Whether the full modal is visible */
  isModalVisible: boolean;
  /** Open the rest timer modal */
  openModal: () => void;
  /** Close the rest timer modal */
  closeModal: () => void;
}

const RestTimerContext = createContext<RestTimerContextValue | null>(null);

// ============================================
// Provider
// ============================================

interface RestTimerProviderProps {
  children: ReactNode;
}

/**
 * Global rest timer provider.
 *
 * WHY THIS EXISTS:
 * - Rest timer must be visible across ALL screens
 * - User needs to know remaining time no matter where they navigate
 * - Timer state must persist during navigation
 *
 * USAGE:
 * - Wrap app in <RestTimerProvider>
 * - Use useGlobalRestTimer() in any component
 * - RestTimerIndicator shown globally in _layout.tsx
 */
export function RestTimerProvider({ children }: RestTimerProviderProps) {
  const timer = useRestTimer();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  // Memoize context value to prevent unnecessary re-renders of consumers
  const value = useMemo(
    () => ({ timer, isModalVisible, openModal, closeModal }),
    [timer, isModalVisible],
  );

  return (
    <RestTimerContext.Provider value={value}>
      {children}
    </RestTimerContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

/**
 * Access the global rest timer from any component.
 *
 * Returns:
 * - timer: All timer state and actions
 * - isModalVisible: Whether modal is open
 * - openModal: Function to open modal
 * - closeModal: Function to close modal
 */
export function useGlobalRestTimer(): RestTimerContextValue {
  const context = useContext(RestTimerContext);
  if (!context) {
    throw new Error(
      "useGlobalRestTimer must be used within a RestTimerProvider",
    );
  }
  return context;
}
