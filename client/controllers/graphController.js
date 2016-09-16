angular
  .module('GraphController', ['ngRoute', 'GraphFactory'])
  .controller('GraphController', GraphController);

function GraphController($scope, GraphFactory) {
  GraphFactory.fetch.then(result => {

    // collects the data from the result
    let data = [];
    const users = result.data.users;
    const bucketList = result.data.buckets;
    const joinTable = result.data.joins;

    // parses the Postgres data into the format for the graph
    // [USERNAME, [...bucketListItem]]
    for (let i = 0; i < users.length; i++) {
      const curUser = [];
      curUser.push(users[i].first_name);
      const usersBuckets = [];
      for (let j = 0; j < joinTable.length; j++) {
        if (users[i]._id === joinTable[j].userId) {
          const bucketID = joinTable[j].activityId - 1;
          const toPush = bucketList[bucketID].actname;
          usersBuckets.push(toPush);
        }
      }
      curUser.push(usersBuckets);
      data.push(curUser);
    }

    // initiating the d3 map and
    // making a names array
    // and a paths array
    let buckets = d3.map();
    const names = [];
    const paths = [];
    let bucketID = 0;

    data.forEach((user) => {
      // creates the current user sets their name to the first value
      // in their data array and their paths to empty
      // then adds the user into the names array
      const curUser = { id: 'user' + names.length, name: user[0], paths: [] };
      curUser.relations = [curUser.id];
      names.push(curUser);

      // iterates through the users bucketList items
      user[1].forEach((bucketItem) => {
        // get the bucket item out of the map
        let bucket = buckets.get(bucketItem);

        // if this bucketlist item hasnt been added to the map yet, add it
        if (bucket === undefined) {
          bucket = {
            name: bucketItem,
            id: 'bucket' + bucketID,
            paths: [],
            relations: ['bucket' + bucketID],
          };
          bucketID++;
          buckets.set(bucketItem, bucket);
        }

        // create the path and add it to the array
        const path = { id: 'path' + curUser.id + '-' + bucket.id, names: curUser, buckets: bucket };
        paths.push(path);

        // connecting bucket Item to user
        // and user to bucket Item
        curUser.relations.push(bucket.id);
        curUser.paths.push(path.id);
        bucket.relations.push(curUser.id);
        bucket.paths.push(path.id);
      });
    });

    // changes the data into an object that contains
    // the whole user objects (names)
    // the bucket list items (buckets.values())
    // the paths (paths)
    // parsing the data again
    data = {
      names,
      buckets: buckets.values(),
      paths,
    };
    // reassigns the map to the bucket list items
    buckets = data.buckets;

    // setting up the diameter of the circle
    // width and height of the name rectangles
    // the width of each path from name to bucket item
    // creating a const for the amount of users
    const diameter = 960;
    const rectWidth = 80;
    const rectHeight = 14;
    const pathWidth = '1px';
    const namesLength = data.names.length;

    // setting a transformation scale for the
    // vertical axis of each name
    // takes domain of how many names there are and transforms
    // down to range of how many names * the height of the rect
    // To stack them close together
    // 1.9 so the names don't actually touch
    const scaleNameY = d3.scale.linear()
      .domain([0, namesLength])
      .range([-(namesLength * rectHeight) / 1.9, (namesLength * rectHeight) / 1.9]);

    // Sets a transformation scale for the x value of
    // a bucket item in order to place them an accurate
    // distance from the names
    // using degrees for values to coordinate the correct
    // dstance around the circle
    const mid = (data.buckets.length / 2.0);
    const scaleBucketX = d3.scale.linear()
      .domain([0, mid, mid, data.buckets.length])
      .range([20, 170, 200, 350]);

    // mapping through the bucket items to set an x and y
    // coordinate for each value using the linear scale
    // to set the correct x value
    // diameter / 3.5 signifies the height which coincides
    // with the distance from the center of the circle
    data.buckets = data.buckets.map(function (bucketItem, index) {
      bucketItem.x = scaleBucketX(index);
      bucketItem.y = diameter / Math.PI;
      return bucketItem;
    });

    // mapping through the names to set their x and y
    // coordinate their y value from the linear scale
    // setting x value t0 be half the width of each name
    // and backwards so it centers almost correctly
    // CANT FIND THE MAGIC NUMBER :(
    data.names = data.names.map((name, index) => {
      name.y = scaleNameY(index);
      name.x = -(rectWidth / 2);
      return name;
    });

    // creating a function to project a line to a radial curve
    function projectX(x) {
      return (((x - 90) / 180) * Math.PI) - (Math.PI / 2);
    }

    // Using this to map and project the actual diagonal from a normal space
    // to a radial space in order to make the lines curve well
    // gets the middle of rectangle for the start of the x
    // y is deciding which side of the square to start the path on
    // then it makes a path to the bucket using a custom projection of cos and sin
    // first is positive and second is negative to make the paths correspond to the
    // correct sides of the circle
    const diagonal = d3.svg.diagonal()
      .source((el) => {
        return {
          x: el.names.y + (rectHeight / 2),
          y: el.buckets.x > 180 ? el.names.x : el.names.x + rectWidth,
        };
      })
      .target((el) => {
        return {
          x: el.buckets.y * Math.cos(projectX(el.buckets.x)),
          y: -el.buckets.y * Math.sin(projectX(el.buckets.x)),
        };
      })
      .projection((path) => [path.y, path.x]);

    // creating an array of RGB color Schemes
    // 1 for each user
    // Will be used to color the paths for each user
    // color the users rectangle
    // and color the text of each name
    const colors = [];
    for (let i = 0; i < namesLength; i++) {
      let rgbScheme = 'rgb(';
      for (let j = 0; j < 3; j++) {
        rgbScheme += Math.floor(Math.random() * 256);
        if (j !== 2) {
          rgbScheme += ', ';
        }
      }
      rgbScheme += ')';
      colors.push(rgbScheme);
    }

    // adding the svg element to the graph id
    // setting the height and width to the diameter of the circle
    // translate the svg so that it is center
    let svg = d3.select('#graph').append('svg')
      .attr('width', diameter)
      .attr('height', diameter)
      .append('g')
      .attr('transform', 'translate(' + diameter / 2 + ',' + diameter / 2 + ')');

    // actually appending the paths to all the svg g containers
    // using the diagonal created earlier to map the route for each path
    // sets the stroke color to the color of that users id
    const path = svg.append('g').attr('class', 'paths').selectAll('.path')
      .data(data.paths)
      .enter()
      .append('path')
      .attr('id', (el) => el.id)
      .attr('class', 'path')
      .attr('d', diagonal)
      .attr('stroke', (el) => {
        const userID = Number(el.names.id.replace(/\D+/g, ''));
        return colors[userID];
      })
      .attr('stroke-width', pathWidth);

    // appending each bucketList item to the svg
    // rotates each bucket list item by its x value - 90 to make a circle
    // adds event listener for mouseover and mouse out to highlight the paths
    const bucketListNode = svg.append('g').selectAll('.buckets')
      .data(data.buckets)
      .enter()
      .append('g')
      .attr('class', 'buckets')
      .attr('transform', (el) => 'rotate(' + (el.x - 90) + ')translate(' + el.y + ')')
      .on('mouseover', mouseover)
      .on('mouseout', mouseout);

    // adding a circle to each bucketlist item with a radius of 5
    bucketListNode.append('circle')
      .attr('id', (el) => el.id)
      .attr('r', 5);

    // appending each bucket list items test to each node
    // setting a text anchor based on what side of the circle
    // the item is on to have the text show up outside of the circle
    // then transforming it to be pushed away from the bucket node circles
    // and roating the text 180 degrees if it on the left side so it is rigth side up
    bucketListNode.append('text')
      .attr('id', (el) => el.id + '-txt')
      .attr('dy', '.31em')
      .attr('text-anchor', (el) => el.x < 180 ? 'start' : 'end')
      .attr('transform', (el) => el.x < 180 ? 'translate(10)' : 'rotate(180)translate(-10)')
      .text((el) => el.name);

    // appending each name to the svg
    // translates the x and y of each item
    // switches their x and y coordinates so instead of being
    // a horizontal row they are a vertical column
    const nameNode = svg.append('g').selectAll('.name')
      .data(data.names)
      .enter()
      .append('g')
      .attr('transform', (el) => 'translate(' + el.x + ',' + el.y + ')')
      .on('mouseover', mouseover)
      .on('mouseout', mouseout);

    // appending a rect that will surround the text of each <g>
    // sets the fill color of the rect to the color
    // associated with the users id
    nameNode.append('rect')
      .attr('id', (el) => el.id)
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .attr('fill', (el) => {
        const userID = Number(el.id.replace(/\D+/g, ''));
        return colors[userID];
      });

    // appending each persons name in a <text> to each nameNode
    // anchoring text to center it
    // translating text to bring center it vertically
    // the fill gets the color of the user
    // and inverts the color and applies those inverted colors
    // to the text so the text is easily visible for each rect
    nameNode.append('text')
      .attr('id', (el) => el.id + '-txt')
      .attr('text-anchor', 'middle')
      .attr('transform', 'translate(' + (rectWidth / 2) + ', ' + (rectHeight * 0.85) + ')')
      .attr('fill', (el) => {
        const userID = Number(el.id.replace(/\D+/g, ''));
        const userColor = colors[userID];
        let invert = userColor.split('(')[1].split(')')[0];
        invert = invert.split(', ');
        for (let i = 0; i < invert.length; i++) {
          invert[i] = Number(invert[i]);
          invert[i] = 255 - invert[i];
        }
        const rgbString = 'rgb(' + invert[0] + ', ' + invert[1] + ', ' + invert[2] + ')';
        return rgbString;
      })
      .text((el) => el.name);

    // creating the mouseover Event to change the style when so a user can
    // actually see the connections between names and bucketlist items
    function mouseover(el) {
      // sorts the paths so the highlisted paths will be in the front
      d3.selectAll('.paths .path').sort((a) => el.paths.indexOf(a.id));

      // loops through the relationships of the mousedover 
      // element and updates the relations style
      // if its a name it finds the buckets associated
      // vice verse
      // updates the path for each relationship also
      for (let i = 0; i < el.relations.length; i++) {
        d3.select('#' + el.relations[i])
          .classed('highlight', true);
        d3.select('#' + el.relations[i] + '-txt')
          .attr('font-weight', 'bold');
        d3.select('#' + el.paths[i])
          .attr('stroke-width', '6px');
      }
    }

    // when a mouse leaves an element it goes and loops through and reverses the changes made
    function mouseout(el) {
      for (let i = 0; i < el.relations.length; i++) {
        d3.select('#' + el.relations[i])
          .classed('highlight', false);
        d3.select('#' + el.relations[i] + '-txt')
          .attr('font-weight', 'normal');
        d3.select('#' + el.paths[i])
          .attr('stroke-width', pathWidth);
      }
    }
  });
}
