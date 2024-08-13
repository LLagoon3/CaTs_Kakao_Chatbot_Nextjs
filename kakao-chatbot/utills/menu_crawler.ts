import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { stringify } from 'querystring';
import { Interface } from 'readline';
import DateHandler from "./date_handler"

interface RestaurantInfo {
    [key: string]: { // 날짜
        [key: string]: { // 식당 이름
            [key: string]: string[] // 시간대 : 식사 메뉴
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

    
    private parseDateFromString(dateString: string): string {
        // 현재 년도를 얻습니다.
        const currentYear = new Date().getFullYear();

        // 문자열에서 월과 일을 추출합니다.
        const match = dateString.match(/^(\d{2})\.(\d{2})/);
        
        if (match) {
            const month = parseInt(match[1], 10);
            const day = parseInt(match[2], 10);

            // 현재 년도와 추출한 월, 일을 사용하여 Date 객체를 생성합니다.
            const date = new Date(currentYear, month - 1, day);

            return DateHandler.dateToString(date);
        } else {
            throw new Error('Invalid date format');
        }
    }

    // 해당하는 날짜 파싱
    private parseDate(): string[] | null{
        if (!this.$) {
            console.error("Cheerio is not initialized.");
            return null;
        }
        const targetTh = this.$(`th.weekday-title`);
        const dateArray: string[] = [];
        targetTh.each((index, header) => {
            const headerText: string = this.$!(header).text().trim();
            const parsedDate: string = this.parseDateFromString(headerText);
            if (parsedDate && !dateArray.some((date: string) => date === parsedDate))
                dateArray.push(parsedDate);
        });
        return dateArray;
    }

    // tableId 및 메뉴 파싱
    private parseTableIdAndMenu(): RestaurantInfo | null{
        const restaurantInfo: RestaurantInfo = {};
        const dateArray: string[] | null = this.parseDate();

        if (!this.$) {
            console.error("Cheerio is not initialized.");
            return null;
        }

        else if (!dateArray) {
            console.error("Date not found");
            return null;
        }

        dateArray.forEach((date: string) => {
            restaurantInfo[date] = {};
        });

        // 각 'th.row-label' 선택
        this.$('th.row-label').each((index, header) => {
            const headerText: string = this.$!(header).text().trim();
            let [restaurantName, _, timeOfDay]: string[] = headerText.split(' ');
            timeOfDay = timeOfDay.slice(0, 2);
            // 식당 이름, 시간대 저장
            dateArray.forEach((date: string) => {
                if (!restaurantInfo[date][restaurantName]) restaurantInfo[date][restaurantName] = {};
                restaurantInfo[date][restaurantName][timeOfDay] = [];
            });

            // 해당 'th.row-label'의 다음 형제 'td' 태그 선택
            let nextElement = this.$!(header).next();
            let idx = 0;
            while (nextElement.length && nextElement[0].name === 'td') {
                const cellId: string | undefined = nextElement.attr('id');
                // 테이블 아이디 저장
                if (cellId) {
                    const tableId: string = cellId.replace('table-', '')
                    const menu = this.parseMenu(tableId);
                    
                    if(menu) restaurantInfo[dateArray[idx]][restaurantName][timeOfDay] = menu;
                }
                nextElement = nextElement.next();
                idx++;
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
