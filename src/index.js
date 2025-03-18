import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card instanceof Duck;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}

// Новый базовый класс Creature
class Creature extends Card {
    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}

// Класс Duck наследуется от Creature
class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }
}

// Класс Dog наследуется от Creature
class Dog extends Creature {
    constructor() {
        super('Пес-бандит', 3);
    }
}

// Класс Trasher наследуется от Dog
class Trasher extends Dog {
    constructor() {
        super();
        this.name = 'Громила';
        this.power = 5;
    }

    getDescriptions() {
        return [
            'Получает на 1 меньше урона',
            ...super.getDescriptions()
        ];
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
        });
    }
}

// Новый класс Gatling
class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }

    attack(gameContext, continuation) {
        const { oppositePlayer } = gameContext;
        const targets = oppositePlayer.table;

        const taskQueue = new TaskQueue();

        // По очереди наносим 2 урона каждой карте противника
        for (const card of targets) {
            taskQueue.push(
                () => this.dealDamageToCreature(2, card, gameContext, taskQueue.continueWith),
                null,
                200 // Задержка между атаками
            );
        }

        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        const count = this.getInGameCount();
        return (count * (count + 1)) / 2;
    }

    constructor() {
        super();
        this.name = 'Браток';
        this.power = 2;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        super.doBeforeRemoving(gameContext, continuation);
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        const bonus = Lad.getBonus();
        super.modifyDealedDamageToCreature(value + bonus, toCard, gameContext, continuation);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        const bonus = Lad.getBonus();
        super.modifyTakenDamage(value - bonus, fromCard, gameContext, continuation);
    }

    getDescriptions() {
        const descriptions = super.getDescriptions();
        if (
            Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') ||
            Lad.prototype.hasOwnProperty('modifyTakenDamage')
        ) {
            descriptions.unshift('Чем их больше, тем они сильнее');
        }
        return descriptions;
    }
}


// Колода Шерифа
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];

// Колода Бандита
const banditStartDeck = [
    new Lad(),
    new Lad()
];

// Создание и запуск игры
const game = new Game(seriffStartDeck, banditStartDeck);
SpeedRate.set(1);
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
