import { BoundaryDetail, HotspotLocation, EarthquakeDataPoint, VolcanoDataPoint } from '../types/tectonics';

export const BOUNDARIES_DATA: Record<string, BoundaryDetail> = {
  divergent: {
    id: 'divergent',
    title: '발산형 경계 (해령 & 열곡대)',
    koreanName: '발산형 경계',
    category: '해령 / 열곡대 (Divergent Boundary)',
    summary: '두 판이 서로 멀어지며 마그마가 분출하여 새로운 해양 지각이 생성되는 경계',
    description: '맨틀 대류의 상승류에 의해 마그마가 지표 가까이 솟아오르고, 양쪽으로 판이 갈라지면서 새로운 해양 지각이 만들어집니다. 해저에서는 해령과 중앙 열곡이 발달하고, 육지에서는 열곡대가 형성됩니다.',
    relativeMotion: '멀어짐 (발산)',
    plateLeft: {
      name: '북아메리카 판 / 남아메리카 판',
      type: 'oceanic',
      defaultDensity: 3.0,
      thicknessKm: 8,
      composition: '현무암질 해양 지각'
    },
    plateRight: {
      name: '유라시아 판 / 아프리카 판',
      type: 'oceanic',
      defaultDensity: 3.0,
      thicknessKm: 8,
      composition: '현무암질 해양 지각'
    },
    plateFate: '새로운 판 생성',
    topography: ['해령 (Mid-Ocean Ridge)', '열곡 (Rift Valley)', '해저 화산'],
    earthquakes: {
      depth: '천발 지진 (진원 깊이 0~70km)',
      description: '장력(양쪽으로 잡아당기는 힘)에 의해 정단층이 형성되며 주로 얕은 천발 지진이 빈번하게 발생합니다.',
      focalTypes: ['shallow']
    },
    volcanism: {
      exists: true,
      description: '맨틀 물질이 감압 용융되어 생성된 현무암질 마그마가 지속적으로 분출하여 새로운 해양 지각을 형성합니다.'
    },
    realWorldExamples: [
      '대서양 중앙 해령 (Mid-Atlantic Ridge)',
      '동태평양 해령 (East Pacific Rise)',
      '동아프리카 열곡대 (East African Rift System - 대륙 분열 단계)'
    ],
    keyPoints: [
      '맨틀 대류의 상승부에서 형성',
      '새로운 해양 지각이 계속 생성되어 해저가 확장됨',
      '해령에서 멀어질수록 해양 지각의 나이가 많아지고 퇴적물의 두께가 두꺼워짐',
      '화산 활동 활발 (현무암질), 천발 지진만 발생'
    ]
  },

  convergent_subduction: {
    id: 'convergent_subduction',
    title: '수렴형 경계 (섭입대: 해구 & 호상열도)',
    koreanName: '수렴형 경계 (섭입대)',
    category: '섭입대 (Subduction Zone)',
    summary: '밀도가 큰 해양판이 대륙판(또는 다른 해양판) 밑으로 파고들며 소멸하는 경계',
    description: '밀도가 큰 해양판이 상대적으로 밀도가 작은 대륙판 밑으로 비스듬히 미끄러져 들어갑니다(섭입). 섭입대 경계면(베니오프대)을 따라 대륙 쪽으로 갈수록 지진의 진원 깊이가 점점 깊어지며(천발→중발→심발), 섭입된 판의 물이 맨틀을 녹여 마그마가 생성되고 화산호나 호상열도를 형성합니다.',
    relativeMotion: '모여듦 (수렴·섭입)',
    plateLeft: {
      name: '태평양 판 / 나스카 판',
      type: 'oceanic',
      defaultDensity: 3.0,
      thicknessKm: 10,
      composition: '고밀도 현무암질 지각'
    },
    plateRight: {
      name: '유라시아 판 / 남아메리카 판',
      type: 'continental',
      defaultDensity: 2.7,
      thicknessKm: 35,
      composition: '저밀도 화강암질 지각'
    },
    plateFate: '해양판 소멸 (맨틀로 섭입)',
    topography: ['해구 (Oceanic Trench)', '호상열도 (Island Arc)', '화산호/습곡산맥 (안데스형)'],
    earthquakes: {
      depth: '천발 ~ 중발 ~ 심발 지진 (베니오프대 형성)',
      description: '해구에서 대륙 쪽으로 갈수록 섭입하는 판을 따라 진원의 깊이가 0km(천발)에서 700km(심발)까지 점진적으로 깊어지는 베니오프대(Benioff Zone)가 뚜렷합니다.',
      focalTypes: ['shallow', 'intermediate', 'deep']
    },
    volcanism: {
      exists: true,
      description: '섭입된 해양 지각의 탈수 작용으로 쐐기 맨틀이 용융되어 안산암질~유문암질 마그마가 상승, 폭발적인 화산을 분출합니다.'
    },
    realWorldExamples: [
      '마리아나 해구 (Mariana Trench - 세계에서 가장 깊은 해구)',
      '일본 해구 & 일본 열도 (호상열도)',
      '페루-칠레 해구 & 안데스 산맥 (대륙호 화산)'
    ],
    keyPoints: [
      '맨틀 대류의 하강부에서 형성',
      '밀도가 큰 판이 밀도가 작은 판 아래로 섭입하여 맨틀 속으로 소멸',
      '해구에서 대륙 쪽으로 갈수록 지진 진원이 깊어짐 (베니오프대)',
      '강력한 천발·중발·심발 지진 및 폭발적 화산 활동 동반'
    ]
  },

  convergent_collision: {
    id: 'convergent_collision',
    title: '수렴형 경계 (충돌대: 대륙-대륙 습곡산맥)',
    koreanName: '수렴형 경계 (충돌대)',
    category: '충돌대 (Continental Collision Zone)',
    summary: '두 대륙판이 충돌하여 밀도가 낮아 섭입하지 못하고 거대한 습곡 산맥을 형성하는 경계',
    description: '두 판이 모두 밀도가 작은 대륙판인 경우, 어느 한쪽도 맨틀 속으로 깊이 섭입하지 못하고 강한 횡압력에 의해 지각이 압축·융기되어 높고 거대한 습곡 산맥을 만듭니다. 지각이 두껍게 발달하여 마그마가 지표로 뚫고 나오지 못하므로 화산 활동은 거의 없습니다.',
    relativeMotion: '모여듦 (수렴·충돌)',
    plateLeft: {
      name: '인도-오스트레일리아 판',
      type: 'continental',
      defaultDensity: 2.7,
      thicknessKm: 40,
      composition: '대륙 지각'
    },
    plateRight: {
      name: '유라시아 판',
      type: 'continental',
      defaultDensity: 2.7,
      thicknessKm: 40,
      composition: '대륙 지각'
    },
    plateFate: '판 소멸 없음 (융기·변형)',
    topography: ['거대 습곡 산맥 (Fold Mountains)', '고원 (Tibetan Plateau)', '역단층'],
    earthquakes: {
      depth: '천발 ~ 중발 지진 (진원 깊이 0~300km)',
      description: '두 대륙의 강력한 충돌 압축으로 인해 역단층이 발달하며 규모가 매우 큰 천발 및 중발 지진이 발생합니다. (심발 지진은 없음)',
      focalTypes: ['shallow', 'intermediate']
    },
    volcanism: {
      exists: false,
      description: '지각의 두께가 매우 두껍고(최대 70km) 섭입에 의한 마그마 공급이 원활하지 않아 화산 분출이 거의 일어나지 않습니다.'
    },
    realWorldExamples: [
      '히말라야 산맥 (Himalayas - 인도판과 유라시아판의 충돌)',
      '알프스 산맥 (Alps - 아프리카판과 유라시아판의 충돌)'
    ],
    keyPoints: [
      '대륙판과 대륙판의 충돌 (두 판의 밀도가 비슷하게 작음)',
      '섭입이 일어나지 않고 지각이 위로 솟구쳐 거대한 습곡산맥 형성',
      '화산 활동이 거의 일어나지 않음',
      '강력한 천발 및 중발 지진 자주 발생'
    ]
  },

  transform: {
    id: 'transform',
    title: '보존형 경계 (변환단층)',
    koreanName: '보존형 경계 (변환단층)',
    category: '변환단층 (Transform Fault)',
    summary: '두 판이 스쳐 지나가며 판이 생성되거나 소멸하지 않고 어긋나는 경계',
    description: '인접한 두 판이 서로 반대 방향으로 수평 이동하거나 서로 다른 속도로 이동하면서 마찰을 일으키는 경계입니다. 해령과 해령 사이를 잇는 단층선에서 주로 발달하며, 판의 생성이나 소멸이 전혀 일어나지 않고 천발 지진만 발생합니다.',
    relativeMotion: '어긋남 (보존)',
    plateLeft: {
      name: '태평양 판',
      type: 'oceanic',
      defaultDensity: 3.0,
      thicknessKm: 12,
      composition: '북서쪽으로 이동'
    },
    plateRight: {
      name: '북아메리카 판',
      type: 'continental',
      defaultDensity: 2.7,
      thicknessKm: 30,
      composition: '남동쪽으로 상대 이동'
    },
    plateFate: '판의 생성도 소멸도 없음',
    topography: ['변환단층 (Transform Fault)', '단층애 (Fault Scarp)', '어긋난 하천 계곡'],
    earthquakes: {
      depth: '천발 지진 (진원 깊이 0~70km)',
      description: '판 경계면의 강한 마찰과 응력 축적으로 인해 지표 부근에서 주기적으로 대형 천발 지진이 일어납니다.',
      focalTypes: ['shallow']
    },
    volcanism: {
      exists: false,
      description: '맨틀 대류의 상승이나 하강이 수반되지 않고 판이 단순히 수평으로 미끄러지므로 화산 활동은 일어나지 않습니다.'
    },
    realWorldExamples: [
      '산안드레아스 단층 (San Andreas Fault - 미국 캘리포니아)',
      '대서양 중앙 해령의 변환단층들'
    ],
    keyPoints: [
      '판이 생성되거나 소멸하지 않고 보존됨',
      '해령과 해령 사이를 잇는 구간에서 활성 변환단층 발달',
      '화산 활동 없음',
      '매우 강력하고 파괴적인 천발 지진 발생'
    ]
  }
};

