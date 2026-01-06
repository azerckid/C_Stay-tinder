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
    imageUrl: "/destinations/id1.png",
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
    imageUrl: "/destinations/id2.png",
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
    imageUrl: "/destinations/id3.png",
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
    imageUrl: "/destinations/id4.png",
    rating: 4.6,
    reviewCount: 720,
    tags: ["#기암괴석", "#바다절경", "#산책"],
    description: "파도에 깎인 기암괴석과 푸른 바다가 어우러진 절경을 감상하며 산책할 수 있는 부산의 명소입니다.",
    coordinates: { lat: 35.0501, lng: 129.0886 }
  },
  {
    id: "5",
    name: "불국사",
    location: "경주",
    country: "대한민국",
    imageUrl: "/destinations/id5.png",
    rating: 4.9,
    reviewCount: 2100,
    tags: ["#역사", "#사찰", "#단풍"],
    description: "유네스코 세계문화유산으로 지정된 신라 시대의 사찰로, 한국 불교 예술의 정수를 보여줍니다.",
    coordinates: { lat: 35.7899, lng: 129.3321 }
  },
  {
    id: "6",
    name: "성산 일출봉",
    location: "제주",
    country: "대한민국",
    imageUrl: "/destinations/id6.png",
    rating: 4.8,
    reviewCount: 3400,
    tags: ["#자연", "#일출", "#세계유산"],
    description: "바다 위에 솟아오른 거대한 성채 같은 모양의 화산구로, 정상에서 바라보는 일출이 일품입니다.",
    coordinates: { lat: 33.4581, lng: 126.9426 }
  },
  {
    id: "7",
    name: "북촌 한옥마을",
    location: "서울",
    country: "대한민국",
    imageUrl: "/destinations/id7.png",
    rating: 4.4,
    reviewCount: 1560,
    tags: ["#전통", "#한옥", "#서울"],
    description: "조선시대 고위 관료들이 거주하던 한옥들이 보존된 마을로, 서울의 근현대사를 느낄 수 있는 곳입니다.",
    coordinates: { lat: 37.5815, lng: 126.9825 }
  },
  {
    id: "8",
    name: "N서울타워",
    location: "서울",
    country: "대한민국",
    imageUrl: "/destinations/id8.png",
    rating: 4.7,
    reviewCount: 2800,
    tags: ["#야경", "#랜드마크", "#데이트"],
    description: "남산 정상에 위치하여 서울 시내를 사방으로 조망할 수 있는 서울의 멀티미디어 타워입니다.",
    coordinates: { lat: 37.5512, lng: 126.9882 }
  },
  {
    id: "9",
    name: "대관령 양떼목장",
    location: "평창",
    country: "대한민국",
    imageUrl: "/destinations/id9.png",
    rating: 4.6,
    reviewCount: 980,
    tags: ["#목장", "#힐링", "#풍경"],
    description: "한국의 알프스라 불리는 광활한 초원에서 양들에게 먹이를 주며 평화로운 시간을 보낼 수 있는 곳입니다.",
    coordinates: { lat: 37.6888, lng: 128.7333 }
  },
  {
    id: "10",
    name: "카멜리아 힐",
    location: "제주",
    country: "대한민국",
    imageUrl: "/destinations/id10.png",
    rating: 4.5,
    reviewCount: 1200,
    tags: ["#꽃", "#동백", "#인생샷"],
    description: "동양 최대 규모의 동백 수목원으로, 사계절 내내 아름다운 꽃들을 감상하며 산책하기 좋습니다.",
    coordinates: { lat: 33.2917, lng: 126.3700 }
  }
];
