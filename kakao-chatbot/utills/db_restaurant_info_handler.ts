import axios, { AxiosResponse } from 'axios';
import { RestaurantInfo, RestaurantInfoBody } from '../interface/restaurant_info';

// 테스트 데이터
const apiUrl: string = 'http://0.0.0.0:8000';

class RestaurantInfoHandler{
    public static apiRestaurantInfoUrl: string = `${apiUrl}/restaurant_info/`;

    // restaurantInfo 파싱 및 db로 전송
    public static async createRestaurantInfo(restaurantInfo: RestaurantInfo): Promise<void> {
        for (const [date, restaurantObj] of Object.entries(restaurantInfo)) {
            for (const [restaurantName, timeOfDayObj] of Object.entries(restaurantObj)) {
                for (const [timeOfDay, menu] of Object.entries(timeOfDayObj)) {
                    try {
                        const body: RestaurantInfoBody = {
                            'date': date,
                            'restaurantName': restaurantName,
                            'timeOfDay': timeOfDay,
                            'menu': menu.join(' ')
                        }
                        const response: AxiosResponse = await axios.post(RestaurantInfoHandler.apiRestaurantInfoUrl, body);
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        }
    }

    public static async readRestaurantInfo(date: string) {
        try {
            const response: AxiosResponse = await axios.get(RestaurantInfoHandler.apiRestaurantInfoUrl + 'date');
            // date에 해당하는 레코드들 배열로 반환
            const bodyArray: RestaurantInfoBody[] = response.data;
            const restaurantInfo: RestaurantInfo = {};
        } catch (error) {
            console.error(error);
        }
    }
}