export const HOTSPOTS: HotspotLocation[] = [
  {
    id: 'mariana',
    name: '마리아나 해구 (Mariana Trench)',
    boundaryType: 'convergent_subduction',
    lat: 11.35,
    lng: 142.2,
    plates: '태평양 판 ➔ 필리핀해 판',
    features: '세계 최심 해구 (약 11,000m), 호상열도, 섭입대',
    description: '오래되고 밀도가 높은 태평양판이 필리핀해판 밑으로 급경사로 섭입하여 세계에서 가장 깊은 마리아나 해구를 형성했습니다.'
  },
  {
    id: 'japan_trench',
    name: '일본 해구 & 일본 열도',
    boundaryType: 'convergent_subduction',
    lat: 38.0,
    lng: 144.0,
    plates: '태평양 판 ➔ 북아메리카/유라시아 판',
    features: '해구, 호상열도, 베니오프대, 활화산 밀집',
    description: '태평양판의 섭입으로 인해 천발부터 심발까지 이어지는 전형적인 베니오프대 지진과 후지산 등 화산호가 형성되어 있습니다.'
  },
  {
    id: 'andes',
    name: '페루-칠레 해구 & 안데스 산맥',
    boundaryType: 'convergent_subduction',
    lat: -20.0,
    lng: -70.5,
    plates: '나스카 판 ➔ 남아메리카 판',
    features: '해양판-대륙판 섭입, 해구, 대륙호 화산, 습곡산맥',
    description: '해양판인 나스카판이 대륙판인 남아메리카판 아래로 섭입하며 세계에서 가장 긴 안데스 습곡산맥과 화산대를 만들었습니다.'
  },
  {
    id: 'mid_atlantic',
    name: '대서양 중앙 해령 (Mid-Atlantic Ridge)',
    boundaryType: 'divergent',
    lat: 25.0,
    lng: -42.0,
    plates: '북아메리카 판 ⇄ 유라시아 판',
    features: '해저 산맥, 중앙 열곡, 해양 지각 생성',
    description: '대서양 한가운데에서 두 판이 매년 약 2.5cm씩 멀어지며 마그마가 솟아올라 새로운 대양저를 형성하고 있습니다.'
  },
  {
    id: 'east_africa',
    name: '동아프리카 열곡대 (East African Rift)',
    boundaryType: 'divergent',
    lat: 0.5,
    lng: 36.5,
    plates: '누비아 판 ⇄ 소말리아 판',
    features: '대륙 분열 초기 열곡대, 화산호(킬리만자로)',
    description: '아프리카 대륙 내부가 갈라지며 새로운 바다가 생겨나는 초기 단계의 발산형 경계입니다.'
  },
  {
    id: 'himalaya',
    name: '히말라야 산맥 (Himalayas)',
    boundaryType: 'convergent_collision',
    lat: 28.0,
    lng: 86.9,
    plates: '인도 판 ➔ 유라시아 판',
    features: '세계 최고봉 에베레스트, 대륙 충돌 습곡, 역단층',
    description: '인도 대륙판이 유라시아 대륙판과 정면 충돌하여 융기한 결과, 지각 두께가 70km에 달하는 거대한 히말라야 산맥이 형성되었습니다.'
  },
  {
    id: 'san_andreas',
    name: '산안드레아스 단층 (San Andreas Fault)',
    boundaryType: 'transform',
    lat: 35.1,
    lng: -119.6,
    plates: '태평양 판 ⇋ 북아메리카 판',
    features: '우수향 주향이동 단층, 변환단층, 천발 지진',
    description: '태평양판과 북아메리카판이 수평으로 스쳐 지나가며 마찰을 일으켜 샌프란시스코 대지진 등 강력한 천발 지진을 유발합니다.'
  }
];

