import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ButtonHandler')
export class ButtonHandler extends Component {

    private url: string = "https://play.google.com/store/games";

    @property({ type: Number }) // Максимальное количество нажатий
    private maxClicks: number = 10;

    @property({ type: Boolean }) // Флаг для включения/отключения логики
    private enableRedirect: boolean = true;

    private clickCount: number = 0; // Счётчик нажатий

    start() {
        // Сбрасываем счётчик при старте
        this.clickCount = 0;
    }

    public handleClick() {
        if (!this.enableRedirect) {
            return; // Логика отключена
        }

        this.clickCount++; // Увеличиваем счётчик нажатий
        console.log(`Нажатие №${this.clickCount}`);

        // Если достигли максимального количества нажатий
        if (this.clickCount >= this.maxClicks) {
            this.redirect(); // Выполняем редирект
        }
    }

    redirect(){
        if (typeof window !== 'undefined' && window.open) {
            window.open(this.url, "_blank"); // Открывает ссылку в новой вкладке
        } else {
            console.error("Невозможно открыть ссылку в этой среде.");
        }
    }
}


