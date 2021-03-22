require(["hiage.js/Hiage", "Stage", "hiage.js/core/Game"], function (Hiage, Stage, Game) {
    function main() {
        var aspectRatio = screen.width / screen.height;
        var game = new Game('container', 500, aspectRatio, 1, "data/resources.json");

        var stage = new Stage(game.objectFactory, 500 * aspectRatio, 500, game.messageDispatcher);
        game.pushState(stage);
        stage.initialize();
        game.start();
    }

    var hiage = new Hiage(main);

    hiage.start();
});