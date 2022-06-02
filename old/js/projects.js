Physics(function(world){

    var viewWidth = window.innerWidth;
    var viewHeight = window.innerHeight - 100;
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
    var viewportBounds = Physics.aabb(0, 65, viewWidth, viewHeight);
  
    // constrain objects to these bounds
    world.add(Physics.behavior('edge-collision-detection', {
        aabb: viewportBounds,
        restitution: 0.5,
        cof: 0.5
    }));
    world.add(Physics.behavior('body-collision-detection', {
        check: true,
        restitution: 0.1,
        cof: 0.1,
    }));

    world.add(
        Physics.body('circle', {
          x: 100, // x-coordinate
          y: 100, // y-coordinate
          vx: 0, // velocity in x-direction
          vy: 0.2, // velocity in y-direction
          radius: window.innerWidth * 0.10,
        })
    );
    world.add(
        Physics.body('circle', {
          x: 300, // x-coordinate
          y: 100, // y-coordinate
          vx: 0.2, // velocity in x-direction
          vy: 0, // velocity in y-direction
          radius: window.innerWidth * 0.15,
        })
    );
    world.add(
        Physics.body('circle', {
          x: 200, // x-coordinate
          y: 300, // y-coordinate
          vx: 0, // velocity in x-direction
          vy: 0, // velocity in y-direction
          radius: window.innerWidth * 0.12,
        })
    );
    world.add(Physics.behavior('attractor', {
        order: 0,
        strength: 0.0005,
        pos: Physics.vector(window.innerWidth/2, window.innerHeight/2),
    }));
  
    // ensure objects bounce when edge collision is detected
    world.add( Physics.behavior('body-impulse-response') );
  
    // add some gravity
    world.add( Physics.behavior('constant-acceleration', {
        acc: { x: 0, y: -0.000 }
    }) );

    window.addEventListener('resize', function () {

        // as of 0.7.0 the renderer will auto resize... so we just take the values from the renderer
        viewportBounds = Physics.aabb(0, 0, window.innerWidth, window.innerHeight - 100);
        // update the boundaries
        edgeBounce.setAABB(viewportBounds);
        

    }, true);
  
    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time, dt ){
  
        world.step( time );
    });
  
    // start the ticker
    Physics.util.ticker.start();
  
  });