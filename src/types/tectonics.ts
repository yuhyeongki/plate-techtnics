export type BoundaryType = 
  | 'divergent' 
  | 'convergent_subduction' 
  | 'convergent_collision' 
  | 'transform';

export interface PlateInfo {
  name: string;
  type: 'oceanic' | 'continental';
  defaultDensity: number; // in g/cm³
  thicknessKm: number;
  composition: string;
}

export interface BoundaryDetail {
  id: BoundaryType;
  title: string;
  koreanName: string;
  category: string;
  summary: string;
  description: string;
  relativeMotion: '멀어짐 (발산)' | '모여듦 (수렴·섭입)' | '모여듦 (수렴·충돌)' | '어긋남 (보존)';
  plateLeft: PlateInfo;
  plateRight: PlateInfo;
  plateFate: '새로운 판 생성' | '해양판 소멸 (맨틀로 섭입)' | '판 소멸 없음 (융기·변형)' | '판의 생성도 소멸도 없음';
  topography: string[]; // 대표 지형 (해령, 열곡대, 해구 등)
  earthquakes: {
    depth: string;
    description: string;
    focalTypes: ('shallow' | 'intermediate' | 'deep')[];
  };
  volcanism: {
    exists: boolean;
    description: string;
  };
  realWorldExamples: string[];
  keyPoints: string[];
}

export interface HotspotLocation {
  id: string;
  name: string;
  boundaryType: BoundaryType;
  lat: number;
  lng: number;
  plates: string;
  features: string;
  description: string;
}

export interface EarthquakeDataPoint {
  lat: number;
  lng: number;
  depthKm: number; // 0-70: shallow, 70-300: intermediate, >300: deep
  magnitude: number;
  region: string;
}

export interface VolcanoDataPoint {
  lat: number;
  lng: number;
  name: string;
  elevationM: number;
  type: string;
}

export interface SimState {
  boundaryType: BoundaryType;
  isPlaying: boolean;
  time: number; // 0 to 100
  speed: number; // 0.5, 1, 2
  plateDensityLeft: number; // g/cm³
  plateDensityRight: number; // g/cm³
  plateSpeedCmPerYear: number; // 2 to 10 cm/yr
  showEarthquakes: boolean;
  showMagma: boolean;
  showConvection: boolean;
  showLabels: boolean;
  showDepthScale: boolean;
  soundEnabled: boolean;
}
