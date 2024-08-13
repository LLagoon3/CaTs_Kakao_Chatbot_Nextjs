import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { Interface } from 'readline';

interface RestaurantInfo {
    [key: string]: { // 식당 이름
        [key: string]: { // 시간대
            [key: string]: string[] // tableId: 식사 메뉴
        };
    };
}

class MenuCrawler {
    private readonly url: string;
    private $: cheerio.CheerioAPI | null = null;
    
    constructor(url: string) {
        this.url = url;
    }

    private async initialize(): Promise<void> {
        console.log('init');
        try {
            const response: AxiosResponse = await axios.get(this.url);
            this.$ = cheerio.load(response.data); // cheerio 인스턴스를 $에 할당
        } catch (error) {
            console.error(error);
        }
    }

    // tableId 받아서 메뉴 파싱
    private parseMenu(tableId: string): string[] | null {
        if (!this.$) {
            console.error("Cheerio is not initialized.");
            return null;
        }
        let targetDiv = this.$(`div[data-table="${tableId}"]`).text();
        console.log(targetDiv.split('\n').filter(item => item.trim() !== '').map(item => item.trim()));
        return targetDiv.split('\n').filter(item => item.trim() !== '').map(item => item.trim());
    }

    // tableId 및 메뉴 파싱
    private parseTableIdAndMenu(): RestaurantInfo | null{
        const restaurantInfo: RestaurantInfo = {};

        if (!this.$) {
            console.error("Cheerio is not initialized.");
            return null;
        }

        // 각 'th.row-label' 선택
        this.$('th.row-label').each((index, header) => {
            const headerText: string = this.$!(header).text().trim();
            let [restaurantName, _, timeOfDay]: string[] = headerText.split(' ');
            timeOfDay = timeOfDay.slice(0, 2);
            // 식당 이름, 시간대 저장
            if (!restaurantInfo[restaurantName]) restaurantInfo[restaurantName] = {};
            restaurantInfo[restaurantName][timeOfDay] = {};

            // 해당 'th.row-label'의 다음 형제 'td' 태그 선택
            let nextElement = this.$!(header).next();
            while (nextElement.length && nextElement[0].name === 'td') {
                const cellId: string | undefined = nextElement.attr('id');
                // 테이블 아이디 저장
                if (cellId) {
                    const tableId: string = cellId.replace('table-', '')
                    const menu = this.parseMenu(tableId);
                    
                    if(menu) restaurantInfo[restaurantName][timeOfDay][tableId] = menu;
                }
                nextElement = nextElement.next();
            }
        });

        return restaurantInfo;
    }

    async test() {
        console.log('test');
        await this.initialize(); // initialize 메소드를 호출하여 cheerio를 초기화
        console.log(this.parseTableIdAndMenu());

    }
}

async function testFunc() {
    const mc = new MenuCrawler('https://www.cbnucoop.com/service/restaurant/');
    await mc.test(); // 비동기 메소드 호출 시 await 추가
}

testFunc();
