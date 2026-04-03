import type { SymbolAffiliation, SymbolPreset } from '../types/military'

export const symbolPresets: SymbolPreset[] = [
  {
    id: 'friendly-command-post',
    sidc: 'SFGPUH1---K',
    name: '아군 지휘소',
    shortLabel: 'CP',
    summary: '전방 편성을 지휘하는 지휘통제 거점입니다.',
    category: '지휘통제',
    affiliation: 'friendly',
    defaultTitle: '아군 지휘소',
    defaultDescription: '전방 편성을 지휘하는 지휘통제 거점',
    defaultStatus: 'active'
  },
  {
    id: 'friendly-infantry-company',
    sidc: 'SFGPUCI----K',
    name: '아군 보병중대',
    shortLabel: 'INF',
    summary: '주 방어선과 기동 임무를 담당하는 보병 전력입니다.',
    category: '기동',
    affiliation: 'friendly',
    defaultTitle: '아군 보병중대',
    defaultDescription: '전방 방어와 기동 임무를 수행하는 보병 전력',
    defaultStatus: 'active'
  },
  {
    id: 'friendly-armor-platoon',
    sidc: 'SFGPUCA----K',
    name: '아군 기갑소대',
    shortLabel: 'ARM',
    summary: '돌파 대응과 역습을 맡는 기갑 예비 전력입니다.',
    category: '기갑',
    affiliation: 'friendly',
    defaultTitle: '아군 기갑소대',
    defaultDescription: '역습과 기동 타격을 위한 기갑 예비 전력',
    defaultStatus: 'active'
  },
  {
    id: 'friendly-field-artillery',
    sidc: 'SFGPUCF----K',
    name: '아군 야포대',
    shortLabel: 'ART',
    summary: '차단 사격과 심도 화력을 담당하는 포병 전력입니다.',
    category: '화력',
    affiliation: 'friendly',
    defaultTitle: '아군 야포대',
    defaultDescription: '차단 사격과 심도 화력을 제공하는 포병 전력',
    defaultStatus: 'watch'
  },
  {
    id: 'friendly-mortar-section',
    sidc: 'SFGPUCFM---K',
    name: '아군 박격포반',
    shortLabel: 'MOR',
    summary: '능선과 계곡 목표를 지원하는 근접 간접화력입니다.',
    category: '화력',
    affiliation: 'friendly',
    defaultTitle: '아군 박격포반',
    defaultDescription: '전방 부대를 지원하는 근접 간접화력 전력',
    defaultStatus: 'watch'
  },
  {
    id: 'friendly-recon-team',
    sidc: 'SFGPUCR----K',
    name: '아군 정찰팀',
    shortLabel: 'REC',
    summary: '전방 관측과 위협 탐지를 수행하는 정찰 요소입니다.',
    category: '정찰',
    affiliation: 'friendly',
    defaultTitle: '아군 정찰팀',
    defaultDescription: '전방 관측과 위협 탐지를 수행하는 정찰 요소',
    defaultStatus: 'active'
  },
  {
    id: 'friendly-air-defense',
    sidc: 'SFGPUCD----K',
    name: '아군 방공부대',
    shortLabel: 'ADA',
    summary: '저고도 항공 위협을 차단하는 단거리 방공 전력입니다.',
    category: '방공',
    affiliation: 'friendly',
    defaultTitle: '아군 방공부대',
    defaultDescription: '저고도 항공 위협을 막는 단거리 방공 전력',
    defaultStatus: 'planned'
  },
  {
    id: 'friendly-engineer',
    sidc: 'SFGPUCE----K',
    name: '아군 공병부대',
    shortLabel: 'ENG',
    summary: '기동로 개척과 장애물 작업을 담당하는 지원 전력입니다.',
    category: '지원',
    affiliation: 'friendly',
    defaultTitle: '아군 공병부대',
    defaultDescription: '기동로 개척과 장애물 작업을 담당하는 지원 전력',
    defaultStatus: 'planned'
  },
  {
    id: 'hostile-command-post',
    sidc: 'SHGPUH1---K',
    name: '적 지휘소',
    shortLabel: 'EN-CP',
    summary: '적 전력을 통제하는 지휘 거점입니다.',
    category: '지휘통제',
    affiliation: 'hostile',
    defaultTitle: '적 지휘소',
    defaultDescription: '적 전력을 통제하는 지휘 거점',
    defaultStatus: 'active'
  },
  {
    id: 'hostile-infantry-company',
    sidc: 'SHGPUCI----K',
    name: '적 보병중대',
    shortLabel: 'EN-INF',
    summary: '주 공격축에 투입된 적 보병 전력입니다.',
    category: '기동',
    affiliation: 'hostile',
    defaultTitle: '적 보병중대',
    defaultDescription: '주 공격축에 투입된 적 보병 전력',
    defaultStatus: 'active'
  },
  {
    id: 'hostile-armor-platoon',
    sidc: 'SHGPUCA----K',
    name: '적 기갑소대',
    shortLabel: 'EN-ARM',
    summary: '동측 축선에서 기동하는 적 기갑 전력입니다.',
    category: '기갑',
    affiliation: 'hostile',
    defaultTitle: '적 기갑소대',
    defaultDescription: '동측 축선에서 기동하는 적 기갑 전력',
    defaultStatus: 'watch'
  },
  {
    id: 'hostile-field-artillery',
    sidc: 'SHGPUCF----K',
    name: '적 야포대',
    shortLabel: 'EN-ART',
    summary: '후방에서 지원 사격을 제공하는 적 포병 전력입니다.',
    category: '화력',
    affiliation: 'hostile',
    defaultTitle: '적 야포대',
    defaultDescription: '후방에서 지원 사격을 제공하는 적 포병 전력',
    defaultStatus: 'watch'
  },
  {
    id: 'hostile-recon-team',
    sidc: 'SHGPUCR----K',
    name: '적 정찰팀',
    shortLabel: 'EN-REC',
    summary: '전방에서 관측과 표적 식별을 수행하는 적 정찰 요소입니다.',
    category: '정찰',
    affiliation: 'hostile',
    defaultTitle: '적 정찰팀',
    defaultDescription: '전방에서 관측과 표적 식별을 수행하는 정찰 요소',
    defaultStatus: 'active'
  },
  {
    id: 'hostile-air-defense',
    sidc: 'SHGPUCD----K',
    name: '적 방공진지',
    shortLabel: 'EN-ADA',
    summary: '항공 접근을 제한하는 적 방공 진지입니다.',
    category: '방공',
    affiliation: 'hostile',
    defaultTitle: '적 방공진지',
    defaultDescription: '항공 접근을 제한하는 적 방공 진지',
    defaultStatus: 'planned'
  }
]

const presetMap = new Map(symbolPresets.map((preset) => [preset.id, preset]))

export function getPresetById(presetId: string): SymbolPreset {
  return presetMap.get(presetId) ?? symbolPresets[0]
}

export function getAffiliationLabel(affiliation: SymbolAffiliation): string {
  return affiliation === 'friendly' ? '아군' : '적군'
}
