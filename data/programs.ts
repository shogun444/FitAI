/**
 * Program Types and Data
 *
 * Programs are the PRIMARY monetization feature.
 * This file contains type definitions and static program data.
 */

export interface ProgramAdvice {
  id: string;
  title: string;
  content: string;
}

export interface Program {
  id: string;
  name: string;
  tagline: string;
  description: string;
  frequency: string; // e.g., "2 sessions per week"
  duration: string; // e.g., "8 weeks"
  level: "beginner" | "intermediate" | "advanced" | "intermediate - advanced";
  isPaid: boolean;
  advice: ProgramAdvice[];
}

// ============================================
// Training Advice Content
// ============================================

const WEIGHTED_CALISTHENICS_ADVICE: ProgramAdvice[] = [
  {
    id: "frequency",
    title: "Training Frequency",
    content:
      "This program is designed for 2 sessions per week. More sessions do not always mean more strength—recovery drives progress. Your nervous system needs time to adapt to heavy compound movements. Trust the process.",
  },
  {
    id: "fatigue",
    title: "Fatigue Management",
    content:
      "Resist the urge to add extra sessions or volume. Excessive fatigue can stall your progression and increase injury risk. If you feel constantly drained, you may be doing too much outside this program.",
  },
  {
    id: "sleep",
    title: "Sleep & Recovery",
    content:
      "Aim for approximately 8 hours of sleep per night. Sleep is when your body repairs muscle tissue and consolidates strength gains. Consistent sleep is more valuable than any supplement.",
  },
  {
    id: "protein",
    title: "Protein Intake",
    content:
      "Ensure you're meeting your daily protein needs to support muscle repair and growth. Check the Nutrition section to calculate your recommended intake based on your bodyweight and goals.",
  },
];

// ============================================
// Program Data
// ============================================

export const WEIGHTED_CALISTHENICS_5X5: Program = {
  id: "weighted-calisthenics-5x5",
  name: "Weighted Calisthenics Strength",
  tagline: "5×5 Progressive Overload",
  description:
    "A structured strength program built around weighted pull-ups, dips, and squats. Designed for intermediate trainees who want to build real strength with minimal equipment.",
  frequency: "2 sessions per week",
  duration: "8 weeks",
  level: "intermediate - advanced",
  isPaid: true,
  advice: WEIGHTED_CALISTHENICS_ADVICE,
};

// ============================================
// Program Catalog
// ============================================

export const PROGRAMS: Program[] = [WEIGHTED_CALISTHENICS_5X5];

/**
 * Get a program by ID.
 */
export function getProgramById(id: string): Program | undefined {
  return PROGRAMS.find((p) => p.id === id);
}
