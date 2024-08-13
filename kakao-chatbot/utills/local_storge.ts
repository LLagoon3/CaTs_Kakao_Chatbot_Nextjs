import { error } from 'node:console';
import * as fs from 'node:fs';
import * as path from 'path';

// 로컬 저장소에 데이터 입출력 클래스
export default class LocalStorge {
    private readonly storgePath: string;
    constructor(_path: string) {
        this.storgePath = path.join(_path, 'session-data.json');
    }

    // 오브젝트 데이터 저장
    setItem(item: object): void{
        try {
            fs.writeFileSync(this.storgePath, JSON.stringify(item));
            console.log('save : ', this.storgePath);
        } catch(error) {
            console.error(error);
        }
    }

    // 오브젝트 데이터 반환
    getItem(): object | null {
        try {
            const item: object = JSON.parse(fs.readFileSync(this.storgePath, 'utf8') as string);
            return item;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}
