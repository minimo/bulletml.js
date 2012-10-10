// BulletMLファイル
var xmlFiles = [ "sample-assets/[1943]_rolling_fire.xml",
        "sample-assets/[G_DARIUS]_homing_laser.xml",
        "sample-assets/[Guwange]_round_2_boss_circle_fire.xml",
        "sample-assets/[Guwange]_round_3_boss_fast_3way.xml",
        "sample-assets/[Guwange]_round_4_boss_eye_ball.xml",
        "sample-assets/[Progear]_round_1_boss_grow_bullets.xml",
        "sample-assets/[Progear]_round_2_boss_struggling.xml",
        "sample-assets/[Progear]_round_3_boss_back_burst.xml",
        "sample-assets/[Progear]_round_3_boss_wave_bullets.xml",
        "sample-assets/[Progear]_round_4_boss_fast_rocket.xml",
        "sample-assets/[Progear]_round_5_boss_last_round_wave.xml",
        "sample-assets/[Progear]_round_5_middle_boss_rockets.xml",
        "sample-assets/[Progear]_round_6_boss_parabola_shot.xml",
        "sample-assets/[Psyvariar]_X-A_boss_opening.xml",
        "sample-assets/[Psyvariar]_X-B_colony_shape_satellite.xml",
        "sample-assets/[XEVIOUS]_garu_zakato.xml" ];

enchant();
window.onload = function() {
    var game = new Game();
    game.fps = 60;
    var assets = [ "sample-assets/chara0.png", "sample-assets/chara6.png",
            "sample-assets/explosion.png" ];
    game.preload(assets.concat(xmlFiles));
    game.onload = function() {
        // var scene = game.rootScene;
        var scene = (function() {
            var result = new CanvasGroup();
            game.rootScene.addChild(result);
            return result;
        })();
        scene.backgroundColor = "#000044";

        // 自機
        var player = new Sprite(32, 32);
        player.image = game.assets["sample-assets/chara0.png"];
        player.frame = 33;
        player.frameCount = 0;
        player.x = 160;
        player.y = game.height - 32 - player.height;
        player.speed = 2;
        player.on("enterframe", function() {
            // テクテク歩く
            if (this.age % 10 === 0) {
                this.frame = [ 33, 34, 35, 34 ][(this.frameCount += 1) % 4];
            }

            // 自機中心マーカーを移動させる
            playerCenter.x = this.x + (this.width - playerCenter.width) / 2;
            playerCenter.y = this.y + (this.height - playerCenter.height) / 2;
        });
        scene.addChild(player);
        // 自機の中心マーカー
        var playerCenter = new Sprite(8, 8);
        (function() {
            playerCenter.image = new Surface(8, 8);
            var c = playerCenter.image.context;
            var g = c.createRadialGradient(4, 4, 0, 4, 4, 4);
            g.addColorStop(0.0, "#ffffff");
            g.addColorStop(0.5, "#aaffaa");
            g.addColorStop(1.0, "rgba(0,255,0,0)");
            c.fillStyle = g;
            c.fillRect(0, 0, 8, 8);
        })();
        scene.addChild(playerCenter);

        // 敵
        var enemy = new Sprite(32, 32);
        enemy.image = game.assets["sample-assets/chara6.png"];
        enemy.frame = 3;
        enemy.frameCount = 0;
        enemy.x = (game.width - enemy.width) / 2;
        enemy.y = 32;
        enemy.on("enterframe", function() {
            // テクテク歩く
            if (this.age % 10 === 0) {
                this.frame = [ 3, 4, 5, 4 ][(this.frameCount += 1) % 4];
            }
        });
        scene.addChild(enemy);

        // 攻撃パターン
        var attackPattern = new AttackPattern(game.assets[xmlFiles[~~(Math
                .random() * xmlFiles.length)]]);
        // 攻撃パターン設定
        var config = {
            target : player, // 攻撃対象
            bulletFactory : function(spec) { // 弾Spriteの生成関数
                var bullet = new enchant.Sprite(8, 8);
                bullet.image = enchant.Surface
                        .load(enchant.bulletml.DEFAULT_IMAGE);
                bullet.on("enterframe", function() {
                    // 衝突判定（自機と弾との距離が4未満）
                    var x1 = this.x + this.width / 2;
                    var y1 = this.y + this.height / 2;
                    var x2 = player.x + player.width / 2;
                    var y2 = player.y + player.height / 2;
                    var dx = (x1 - x2) * (x1 - x2);
                    var dy = (y1 - y2) * (y1 - y2);
                    if (dx + dy < 4 * 4) {
                        this.parentNode.removeChild(this);
                        explode(x1, y1);
                    }
                });
                return bullet;
            }
        };

        // enterframeイベントリスナを作成
        var ticker = attackPattern.createTicker(config);

        // 作成したenterframeイベントリスナを敵機にセット
        enemy.on("enterframe", ticker);

        // 攻撃完了時の処理
        enemy.on("completeAttack", function() {
            // 攻撃パターンさしかえ
            this.removeEventListener(ticker);
            var xml = xmlFiles[~~(Math.random() * xmlFiles.length)];
            console.log(xml);
            attackPattern = new AttackPattern(game.assets[xml]);
            ticker = attackPattern.createTicker(config);
            this.on("enterframe", ticker);
            // ticker.restart();
        });

        // タッチ操作用パネル
        var ctrlPanel = new Sprite(game.width, game.height);
        ctrlPanel.sense = 1.5;
        ctrlPanel.on("touchstart", function(e) {
            this.startX = e.x;
            this.startY = e.y;
            this.startPlayerX = player.x;
            this.startPlayerY = player.y;
        });
        ctrlPanel.on("touchmove", function(e) {
            player.x = this.startPlayerX + (e.x - this.startX) * this.sense;
            player.y = this.startPlayerY + (e.y - this.startY) * this.sense;

            if (player.x < 0) {
                player.x = this.startPlayerX = 0;
                this.startX = e.x;
            } else if (game.width - player.width < player.x) {
                player.x = this.startPlayerX = game.width - player.width;
                this.startX = e.x;
            }
            if (player.y < 0) {
                player.y = this.startPlayerY = 0;
                this.startY = e.y;
            } else if (game.height - player.height < player.y) {
                player.y = this.startPlayerY = game.height - player.height;
                this.startY = e.y;
            }
        });
        game.rootScene.addChild(ctrlPanel);

        // 爆発
        var explode = function(x, y) {
            var e = new Sprite(32, 32);
            e.x = x - 16;
            e.y = y - 16;
            e.scale(2);
            e.rotate(Math.random() * 360);
            e.image = game.assets["sample-assets/explosion.png"];
            e.on("enterframe", function() {
                this.frame += 1;
                if (64 <= this.frame) {
                    this.removeEventListener("enterframe", arguments.callee);
                    this.parentNode.removeChild(this);
                }
            });
            scene.addChild(e);
        };

    };
    game.start();
};
