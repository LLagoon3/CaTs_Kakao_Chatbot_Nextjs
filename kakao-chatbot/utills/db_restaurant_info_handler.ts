import axios, { AxiosResponse } from 'axios';
import { RestaurantInfo, RestaurantInfoBody } from '../interface/restaurant_info';
import TokenHandler from './db_token_handler';

// 테스트 데이터
const apiUrl: string = 'http://0.0.0.0:8000';

class RestaurantInfoHandler{
    public static apiRestaurantInfoUrl: string = `${apiUrl}/kakaochatbot/restaurantinfo/`

    // restaurantInfo 파싱 및 db로 전송
    public static async createRestaurantInfo(url: string, restaurantInfo: RestaurantInfo): Promise<void> {
        const accessToken = await TokenHandler.getToken();
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
                        const response: AxiosResponse = await axios.post(RestaurantInfoHandler.apiRestaurantInfoUrl, body,{
                                            headers: {
                                                'Authorization': `Bearer ${accessToken}`
                                            }});
                        console.log(body);
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        }
    }

    // db 정보를 RestaurantInfo 형태로 파싱
    public static async readRestaurantInfo(url: string, date: string): Promise<RestaurantInfo | null> {
        const accessToken = await TokenHandler.getToken();
        try {
            const response: AxiosResponse = await axios.get(RestaurantInfoHandler.apiRestaurantInfoUrl + `${date}/`, {
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`
                                }});
            // date에 해당하는 레코드들 배열로 반환
            const bodyArray: RestaurantInfoBody[] = response.data;
            const restaurantInfo: RestaurantInfo = { date: {} };
            restaurantInfo[date] = {};

            bodyArray.forEach((ele) => {
                if (!restaurantInfo[ele.date][ele.restaurantName]) restaurantInfo[ele.date][ele.restaurantName] = {};
                restaurantInfo[ele.date][ele.restaurantName][ele.timeOfDay] = ele.menu.split(' ');
            })
            
            return restaurantInfo
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}

import MenuCrawler from './menu_crawler';
async function testFunc() {
    // const mc = new MenuCrawler('https://www.cbnucoop.com/service/restaurant/');
    // const restaurantInfo = await mc.parseRestaurantInfo();
    // console.log(restaurantInfo);
    // await RestaurantInfoHandler.createRestaurantInfo(apiUrl, restaurantInfo);
    const test = await RestaurantInfoHandler.readRestaurantInfo(apiUrl, '2024-08-16');
    console.log(test);
}

testFunc()