export const SAMPLE_EARTHQUAKES: EarthquakeDataPoint[] = [
  // Ring of fire (Pacific Rim) - shallow to deep (Benioff zone samples)
  { lat: 35.7, lng: 140.0, depthKm: 35, magnitude: 6.8, region: '일본 혼슈 연안 (천발)' },
  { lat: 36.2, lng: 137.5, depthKm: 180, magnitude: 6.2, region: '일본 내륙 (중발)' },
  { lat: 37.1, lng: 134.8, depthKm: 420, magnitude: 7.1, region: '동해 심해 (심발)' },
  { lat: 13.5, lng: 144.8, depthKm: 45, magnitude: 6.5, region: '마리아나 해구 (천발)' },
  { lat: 14.1, lng: 142.9, depthKm: 210, magnitude: 5.9, region: '마리아나 섭입대 (중발)' },
  { lat: 15.0, lng: 140.2, depthKm: 550, magnitude: 6.7, region: '마리아나 심부 (심발)' },
  { lat: -33.1, lng: -71.6, depthKm: 28, magnitude: 7.4, region: '칠레 연안 (천발)' },
  { lat: -32.8, lng: -69.2, depthKm: 120, magnitude: 6.3, region: '안데스 산맥 (중발)' },
  { lat: -27.5, lng: -63.5, depthKm: 580, magnitude: 6.9, region: '아르헨티나 심부 (심발)' },
  { lat: 37.8, lng: -122.4, depthKm: 12, magnitude: 6.9, region: '캘리포니아 산안드레아스 (천발)' },
  { lat: 28.2, lng: 84.7, depthKm: 15, magnitude: 7.8, region: '네팔 히말라야 (천발)' },
  { lat: 29.5, lng: 85.1, depthKm: 90, magnitude: 6.1, region: '티베트 고원 (중발)' },
  // Mid Atlantic Ridge (shallow only)
  { lat: 38.5, lng: -28.5, depthKm: 10, magnitude: 5.4, region: '대서양 중앙 해령 (아조레스, 천발)' },
  { lat: 0.1, lng: -24.3, depthKm: 8, magnitude: 5.8, region: '적도 대서양 해령 (천발)' },
  { lat: -54.0, lng: -2.0, depthKm: 12, magnitude: 5.2, region: '남대서양 부베 섬 (천발)' },
  { lat: 64.1, lng: -21.9, depthKm: 7, magnitude: 5.5, region: '아이슬란드 열곡대 (천발)' },
  // East African Rift
  { lat: -1.5, lng: 29.2, depthKm: 14, magnitude: 5.3, region: '르완다 니라공고 (천발)' }
];

