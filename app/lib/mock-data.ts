export interface Destination {
  id: string;
  name: string;
  location: string;
  country: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const MOCK_DESTINATIONS: Destination[] = [
  {
    id: "1",
    name: "해운대 해수욕장",
    location: "부산",
    country: "대한민국",
    imageUrl: "https://images.unsplash.com/photo-1620051139ff9-775f0532296d?q=80&w=1000&auto=format&fit=crop",
    rating: 4.8,
    reviewCount: 1250,
    tags: ["#바다", "#도심", "#활기로운"],
    description: "대한민국 최고의 해수욕장으로 시원한 바다와 고층 빌딩이 어우러진 이색적인 풍경을 자랑합니다.",
    coordinates: { lat: 35.1587, lng: 129.1604 }
  },
  {
    id: "2",
    name: "감천문화마을",
    location: "부산",
    country: "대한민국",
    imageUrl: "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?q=80&w=1000&auto=format&fit=crop",
    rating: 4.5,
    reviewCount: 850,
    tags: ["#예술", "#풍경", "#인생샷"],
    description: "계단식 주거 형태와 알록달록한 지붕이 만들어내는 아름다운 풍경으로 '한국의 산토리니'라 불립니다.",
    coordinates: { lat: 35.0975, lng: 129.0106 }
  },
  {
    id: "3",
    name: "광안리 해수욕장",
    location: "부산",
    country: "대한민국",
    imageUrl: "https://images.unsplash.com/photo-1578330107248-be31e3cc2bc5?q=80&w=1000&auto=format&fit=crop",
    rating: 4.7,
    reviewCount: 1100,
    tags: ["#야경", "#광안대교", "#로맨틱"],
    description: "광안대교의 화려한 야경을 한눈에 볼 수 있는 곳으로, 밤바다의 낭만을 즐기기 좋습니다.",
    coordinates: { lat: 35.1531, lng: 129.1189 }
  },
  {
    id: "4",
    name: "태종대 유원지",
    location: "부산",
    country: "대한민국",
    imageUrl: "https://images.unsplash.com/photo-1662998319159-4ac97871e847?q=80&w=1000&auto=format&fit=crop",
    rating: 4.6,
    reviewCount: 720,
    tags: ["#기암괴석", "#바다절경", "#산책"],
    description: "파도에 깎인 기암괴석과 푸른 바다가 어우러진 절경을 감상하며 산책할 수 있는 부산의 명소입니다.",
    coordinates: { lat: 35.0501, lng: 129.0886 }
  }
];
