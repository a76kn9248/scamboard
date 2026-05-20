export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' | 'LEGENDARY';

export interface ThreatInfo {
  level: ThreatLevel;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  fireEmojis: string;
  animated: boolean;
}

// Updated threat levels with new warm palette colors
export function getThreatLevel(confirmCount: number): ThreatInfo {
  if (confirmCount >= 25) {
    return {
      level: 'LEGENDARY',
      color: '#ff3b6c',
      bgColor: '#2c1418',
      borderColor: '#ff3b6c',
      glowColor: 'rgba(255, 59, 108, 0.4)',
      fireEmojis: '\u{1F480}', // skull
      animated: true,
    };
  }
  if (confirmCount >= 11) {
    return {
      level: 'EXTREME',
      color: '#ff7a3a',
      bgColor: '#2a1810',
      borderColor: '#ff7a3a',
      glowColor: 'rgba(255, 122, 58, 0.3)',
      fireEmojis: '\u{1F525}\u{1F525}\u{1F525}', // 3 fire
      animated: false,
    };
  }
  if (confirmCount >= 6) {
    return {
      level: 'HIGH',
      color: '#ffc547',
      bgColor: '#2a2010',
      borderColor: '#ffc547',
      glowColor: 'rgba(255, 197, 71, 0.3)',
      fireEmojis: '\u{1F525}\u{1F525}', // 2 fire
      animated: false,
    };
  }
  if (confirmCount >= 3) {
    return {
      level: 'MEDIUM',
      color: '#6ce28a',
      bgColor: '#102a1c',
      borderColor: '#6ce28a',
      glowColor: 'rgba(108, 226, 138, 0.3)',
      fireEmojis: '\u{1F525}', // 1 fire
      animated: false,
    };
  }
  return {
    level: 'LOW',
    color: '#5cd0e2',
    bgColor: '#0e2228',
    borderColor: '#5cd0e2',
    glowColor: 'rgba(92, 208, 226, 0.2)',
    fireEmojis: '',
    animated: false,
  };
}

export function getThreatLevelFromConfirms(confirms: number): ThreatLevel {
  return getThreatLevel(confirms).level;
}