export const SAMPLE_VOLCANOES: VolcanoDataPoint[] = [
  { lat: 35.36, lng: 138.73, name: '후지산 (Fuji)', elevationM: 3776, type: '성층화산 (호상열도)' },
  { lat: 41.98, lng: 128.08, name: '백두산 (Paektu)', elevationM: 2744, type: '복합화산' },
  { lat: 46.2, lng: -122.19, name: '세인트 헬렌스 (St. Helens)', elevationM: 2549, type: '성층화산 (캐스케이드 화산호)' },
  { lat: 19.42, lng: -155.28, name: '킬라우에아 (Kilauea)', elevationM: 1247, type: '순상화산 (열점)' },
  { lat: -6.1, lng: 105.42, name: '크라카타우 (Krakatoa)', elevationM: 813, type: '칼데라 (순다 열도)' },
  { lat: 63.98, lng: -19.7, name: '헤클라 (Hekla)', elevationM: 1491, type: '해령 화산 (아이슬란드)' },
  { lat: -3.07, lng: 37.35, name: '킬리만자로 (Kilimanjaro)', elevationM: 5895, type: '열곡대 화산 (동아프리카)' },
  { lat: -33.45, lng: -70.0, name: '투푼가토 (Tupungato)', elevationM: 6570, type: '성층화산 (안데스 산맥)' }
];

