# Tactical Map

Vue 3, MapLibre GL JS, milsymbol 전술지도입니다.
아군과 적군 유닛을 배치하고, 위치를 조정하고, GeoJSON 형태로 내보낼 수 있습니다.

## 주요 기능

- OpenStreetMap 타일 기반 2D 전술 지도
- MapLibre `symbol layer` 기반 군사 심볼 렌더링
- 심볼 hover 시 팝오버 정보 표시
- 심볼 클릭 시 선택 및 편집 패널 표시
- 심볼 드래그로 위치 이동
- `유닛 추가` 버튼으로 추가 모드 진입 후 지도 클릭 배치
- `유닛 편성표` 버튼으로 하단 오버레이 목록 표시
- `내보내기` 버튼으로 GeoJSON 복사 및 다운로드

## 실행 방법

```bash
npm install
npm run dev
```

타입 체크:

```bash
npm run check
```

프로덕션 빌드:

```bash
npm run build
```

## 사용 기술

- Vue 3
- Vite
- TypeScript
- Pinia
- MapLibre GL JS
- milsymbol
