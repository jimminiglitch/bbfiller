// public/js/window-physics.js
import Matter from 'matter-js';
const engine = Matter.Engine.create();
const world = engine.world;
// for each .window element:
const body = Matter.Bodies.rectangle(x, y, w, h, { frictionAir:0.2 });
Matter.World.add(world, body);
Matter.Engine.run(engine);
// On pointermove: Matter.Body.setPosition(body, { x:mouseX, y:mouseY });