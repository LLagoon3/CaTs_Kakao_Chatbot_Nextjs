export default interface RestaurantInfo {
    [key: string]: { // 날짜
        [key: string]: { // 식당 이름
            [key: string]: string[] // 시간대 : 식사 메뉴
        };
    };
}