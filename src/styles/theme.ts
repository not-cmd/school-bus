/**
 * GuardianTrack App Theme
 * Color palette and theme definitions for consistent styling across the application
 */

export const colors = {
  // Primary Colors
  primary: {
    main: '#0056B6', // Guardian Blue - App bar, buttons, active tabs, highlights
    light: '#0056B6/10',
    dark: '#004494',
  },
  
  // Secondary Colors
  secondary: {
    main: '#FFC107', // Safety Yellow - Bus-related elements, icons, CTA highlights
    light: '#FFC107/20',
    dark: '#E5AC00',
  },
  
  // Status Colors
  success: {
    main: '#34D399', // Emerald Green - Attendance: present, ETA updates, success badges
    light: '#34D399/20',
    dark: '#10B981',
  },
  
  error: {
    main: '#EF4444', // Soft Red - Attendance: absent, error states, alerts
    light: '#EF4444/20',
    dark: '#DC2626',
  },
  
  // Neutral Colors
  neutral: {
    background: '#F3F4F6', // Soft Gray - Page background
    card: 'rgba(255,255,255,0.85)', // Glass White - Cards with glass-morphism style
  },
  
  // Text Colors
  text: {
    primary: '#111827', // Deep Charcoal - Headings, key labels
    secondary: '#6B7280', // Slate Gray - Subtext, placeholders
  },
  
  // Border Colors
  border: '#E5E7EB', // Light Silver - Card separators, input outlines
};

// Glass morphism styles
export const glass = {
  card: {
    background: colors.neutral.card,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  panel: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(8px)',
    border: `1px solid ${colors.border}`,
  },
};

// Example usage in components:
// 
// // In a component file:
// import { colors, glass } from '@/styles/theme';
// 
// const MyComponent = () => {
//   return (
//     <div style={{ 
//       backgroundColor: colors.primary.main,
//       color: colors.text.primary,
//     }}>
//       Content
//     </div>
//   );
// };
//
// // Or with Tailwind:
// // <div className="bg-[#0056B6] text-[#111827]">Content</div>

export default {
  colors,
  glass,
}; 