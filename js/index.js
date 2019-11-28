Physics(function(world){

    var viewWidth = window.innerWidth;
    var viewHeight = window.innerHeight;
  /*
    var renderer = Physics.renderer('canvas', {
      el: 'viewport',
      width: viewWidth,
      height: viewHeight,
      meta: false, // don't display meta data
      styles: {
          // set colors for the circle bodies
          'circle' : {
              strokeStyle: '#351024',
              lineWidth: 1,
              fillStyle: '#d33682',
              angleIndicator: '#351024'
          }
      }
    });
*/
    var domrenderer = Physics.renderer('dom', {
        el: 'viewport',
        width: viewWidth,
        height: viewHeight,
        meta: true, // don't display meta data
        styles: {
            // set colors for the circle bodies
            'circle' : {
                strokeStyle: '#351024',
                lineWidth: 1,
                fillStyle: '#d33682',
                angleIndicator: '#351024'
            },
            'rectangle' : {
                strokeStyle: '#351024',
            }
        }
    });
  
    // add the renderer
    // world.add( renderer );
    world.add( domrenderer );
    // render on each step
    world.on('step', function(){
      world.render();
    });
  
    // bounds of the window
    var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);
  
    // constrain objects to these bounds
    world.add(Physics.behavior('edge-collision-detection', {
        aabb: viewportBounds,
        restitution: 0.99,
        cof: 0.99
    }));
    world.add(Physics.behavior('body-collision-detection', {
        check: true
    }));

    world.add(
        Physics.body('rectangle', {
          width: 100,
          height: 100,
          x: 100, // x-coordinate
          y: 100, // y-coordinate
          vx: 0.2, // velocity in x-direction
          vy: 0, // velocity in y-direction
        })
    );
    world.add(
        Physics.body('rectangle', {
          width: 200,
          height: 150,
          x: 300, // x-coordinate
          y: 100, // y-coordinate
          vx: 0.2, // velocity in x-direction
          vy: 0, // velocity in y-direction
        })
    );
    world.add(
        Physics.body('rectangle', {
          width: 200,
          height: 300,
          x: 200, // x-coordinate
          y: 300, // y-coordinate
          vx: 0.2, // velocity in x-direction
          vy: 0, // velocity in y-direction
        })
    );
  
    // ensure objects bounce when edge collision is detected
    world.add( Physics.behavior('body-impulse-response') );
  
    // add some gravity
    world.add( Physics.behavior('constant-acceleration', {
        acc: { x: 0, y: -0.0004 }
    }) );
  
    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time, dt ){
  
        world.step( time );
    });
  
    // start the ticker
    Physics.util.ticker.start();
  
  });