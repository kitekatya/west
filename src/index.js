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

// Колода Шерифа
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Gatling(),
];

// Колода Бандита
const banditStartDeck = [
    new Trasher(),
    new Dog(),
    new Dog(),
];

// Создание и запуск игры
const game = new Game(seriffStartDeck, banditStartDeck);
SpeedRate.set(1);
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