export const TECTONIC_PLATES_POLYLINES: { name: string; color: string; path: [number, number][] }[] = [
  // Pacific plate boundary loop (approximate)
  {
    name: '환태평양 조산대 (불의 고리)',
    color: '#38BDF8',
    path: [
      [-60, -70], [-40, -75], [-20, -72], [0, -80], [15, -95], [25, -110],
      [35, -120], [50, -130], [58, -150], [62, -170], [60, 170], [52, 160],
      [42, 145], [35, 140], [20, 145], [10, 143], [0, 140], [-15, 165],
      [-30, 180], [-45, 170], [-60, 150], [-60, -70]
    ]
  },
  // Mid Atlantic Ridge
  {
    name: '대서양 중앙 해령',
    color: '#F97316',
    path: [
      [75, -5], [68, -17], [64, -22], [52, -35], [38, -30], [25, -45],
      [15, -45], [0, -20], [-10, -14], [-25, -13], [-40, -16], [-54, -2],
      [-60, -15]
    ]
  },
  // Alpine-Himalayan belt
  {
    name: '알프스-히말라야 조산대',
    color: '#EAB308',
    path: [
      [38, -8], [40, 5], [45, 12], [42, 22], [38, 35], [35, 45],
      [34, 55], [32, 68], [28, 80], [28, 90], [25, 95], [18, 98],
      [5, 100], [-5, 110], [-8, 120]
    ]
  },
  // San Andreas Fault segment
  {
    name: '산안드레아스 단층대',
    color: '#10B981',
    path: [
      [40, -125], [38, -123], [35, -119], [32, -115], [28, -112]
    ]
  }
];

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: '해양판과 대륙판이 수렴(충돌)할 때, 해양판이 대륙판 아래로 섭입하는 주된 원인은 무엇일까요?',
    options: [
      '해양판의 두께가 대륙판보다 훨씬 두껍기 때문에',
      '해양판의 밀도가 대륙판의 밀도보다 크기 때문에',
      '대륙판의 온도가 해양판보다 훨씬 높기 때문에',
      '해양판이 항상 더 빠른 속도로 이동하기 때문에'
    ],
    correctIndex: 1,
    explanation: '해양 지각은 현무암질 암석(밀도 약 3.0 g/cm³)으로 이루어져 있어 화강암질 암석인 대륙 지각(밀도 약 2.7 g/cm³)보다 밀도가 큽니다. 따라서 두 판이 만나면 밀도가 큰 해양판이 아래로 섭입하게 됩니다.'
  },
  {
    id: 2,
    question: '섭입대에서 해구에서 대륙 쪽으로 갈수록 지진의 진원 깊이는 어떻게 변화할까요?',
    options: [
      '점점 얕아진다 (심발 → 천발)',
      '일정하게 얕은 깊이(천발)에서만 유지된다',
      '점점 깊어진다 (천발 → 중발 → 심발 - 베니오프대)',
      '진원의 깊이는 무작위로 발생하여 규칙성이 없다'
    ],
    correctIndex: 2,
    explanation: '해양판이 대륙판 아래로 비스듬히 기울어져 파고들기 때문에, 섭입하는 판의 경계면(베니오프대)을 따라 대륙 쪽으로 갈수록 지진이 발생하는 진원의 깊이가 점점 깊어집니다.'
  },
  {
    id: 3,
    question: '다음 중 "새로운 판이 생성"되며 "천발 지진"과 "화산 활동"이 함께 일어나는 판 경계는?',
    options: [
      '보존형 경계 (변환단층)',
      '수렴형 경계 (대륙-대륙 충돌대)',
      '발산형 경계 (해저 해령 및 열곡대)',
      '수렴형 경계 (해양-대륙 섭입대)'
    ],
    correctIndex: 2,
    explanation: '발산형 경계(해령)는 맨틀 대류의 상승부에서 마그마가 분출하여 새로운 해양 지각을 만들며, 양쪽으로 판이 갈라지는 과정에서 천발 지진이 일어납니다.'
  },
  {
    id: 4,
    question: '인도판과 유라시아판이 만나는 "히말라야 산맥"에서 화산 활동이 거의 관측되지 않는 이유는 무엇일까요?',
    options: [
      '지하 온도가 너무 차가워 암석이 전혀 녹지 않기 때문에',
      '두 대륙판의 밀도가 모두 작아 섭입하지 않고 충돌·융기하여 지각이 매우 두껍기 때문에',
      '바닷물이 없어서 수압이 낮기 때문에',
      '판의 이동이 완전히 멈추어 고정되었기 때문에'
    ],
    correctIndex: 1,
    explanation: '두 판 모두 밀도가 작은 대륙판이어서 어느 판도 맨틀 속으로 깊이 섭입하지 못하고 지각이 70km 이상 두껍게 융기합니다. 따라서 섭입에 의한 마그마 생성이 어렵고 두꺼운 지각을 뚫고 지표로 분출하기 어렵습니다.'
  },
  {
    id: 5,
    question: '미국의 "산안드레아스 단층"과 같은 보존형 경계의 가장 큰 특징은 무엇일까요?',
    options: [
      '세계에서 가장 강력한 화산 폭발이 일어난다',
      '판이 깊은 맨틀 속으로 소멸하여 깊은 해구가 생긴다',
      '판이 생성되거나 소멸하지 않고 스쳐 지나가며 천발 지진만 발생한다',
      '새로운 대륙 지각이 급속도로 생성되어 평야가 된다'
    ],
    correctIndex: 2,
    explanation: '보존형 경계는 판이 서로 수평으로 엇갈려 미끄러지는 경계로, 판의 생성도 소멸도 일어나지 않으며 화산 활동 없이 천발 지진만 일어납니다.'
  }
];
