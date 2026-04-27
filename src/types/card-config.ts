export type CardLayout = 'compact' | 'hero-split' | 'kanban';
export type CardTheme = 'ink' | 'paper' | 'minimal';
export type IllustrationStyle = 'ink-heavy' | 'ink-light' | 'ink-architectural' | 'procedural' | 'none';
export type AnimationStyle = 'parallax' | 'fade' | 'slide' | 'none';

export interface CardConfig {
  layout: CardLayout;
  theme: CardTheme;
  illustrationStyle: IllustrationStyle;
  animationStyle: AnimationStyle;
  showTier: boolean;
  showScore: boolean;
  showDeadline: boolean;
  showOwner: boolean;
  showValue: boolean;
}
