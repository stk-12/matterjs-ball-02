
// 使用モジュール
const Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  Events = Matter.Events;

// エンジンの生成
const engine = Engine.create();
const world = engine.world;

// セッティング
const settings = {
  ball: {
    radius: 50,
    options: {
      restitution: 0.9,
      render: {
        sprite: {
          texture: './ball.png',
          xScale: 0.5,
          yScale: 0.5
        }
      }
    }
  },
  wall: {
    size: 20,
    options: { isStatic: true, render: { opacity: 0 } }
  },
  pin: {
    radius: 30,
    options: { isStatic: true, render: { fillStyle: '#ffffff' } }
  },
  resetPositions: {
    ball1: { x: window.innerWidth / 2, y: window.innerHeight / 4 },
    ball2: { x: window.innerWidth / 2, y: window.innerHeight - 50 }
  }
}

// レンダラーの生成
const render = Render.create({
  element: document.querySelector('.js-canvas'),
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false, // ワイヤーフレーム
    background: null, // 背景色を透明
  }
});

// ボールの生成
const ball1 = Bodies.circle(settings.resetPositions.ball1.x, settings.resetPositions.ball1.y, settings.ball.radius, settings.ball.options);
const ball2 = Bodies.circle(settings.resetPositions.ball2.x, settings.resetPositions.ball2.y, settings.ball.radius, settings.ball.options);

// 壁とピンの生成
const createWallsAndPins = () => [
  Bodies.rectangle(window.innerWidth / 2, 0, window.innerWidth, settings.wall.size, settings.wall.options), // 上の壁
  Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, settings.wall.size, settings.wall.options), // 下の壁
  Bodies.rectangle(window.innerWidth, window.innerHeight / 2, settings.wall.size, window.innerHeight, settings.wall.options), // 右の壁
  Bodies.rectangle(0, window.innerHeight / 2, settings.wall.size, window.innerHeight, settings.wall.options), // 左の壁
  Bodies.circle(window.innerWidth / 4, window.innerHeight / 2, settings.pin.radius, settings.pin.options),
  Bodies.circle(window.innerWidth - window.innerWidth / 4, window.innerHeight / 2, settings.pin.radius, settings.pin.options)
];

// ワールドにすべてのボディ（オブジェクト）を追加
Composite.add(world, [ball1, ball2, ...createWallsAndPins()]);


// マウス制御
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
        visible: false
    }
  }
});
Composite.add(world, mouseConstraint);
render.mouse = mouse;


// レンダラーとエンジンの実行
Render.run(render);
var runner = Runner.create();
Runner.run(runner, engine);

// 画面外に出たボールの位置リセット関数
const resetBallPosition = (ball, position) => {
  Matter.Body.setPosition(ball, position);
  Matter.Body.setVelocity(ball, { x: 0, y: 0 });
};

// 画面外にボールが出た場合
// ボールが画面外に出た場合のイベント
Events.on(engine, 'beforeUpdate', function() {
  if (ball1.position.x < 0 || ball1.position.x > window.innerWidth || 
    ball1.position.y < 0 || ball1.position.y > window.innerHeight) {
    setTimeout(() => resetBallPosition(ball1, settings.resetPositions.ball1), 1000);
  }
  if (ball2.position.x < 0 || ball2.position.x > window.innerWidth || 
    ball2.position.y < 0 || ball2.position.y > window.innerHeight) {
    setTimeout(() => resetBallPosition(ball2, settings.resetPositions.ball1), 1000);
  }
});


document.addEventListener('click', (event) => {
  // クリック位置を取得
  const mousePosition = { x: event.clientX, y: event.clientY };

  // クリック位置がボールの範囲内にあるかチェック
  const clickedBodies = Matter.Query.point([ball1, ball2], mousePosition);

  clickedBodies.forEach((ball) => {
    // ボールの中心位置とクリック位置の差をベクトルで取得
    const deltaX = ball.position.x - mousePosition.x; // x方向を反転
    const deltaY = ball.position.y - mousePosition.y; // y方向を反転
    const forceMagnitude = 0.02; // 力の大きさ

    const force = { x: deltaX * forceMagnitude, y: deltaY * forceMagnitude };
    Matter.Body.applyForce(ball, ball.position, force);
  });
});

// リサイズ設定
window.addEventListener('resize', () => {
  render.options.width = window.innerWidth;
  render.options.height = window.innerHeight;
  render.canvas.width = window.innerWidth;
  render.canvas.height = window.innerHeight;

  Composite.clear(world, false, true);
  Composite.add(world, [ball1, ball2, ...createWallsAndPins()]);
});