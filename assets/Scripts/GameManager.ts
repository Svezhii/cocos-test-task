import { _decorator, Component, Prefab, instantiate, Node, Label, CCInteger, Vec3 } from 'cc';
import { PlayerController } from "./PlayerController";
const { ccclass, property } = _decorator;

enum BlockType{
    BT_NONE,
    BT_STONE,
};

enum GameState{
    GS_INIT,
    GS_PLAYING,
    GS_END,
};

@ccclass("GameManager")
export class GameManager extends Component {

    @property({type: Prefab})
    public cubePrfb: Prefab | null = null;
    @property({type: CCInteger})
    public roadLength: number = 15;
    private _road: BlockType[] = [];
    @property({type: Node})
    public startMenu: Node | null = null;
    @property({type: PlayerController})
    public playerCtrl: PlayerController | null = null;
    @property({type: Label})
    public stepsLabel: Label | null = null!;

    private stepsCounter: number = 10; //счётчик для генерации новый кубов

    start () {
        this.curState = GameState.GS_INIT;
        this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this);

        if (this.playerCtrl) {
            this.playerCtrl.node.on("PlayerJumped", this.onPlayerJumped, this); //подписываемся на события для обратного счётчика
        }
    }

    init() {
        if (this.startMenu) {
            this.startMenu.active = true;
        }
        this.generateRoad();

        if(this.playerCtrl){            
            this.playerCtrl.setInputActive(false);
            this.playerCtrl.node.setPosition(Vec3.ZERO);
            this.playerCtrl.reset();
        }
    }

    set curState (value: GameState) {
        switch(value) {
            case GameState.GS_INIT:
                this.init();
                break;
            case GameState.GS_PLAYING: 
                if (this.startMenu) {
                    this.startMenu.active = false;
                }

                if (this.stepsLabel) {
                    this.stepsLabel.string = '0';
                }
                setTimeout(() => { 
                    if (this.playerCtrl) {
                        this.playerCtrl.setInputActive(true);
                    }
                }, 0.1);
                break;
            case GameState.GS_END:
                break;
        }
    }

    generateRoad() {        
        this.node.removeAllChildren();
        this._road = [];

        this._road.push(BlockType.BT_STONE);

        this.addBlocks(this.roadLength);

        this.createRoad();
    }
        
    addBlocks(count: number) {
        for (let i = 1; i < count; i++) {
            if (this._road[this._road.length - 1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
            } else {
                this._road.push(Math.floor(Math.random() * 2));
            }
        }
    }

    createRoad() {
        let linkedBlocks = 0;
        // Начинаем с текущей длины дороги, чтобы не пересоздавать старые блоки
        for (let j = this._road.length - this.roadLength; j < this._road.length; j++) {
            if (this._road[j]) {
                ++linkedBlocks;
            }
            if (this._road[j] == 0) {
                if (linkedBlocks > 0) {
                    this.spawnBlockByCount(j - 1, linkedBlocks);
                    linkedBlocks = 0;
                }
            }
            if (this._road.length == j + 1) {
                if (linkedBlocks > 0) {
                    this.spawnBlockByCount(j, linkedBlocks);
                    linkedBlocks = 0;
                }
            }
        }
    }

    extendRoad() {
        const currentLength = this._road.length; // Текущая длина дороги
        this.addBlocks(this.roadLength); // Добавляем новые блоки
        this.createRoad(); // Создаём дорогу на основе обновлённого массива
    }

    spawnBlockByCount(lastPos: number, count: number) {
        let block: Node|null = this.spawnBlockByType(BlockType.BT_STONE); 
        if(block) {
            this.node.addChild(block);
            block?.setScale(count, 1, 1);
            block?.setPosition(lastPos - (count - 1) * 0.5, -1.5, 0);
        }
    }
    spawnBlockByType(type: BlockType) {
        if (!this.cubePrfb) {
            return null;
        }

        let block: Node|null = null;
        switch(type) {
            case BlockType.BT_STONE:
                block = instantiate(this.cubePrfb);
                break;
        }

        return block;
    }

    onStartButtonClicked() {
        this.curState = GameState.GS_PLAYING;
    }

    checkResult(moveIndex: number) {
        if (this._road[moveIndex] == BlockType.BT_NONE) {
            this.curState = GameState.GS_INIT;
        }
    }

    onPlayerJumpEnd(moveIndex: number) {
        if (this.stepsLabel) {
            this.stepsLabel.string = '' + (moveIndex >= this._road.length ? this._road.length : moveIndex);
        }
        this.checkResult(moveIndex);
    }

    updateStepsCounter(step: number) {
        this.stepsCounter -= step; // Уменьшаем счётчик на количество шагов
    
        if (this.stepsCounter <= 0) {
            this.extendRoad(); // Удлиняем дорогу
            this.stepsCounter = 10; // Сбрасываем счётчик
        }
    }

    onPlayerJumped(step: number) {
        // Логика обработки прыжка
        this.updateStepsCounter(step);
    }
}