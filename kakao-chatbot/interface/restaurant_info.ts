// 서버 내부 사용
export interface RestaurantInfo {
    [key: string]: { // 날짜
        [key: string]: { // 식당 이름
            [key: string]: string[] // 시간대 : 식사 메뉴
        };
    };
}

// 서버 외부 DB 통신 시 사용
export interface RestaurantInfoBody{
    'date': string,
    'restaurantName': string,
    'timeOfDay': string,
    'menu': string
}