// 사이트 데이터 저장소 (정적 사이트용 데이터 모듈)
// api/_lib 아래 파일은 Vercel에서 라우트나 정적 파일로 공개되지 않고, 서버 함수 안에서만 읽힙니다.
// 민감 필드(비밀번호 해시, API 키, 결제 비밀값)는 백업 시 자동으로 제외됩니다.
// 아래 민감 필드 값은 모두 데모용 자리표시자이며 실제 값이 아닙니다.

module.exports = {
  site: {
    name: '브랜드의 이유',
    url: 'https://brand-reason-jihu.vercel.app/',
    title: '생활용품 사입 상품 차별화 방법 | 브랜드의 이유',
    description:
      '생활용품 사입 셀러를 위한 브랜드 차별화 가이드. 고객의 사용 장면을 찾고 상품 구성과 상세페이지 문구에 구매 이유를 담는 방법을 수납함 사례로 살펴보세요.',
    keywords: ['생활용품 사입 상품 차별화 방법', '사입 브랜드 차별화', '생활용품 상세페이지 문구 예시'],
    analytics: { provider: 'Google Analytics 4', measurementId: 'G-3798RLX8KF' },
    monitoring: { provider: 'UptimeRobot', intervalMinutes: 5 }
  },

  products: [
    {
      id: 'starter',
      plan: '브랜드의 이유 STARTER',
      name: '사입 브랜드 차별화 가이드',
      summary: '내 상품에 직접 적용하며 정리하는 실전 패키지',
      price: 29000,
      currency: 'KRW',
      status: 'demo',
      items: [
        '타깃 고객·사용 상황 정의 워크북',
        '상품 구성·브랜드 차별점 체크리스트',
        '브랜드 소개·상세페이지 문구 템플릿'
      ]
    }
  ],

  curriculum: [
    { step: 1, title: '누구의 생활을 바꿀까?', output: '타깃 고객 정의' },
    { step: 2, title: '어떤 이유로 선택할까?', output: '차별화 콘셉트' },
    { step: 3, title: '어떻게 전달할까?', output: '핵심 판매 문구' }
  ],

  pages: [
    { path: '/', title: '생활용품 사입 상품 차별화 방법 | 브랜드의 이유', sections: ['hero', 'curriculum', 'purchase'] },
    { path: '/admin/backups', title: '데이터 백업 | 브랜드의 이유 관리자', sections: ['backup'] }
  ],

  admins: [
    { id: 'admin-1', name: '사이트 관리자', role: 'owner', passwordHash: 'demo-placeholder-not-a-real-hash' }
  ],

  integrations: {
    payment: { provider: '미연동 (과제용 데모)', mode: 'demo', secretKey: 'demo-placeholder-not-a-real-key' },
    uptimeRobot: { enabled: true, apiKey: 'demo-placeholder-not-a-real-key' }
  }
};
