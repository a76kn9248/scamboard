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

export function getThreatLevel(confirmCount: number): ThreatInfo {
  if (confirmCount >= 25) {
    return {
      level: 'LEGENDARY',
      color: '#ff1744',
      bgColor: 'rgba(255, 23, 68, 0.2)',
      borderColor: '#ff1744',
      glowColor: 'rgba(255, 23, 68, 0.5)',
      fireEmojis: '\u{1F480}',
      animated: true,
    };
  }
  if (confirmCount >= 11) {
    return {
      level: 'EXTREME',
      color: '#ff1744',
      bgColor: 'rgba(255, 23, 68, 0.15)',
      borderColor: '#ff1744',
      glowColor: 'rgba(255, 23, 68, 0.3)',
      fireEmojis: '\u{1F525}\u{1F525}\u{1F525}',
      animated: false,
    };
  }
  if (confirmCount >= 6) {
    return {
      level: 'HIGH',
      color: '#ff9100',
      bgColor: 'rgba(255, 145, 0, 0.15)',
      borderColor: '#ff9100',
      glowColor: 'rgba(255, 145, 0, 0.3)',
      fireEmojis: '\u{1F525}\u{1F525}',
      animated: false,
    };
  }
  if (confirmCount >= 3) {
    return {
      level: 'MEDIUM',
      color: '#ffd600',
      bgColor: 'rgba(255, 214, 0, 0.15)',
      borderColor: '#ffd600',
      glowColor: 'rgba(255, 214, 0, 0.3)',
      fireEmojis: '\u{1F525}',
      animated: false,
    };
  }
  return {
    level: 'LOW',
    color: '#69f0ae',
    bgColor: 'rgba(105, 240, 174, 0.1)',
    borderColor: '#69f0ae',
    glowColor: 'rgba(105, 240, 174, 0.2)',
    fireEmojis: '',
    animated: false,
  };
}

export function getThreatLevelFromConfirms(confirms: number): ThreatLevel {
  return getThreatLevel(confirms).level;
}
