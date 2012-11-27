
n(){
    var Tetrical = {};
    
    var PIECE_TYPE_INDEXES = ['I', 'L', 'J', 'O', 'S', 'T', 'Z'],
    PIECE_TYPES = {
        I: {
            type: 'I',
            bg: '#330099',
            border: '#AA80FE'
        },
        L: {
            type: 'L',
            bg: '#00CC00',
            border: '#80FE80'
        },
        J: {
            type: 'J',
            bg: '#FF9900',
            border: '#FECC80'
        },
        O: {
            type: 'O',
            bg: '#660099',
            border: '#D580FE'
        },
        S: {
            type: 'S',
            bg: '#FF0000',
            border: '#FE8080'
        },
        T: {
            type: 'T',
            bg: '#009999',
            border: '#80FFFE'
        },
        Z: {
            type: 'Z',
            bg: '#603311',
            border: '#CD661D'
        }
    },
    // Lump sorting function on left offset (x)
    sortLumpsOnLeft = function (a, b) {
        return a.x > b.x ? 1 :
        (a.x < b.x ? - 1 : 0);
    },
    // Lump sorting function on top offset (y)
    sortLumpsOnTop = function(a, b) {
        return a.y > b.y ? 1 :
        (a.y < b.y ? - 1 : sortLumpsOnLeft(a, b));
    },
    // Pieces sorting function on Maximum left offset
    sortPiecesOnMaxLeft = function(a, b) {
        var aL = a.maxLeft, bL = b.maxLeft();
        return aL > bL ? 1 :
        (aL < bL ? -1 : 0);
    };
    
    Tetrical.ImageLoader = function(sources, loadedCallback) {
        if(sources.length === 0)
            loadedCallback([]);

        var loaded = 0,
        images = {
            count: sources.length
        },
        i,
        max = sources.length;
        var imgLoaded = function() {
            loaded += 1;

            // All images loaded?
            if (loaded === images.count) {
                loadedCallback(images);
            }
        };

        for (i = 0; i < max; i++) {
            var img = new Image();
            img.onload = imgLoaded;
            var splitRes = sources[i].split('/');
            img.src = sources[i];
            images[splitRes[splitRes.length-1]] = img;
        }
    };
    
    Tetrical.DrawableElement = function(x, y, width, height) {
        // Return object
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    }
    
    Tetrical.Point = function(x, y) {
        // Return object
        return {
            x: x,
            y: y
        };
    }
    
    Tetrical.BorderedSquare = function (x, y, width, height, stroke, fill, lineWidth) {
        // Define "Superclass"
        var that = new Tetrical.DrawableElement(x, y, width, height);

        // Define properties
        that.stroke = stroke;
        that.fill = fill;
        that.lineWidth = lineWidth;

        // Define methods
        that.draw = function( ctx ) {
            ctx.fillStyle = that.fill;
            ctx.strokeStyle = that.stroke;
            ctx.lineWidth = that.lineWidth;

            ctx.fillRect(that.x, that.y, that.width, that.height);
            ctx.strokeRect(that.x + that.lineWidth / 2, that.y + that.lineWidth / 2, that.width - that.lineWidth, that.height - that.lineWidth);
        };

        that.getOffset = function() {
            return {
                x: that.x,
                y: that.y
            };
        };

        // Required, returns our extended object
        return that;
    }
    
    Tetrical.Lump = function(x, y, width, height, pos, stroke, fill) {

        // Define "Superclass"
        var that = new Tetrical.BorderedSquare(x, y, width, height, stroke, fill, 4);

        // Define methods
        that.updatePos = function( x, y ) {
            that.x = x;
            that.y = y;
        };

        that.getOffset = function() {
            return {
                x: that.x,
                y: that.y
            };
        };

        that.bumpDown = function(offset) {
            that.y += offset === undefined ? 20 : offset;
        };

        that.bumpLeft = function() {
            that.x -= 20;
        };

        that.bumpRight = function() {
            that.x += 20;
        };

        that.draw = function(ctx) {
            // Draw background
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = that.fill;
            ctx.fillRect(that.x, that.y, that.width, that.height);

            // Draw border
            ctx.globalAlpha = 1;
            ctx.strokeStyle = that.stroke;
            ctx.lineWidth = 1;
            ctx.strokeRect(that.x, that.y, that.width, that.height);
        };

        // Required, return our superclass
        return that;
    }

    Tetrical.ThemedLump = function(x, y, width, height, pos, imgId) {
        // Define superclass
        var sup = new Tetrical.Lump(x, y, width, height, pos, undefined, undefined);

        // Define methods
        sup.draw = function(ctx) {
            ctx.drawImage(THUMBS[imgId], sup.x, sup.y, sup.width, sup.height);
        };

        // Return extended object
        return sup;
    }
    
    Tetrical.Piece = function(x, y, type, gridBounds) {
        // Define "Superclass"
        var sup = new Tetrical.DrawableElement(x, y, 0, 0);

        // Define properties here
        sup.type = type;
        sup.moveable = true;
        sup.turnState = 0;
        sup.gridBounds = gridBounds;

        // Define fields
        var lumps = [],
        i,
        oldState,
        oldTurn;

        // Helper functions
        sup.initLumps = function(x, y) {
            var points = [];

            switch ( type.type ) {

                // Defines basetype for I-element
                case PIECE_TYPES.I.type:
                    switch(sup.turnState) {
                        case 0:
                            points = [new Tetrical.Point(x, y), new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 40, y), new Tetrical.Point(x + 60, y)];
                            break;
                        case 1:
                            points = [new Tetrical.Point(x + 20, y - 20), new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 20, y + 20), new Tetrical.Point(x + 20, y + 40)];
                            break;
                        case 2:
                            points = [new Tetrical.Point(x + 40, y), new Tetrical.Point(x + 20, y), new Tetrical.Point(x, y), new Tetrical.Point(x - 20, y)];
                            break;
                        case 3:
                            points = [new Tetrical.Point(x + 20, y + 20), new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 20, y - 20), new Tetrical.Point(x + 20, y - 40)];
                            break;
                    }
                    break;

                case PIECE_TYPES.J.type:
                    switch(sup.turnState) {
                        case 0:
                            points = [new Tetrical.Point(x, y), new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 40, y), new Tetrical.Point(x + 40, y + 20)];
                            break;
                        case 1:
                            points = [new Tetrical.Point(x + 20, y - 20), new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 20, y + 20), new Tetrical.Point(x, y + 20)];
                            break;
                        case 2:
                            points = [new Tetrical.Point(x + 40, y), new Tetrical.Point(x + 20, y), new Tetrical.Point(x, y), new Tetrical.Point(x, y - 20)];
                            break;
                        case 3:
                            points = [new Tetrical.Point(x + 20, y + 20), new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 40, y - 20), new Tetrical.Point(x + 20, y - 20)];
                            break;
                    }
                    break;

                case PIECE_TYPES.L.type:
                    switch(sup.turnState) {
                        case 0:
                            points = [new Tetrical.Point(x, y), new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 40, y), new Tetrical.Point(x, y + 20)];
                            break;
                        case 1:
                            points = [new Tetrical.Point(x + 20, y - 20), new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 20, y + 20), new Tetrical.Point(x, y - 20)];
                            break;
                        case 2:
                            points = [new Tetrical.Point(x + 40, y), new Tetrical.Point(x + 20, y), new Tetrical.Point(x, y), new Tetrical.Point(x + 40, y - 20)];
                            break;
                        case 3:
                            points = [new Tetrical.Point(x + 20, y + 20), new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 20, y - 20), new Tetrical.Point(x + 40, y + 20)];
                            break;
                    }
                    break;

                case PIECE_TYPES.O.type:
                    points = [new Tetrical.Point(x, y), new Tetrical.Point(x + 20, y), new Tetrical.Point(x, y + 20), new Tetrical.Point(x + 20, y + 20)];
                    break;

                case PIECE_TYPES.S.type:
                    switch(sup.turnState) {
                        case 0:
                            points = [new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 40, y), new Tetrical.Point(x, y + 20), new Tetrical.Point(x + 20, y + 20)];
                            break;
                        case 1:
                            points = [new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 20, y + 20), new Tetrical.Point(x, y - 20), new Tetrical.Point(x, y)];
                            break;
                        case 2:
                            points = [new Tetrical.Point(x + 20, y), new Tetrical.Point(x, y), new Tetrical.Point(x + 40, y - 20), new Tetrical.Point(x + 20, y - 20)];
                            break;
                        case 3:
                            points = [new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 20, y - 20), new Tetrical.Point(x + 40, y + 20), new Tetrical.Point(x + 40, y)];
                            break;
                    }
                    break;

                case PIECE_TYPES.T.type:
                    switch(sup.turnState) {
                        case 0:
                            points = [new Tetrical.Point(x, y), new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 40, y), new Tetrical.Point(x + 20, y + 20)];
                            break;
                        case 1:
                            points = [new Tetrical.Point(x + 20, y - 20), new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 20, y + 20), new Tetrical.Point(x, y)];
                            break;
                        case 2:
                            points = [new Tetrical.Point(x + 40, y), new Tetrical.Point(x + 20, y), new Tetrical.Point(x, y), new Tetrical.Point(x + 20, y - 20)];
                            break;
                        case 3:
                            points = [new Tetrical.Point(x + 20, y + 20), new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 20, y - 20), new Tetrical.Point(x + 40, y)];
                            break;
                    }
                    break;

                case PIECE_TYPES.Z.type:
                    switch(sup.turnState) {
                        case 0:
                            points = [new Tetrical.Point(x, y), new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 20, y + 20), new Tetrical.Point(x + 40, y + 20)];
                            break;
                        case 1:
                            points = [new Tetrical.Point(x + 20, y - 20), new Tetrical.Point(x + 20, y), new Tetrical.Point(x, y), new Tetrical.Point(x, y + 20)];
                            break;
                        case 2:
                            points = [new Tetrical.Point(x + 40, y), new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 20, y - 20), new Tetrical.Point(x, y - 20)];
                            break;
                        case 3:
                            points = [new Tetrical.Point(x + 20, y + 20), new Tetrical.Point(x + 20, y), new Tetrical.Point(x + 40, y), new Tetrical.Point(x + 40, y - 20)];
                            break;
                    }
                    break;

                default:
                    break;
            }

            for (i = 0; i < points.length; i++) {
                lumps.push(new Tetrical.Lump(points[i].x, points[i].y, 20, 20, i + 1, type.border, type.bg));
            }
        };

        sup.initLumps(sup.x, sup.y);

        function printArray(a) {
            var output = '', max = a.length;
            for (var i=0; i < max; i++) {
                output += a[i].x + ':' + a[i].y + '\n';
            }
            return output;
        }

        function getBase(upper, lefter) {
            var lefts = [],
            points = [],
            i = 0;

            // Get all offsets
            for (i = 0; i < lumps.length; i++) {
                if (lefter === undefined && !upper) {
                    lefts.push(new Tetrical.Point(lumps[i].x, lumps[i].y + 20));
                } else if (!upper) {
                    lefts.push(new Tetrical.Point(lumps[i].x + 20, lumps[i].y));
                } else {
                    lefts.push(new Tetrical.Point(lumps[i].x, lumps[i].y));
                }
            }

            // Filter offsets
            for (i = 0; i < lefts.length; i++) {
                var currentLeft = lefts[i],
                y = 0,
                exists = false;
                for (y = 0; y < points.length; y++) {
                    if((lefter === undefined && points[y].x === currentLeft.x) ||
                        (lefter && (points[y].y === currentLeft.y))
                        ) {
                        exists = true;
                        if (lefter === undefined) {
                            if ((upper && points[y].y > currentLeft.y) || (!upper && points[y].y < currentLeft.y)) {
                                points[y].y = currentLeft.y;
                            }
                        } else {
                            if (upper && points[y].x > currentLeft.x) {
                                points[y].x = currentLeft.x;
                            }
                            if (!upper && points[y].x < currentLeft.x) {
                                points[y].x = currentLeft.x;
                            }
                        }
                    }
                }

                // Does not exist? add.
                if (!exists) {
                    points.push(currentLeft);
                }
            }

            return points;
        }

        sup.initTurn = function() {
            oldState = lumps.slice(0);
            oldTurn = sup.turnState;
            return sup;
        }

        sup.revertTurn = function() {
            lumps = oldState;
            sup.turnState = oldTurn;
            return sup;
        };

        // Define methods here
        sup.isEmpty = function() {
            return lumps.length === 0;
        };

        sup.getLumps = function() {
            return lumps;
        };

        sup.getLumpPoints = function() {
            var points = [];
            for (i = 0; i < lumps.length; i++) {
                points.push(new Tetrical.Point(lumps[i].x, lumps[i].y));
            }
            return points;
        };

        sup.containsPoints = function(points) {
            for (i = 0; i < lumps.length; i++) {
                for (y = 0; y < points.length; y++) {
                    if (lumps[i].x === points[y].x && lumps[i].y === points[y].y) {
                        return true;
                    }
                }
            }
            return false;
        };

        sup.getLowTopFromLeft = function(left) {
            var low = undefined;
            for(var i = lumps.length - 1; i >= 0; i--) {
                if(lumps[i].x === left && (low === undefined || low > lumps[i].y))
                    low = lumps[i].y;
            }
            return low;
        };

        sup.draw = function(ctx) {
            // Draw pieces
            for (i = 0; i < lumps.length; i++) {
                lumps[i].draw(ctx);
            }
        };

        sup.turn = function() {
            // Prep for possible reverting
            sup.initTurn();

            lumps = [];

            sup.turnState++;
            if (sup.turnState === 4) {
                sup.turnState = 0;
            }

            sup.initLumps(sup.x, sup.y);

            // Do the new lumps fall within grid boundaries?
            for (var i = 0; i < lumps.length; i++) {
                var lump = lumps[i];
                if (lump.x < gridBounds.minX || lump.x + 20 > gridBounds.maxX || lump.y < gridBounds.minY || lump.y + 20 > gridBounds.maxY) {
                    // Revert to old
                    sup.revertTurn();

                    // We're done here!
                    return false;
                }
            }

            return true;
        };

        sup.move = function(right) {
            var i = 0;
            if (right) {
                sup.x += 20;
                for (i = 0; i < lumps.length; i++) {
                    lumps[i].bumpRight();
                }
            } else {
                sup.x -= 20;
                for (i = 0; i < lumps.length; i++) {
                    lumps[i].bumpLeft();
                }
            }
        };

        sup.bumpBase = function() {
            return getBase(false);
        };

        sup.upperBase = function() {
            return getBase(true);
        };

        sup.rightBase = function() {
            return getBase(false, true);
        };

        sup.leftBase = function () {
            return getBase(true, true);
        };

        sup.minLeft = function() {
            lumps.sort(sortLumpsOnLeft);
            return lumps[0].x;
        };

        sup.maxLeft = function() {
            lumps.sort(sortLumpsOnLeft);
            return lumps[lumps.length - 1].x + 20;
        };

        sup.bumpDown = function(offset) {
            var i;
            if(offset === undefined) {
                sup.y += 20;
                for (i = 0; i < lumps.length; i++) {
                    lumps[i].bumpDown();
                }
            } else {
                var bumped = false, bumpCount = 0;
                for (i = 0; i < lumps.length; i++) {
                    if(lumps[i].y < offset) {
                        lumps[i].bumpDown();
                        bumped = true;
                        bumpCount++;
                    }
                }
                if (bumped) {
                    sup.y += 20;
                }
            }
        };
	
        sup.skipDown = function(offset) {
            sup.y += offset;
            for (i = 0; i < lumps.length; i++) {
                lumps[i].bumpDown(offset);
            }
        };

        sup.removeLumps = function(rem) {
            var maxLumps = lumps.length -1,
            maxRemoved = rem.length -1;
            for(var i = maxLumps; i >= 0; i--) {
                for(var y = maxRemoved; y >= 0; y--) {
                    if(lumps[i].x === rem[y].x && lumps[i].y === rem[y].y) {
                        rem.splice(y, 1);
                        lumps.splice(i, 1);
                        maxRemoved--;

                        // We removed a part, so we don't have to go over the same index.
                        break;
                    }
                }
            }
            return rem;
        }

        sup.getHeight = function() {
            if (lumps.length == 1) {
                return 20;
            }
            if (lumps.length == 0) {
                return 0;
            }
            lumps.sort(sortLumpsOnTop);
            return lumps[lumps.length - 1].y - lumps[0].y + 20;
        };

        sup.getWidth = function() {
            if (lumps.length == 1) {
                return 20;
            }
            if (lumps.length == 0) {
                return 0;
            }
            lumps.sort(sortLumpsOnLeft);
            return lumps[lumps.length - 1].x - lumps[0].x + 20;
        };

        sup.moveToCenter = function() {
            var leftOffset = sup.getWidth() / 2,
            topOffset = sup.getHeight() / 2;
            for (i = 0; i < lumps.length; i++) {
                lumps[i].y -= topOffset;
                lumps[i].x -= leftOffset;
            }
            sup.x -= leftOffset;
            sup.y -= topOffset;
        };

        // Required
        return sup;
    }
    
    Tetrical.RoundBorderedElement = function (x, y, width, height, rad, fill) {
        // Define "Superclass"
        var sup = new Tetrical.DrawableElement(x, y, width, height);

        // Define properties here
        sup.rad = rad;
        sup.fill = fill;

        // Define fields
        var circ = Math.PI * 2;

        // Define methods here
        sup.draw = function( ctx ) {

            ctx.fillStyle = sup.fill;

            // Draw cornered square
            ctx.beginPath();

            // Draw upper middle line
            ctx.moveTo(sup.x + rad, sup.y);
            ctx.lineTo(sup.x + sup.width - rad, sup.y);

            // Draw top-right diag line
            ctx.arc(sup.x + sup.width - rad, sup.y + rad, rad, circ * (3 / 4), circ, false);

            // Draw right middle line
            ctx.lineTo(sup.x + sup.width, sup.y + sup.height - rad);

            // Draw bottom-right diag line
            ctx.arc(sup.x + sup.width - rad, sup.y + sup.height - rad, rad, 0, circ / 4, false);

            // Draw bottom middle line
            ctx.lineTo(sup.x + rad, sup.y + sup.height);

            // Draw bottom-left diag line
            ctx.arc(sup.x + rad, sup.y + sup.height - rad, rad, circ / 4, circ / 2, false);

            // Draw left middle line
            ctx.lineTo(sup.x, sup.y + rad);

            // Draw upper-left diag line
            ctx.arc(sup.x + rad, sup.y + rad, rad, circ / 2, circ * (3/4), false);

            // Path is completed
            ctx.closePath();

            // Fill path
            ctx.fill();

        };

        // Required
        return sup;
    }

    Tetrical.Area = function (x, y, width, height, borderImage, borderWidth) {
        // Define "superclass"
        var sup = new Tetrical.DrawableElement(x, y, width, height);

        if(borderImage !== undefined) {
            sup.x += borderWidth;
            sup.y += borderWidth;
            sup.width -= borderWidth * 2;
            sup.height -= borderWidth * 2;
        }

        // Define methods
        sup.draw = function( ctx ) {
            // Clear our own area
            ctx.clearRect(sup.x, sup.y, sup.width, sup.height);
        };

        sup.drawBg = function( ctx, fill ) {
            // Draw Bg
            ctx.fillStyle = fill;
            ctx.fillRect(sup.x, sup.y, sup.width, sup.height);

            // Draw border
            if(borderImage !== undefined) {
                var maxX = width + x,
                maxY = height + y;
                for(var left = x; left < maxX; left += borderWidth) {
                    ctx.drawImage(THUMBS[borderImage], left, y, borderWidth, borderWidth);
                    ctx.drawImage(THUMBS[borderImage], left, maxY - borderWidth, borderWidth, borderWidth);
                    if(left === x || left == maxX - borderWidth) {
                        for(var top = y; top < maxY; top += borderWidth) {
                            ctx.drawImage(THUMBS[borderImage], left, top, borderWidth, borderWidth);
                        }
                    }
                }
            }
        };

        sup.offset = function() {
            return {
                x: sup.x,
                y: sup.y
            };
        };

        // Required
        return sup;
    }
    
    Tetrical.TetrisGrid = function(x, y, width, height, sqDim) {
        // Define "Superclass"
        var sup = new Tetrical.Area(x, y, width, height, 'Border.jpg', 20);

        // Define properties
        sup.sqDim = sqDim;
        sup.speed = 1; // # of frames before pieces move down
        sup.faster = false;
        sup.nextPiece = undefined;
        sup.moveResponse = 4;
        sup.moveRightEnabled = false;
        sup.moveLeftEnabled = false;
        // on for testing purposes
        sup.guidesEnabled = true;// false;

        // Define fields
        var pieces = [],
        passedSpeed = 0,
        passedResponseLeft = 0,
        passedResponseRight = 0,
        GRID_END = sup.y + sup.height,
        upperBases = [],
        gridEndBase = [],
        gridMax = (sup.width - sup.x) / sup.sqDim,
        i,
        score = 0,
        currentEndPoint;

        // Helper functions
        (function initBottomBase() {
            var i;
            for (i = 0; i < gridMax; i++) {
                gridEndBase.push(new Tetrical.Point(i * sup.sqDim + sup.x, GRID_END));
            }
        })();

        function hasEqualPoints(a, b) {
            for(var i = 0; i < a.length; i += 1) {
                for(var y = 0; y < b.length; y += 1) {
                    if(a[i].x === b[y].x && a[i].y === b[y].y) {
                        return true;
                    }
                }
            }
            return false;
        }

        function isPieceObstructedOnLeft(pieceOverride) {
            var piece = pieceOverride === undefined ? pieces[pieces.length - 1] : pieceOverride,
            leftBase = piece.leftBase(),
            max = pieces.length - 1;
            for (var i=0; i < max; i++) {
                var currRightBase = pieces[i].rightBase();
                if (hasEqualPoints(leftBase, currRightBase)) {
                    return true;
                }
            }
            return false;
        }

        function isPieceObstructedOnRight(pieceOverride) {
            var piece = pieceOverride === undefined ? pieces[pieces.length - 1] : pieceOverride,
            rightBase = piece.rightBase(),
            max = pieces.length - 1;
            for (var i=0; i < max; i++) {
                if (hasEqualPoints(rightBase, pieces[i].leftBase())) {
                    return true;
                }
            }
            return false;
        }

        function printArray(a) {
            var output = '';
            for (var i=0; i < a.length; i++) {
                output += a[i].x + ':' + a[i].y + '\n';
            }
            return output;
        }

        function canPieceBeAdded(toCheck) {
            if(pieces.length === 0 || pieces.length === 1)
                return true;
            var lumps = [];
            for(i = 0; i < pieces.length; ++i) {
                lumps = lumps.concat(pieces[i].getLumpPoints());
            }
            var hasEqual = hasEqualPoints(toCheck, lumps);

            return !hasEqual;
        }

        function contains(a, obj) {
            var con = a.length;
            while (con--) {
                if (a[con].x === obj.x && a[con].y === obj.y) {
                    return true;
                }
            }
            return false;
        }

        function checkAndRemoveRows() {
            var i, y, addScore = 0;

            // Get all lumps
            var lumps = [];
            for(i = 0; i < pieces.length; ++i) {
                lumps = lumps.concat(pieces[i].getLumps());
            }

            // Check for rows all across
            if(lumps.length > 0) {
                lumps.sort(sortLumpsOnTop);

                var currY = lumps[lumps.length - 1].y,
                maxCount = sup.width / sup.sqDim,
                currCount = 0,
                rows = [],
                rowTops = [],
                max = lumps.length - 1,
                currentRowStart = max;
                //logIt('maxCount: ' + maxCount);
                for (i = max; i >= 0; i--) {
                    var currentLump = lumps[i];
                    if(currY === currentLump.y) {
                        currCount++;
                        if (currCount === maxCount) {
                            var realPoints = [];
                            for(y = currentRowStart; y >= i; --y) {
                                if(!contains(realPoints, lumps[y]))
                                    realPoints.push(lumps[y]);
                            }
                            if(realPoints.length === maxCount) {
                                rowTops.push(currY);
                                for(y = realPoints.length - 1; y >= 0; --y) {
                                    rows.push(realPoints[y]);
                                }
                            } else {
                                currCount--;
                            }
                        }
                    } else {
                        currCount = 1;//i === max ? 0 : 1;
                        currY = currentLump.y;
                        currentRowStart = i;
                    }
                }

                // Remove rows, if any
                if(rows.length > 0) {
                    var before = lumps.length, rowCount = rowTops.length;

                    addScore += rows.length / maxCount;

                    for(i = 0; i < pieces.length; ++i) {
                        rows = pieces[i].removeLumps(rows);
                    }
                    // Remove empty elements
                    for (i = pieces.length - 1; i >= 0; i--) {
                        if(	pieces[i].isEmpty())
                            pieces.splice(i, 1);
                    }
                    // Bump down remainders
                    for (i = rowTops.length - 1; i >= 0; i--) {
                        //console.log('rowtop ' + i.toString() + ': ' + rowTops[i]);
                        for(y = 0; y < pieces.length; ++y) {
                            pieces[y].bumpDown(rowTops[i]);
                        }
                    }

                    lumps = [];
                    for(i = 0; i < pieces.length; ++i) {
                        lumps = lumps.concat(pieces[i].getLumps());
                    }
                }
            }
            return addScore;
        }

        function canPieceMove() {
            var currPiece = pieces[pieces.length - 1],
            bumpBase = currPiece.bumpBase();

            // Reached end of the grid?
            for(var i = 0; i < bumpBase.length; ++i) {
                if (bumpBase[i].y == GRID_END) {
                    return false;
                }
            }

            // Touching other pieces
            if (currPiece.moveable && sup.canPieceMoveDown()) {
                return true;
            }

            // Fallthrough, can move!
            return false;
        }

        function determineEndPos(base) {
            var minY = GRID_END, 
            givenX = base[base.length-1].x,
            blockedY = 0;

            // get the minimum position where we would be blocked
            for(var i =  base.length - 1; i >= 0; i--) {
                base[i].blockedY = GRID_END;
                base[i].diffY = GRID_END - base[i].y;
                for(var y = pieces.length - 2; y >= 0; y--) {
                    var lowestY = pieces[y].getLowTopFromLeft(base[i].x);
                    if(lowestY !== undefined && lowestY < base[i].blockedY) {
                        base[i].blockedY = lowestY;
                        base[i].diffY = lowestY - base[i].y;
                    }
                }
            }
            base.sort(sortLumpsOnTop);
            var smallestDiff = base[0].diffY;
            for(i =  base.length - 1; i >= 0; i--) {
                if(base[i].diffY < smallestDiff){
                    smallestDiff = base[i].diffY;
                }
            }
            // Set current end point to awesome... I mean, what we just calculated
            currentEndPoint = {
                x: givenX,
                y: smallestDiff,
                print: function() {
                    return '{x: ' + givenX + ', y: ' + (smallestDiff).toString() + '}'
                }
            };
        }

        // Define methods
        sup.moveLeft = function(pieceOverride) {
            // Can the piece move left?
            if (pieceOverride &&
                pieceOverride.minLeft() > sup.x &&
                !isPieceObstructedOnLeft(pieceOverride)) {
                pieceOverride.move(false);
                determineEndPos(pieces[pieces.length - 1].bumpBase());
            } else {
                if (pieces.length > 0 &&
                    pieces[pieces.length - 1].moveable &&
                    pieces[pieces.length - 1].minLeft() > sup.x &&
                    !isPieceObstructedOnLeft()) {
                    pieces[pieces.length - 1].move(false);
                    pieces[pieces.length - 1].moveable = canPieceMove();
                    determineEndPos(pieces[pieces.length - 1].bumpBase());
                }
            }
        };

        sup.moveRight = function(pieceOverride) {
            // Can the piece move right
            if (pieceOverride &&
                pieceOverride.maxLeft() < sup.x + sup.width &&
                !isPieceObstructedOnRight(pieceOverride)) {
                pieceOverride.move(true);
                determineEndPos(pieces[pieces.length - 1].bumpBase());
            } else {
                if (pieces.length > 0 &&
                    pieces[pieces.length - 1].moveable &&
                    pieces[pieces.length - 1].maxLeft() < sup.x + sup.width &&
                    !isPieceObstructedOnRight()) {
                    pieces[pieces.length - 1].move(true);
                    pieces[pieces.length - 1].moveable = canPieceMove();
                    determineEndPos(pieces[pieces.length - 1].bumpBase());
                }
            }
        };

        sup.canPieceMoveDown = function() {
            var piece = pieces[pieces.length - 1],
            bumpBase = piece.bumpBase(),
            max = pieces.length - 1;
            for (var i=0; i < max; i++) {
                if (hasEqualPoints(bumpBase, pieces[i].upperBase())) {
                    return false;
                }
            }
            return true;
        };

        sup.getUpperLine = function(uppers) {
            var upperLine = [];
            var copy;
            for (copy = 0; copy < gridEndBase.length; copy++) {
                upperLine.push(gridEndBase[copy]);
            }

            if (uppers.length > 0) {
                var i = 0;
                for (i = 0; i < uppers.length; i++) {
                    var currentLeft = uppers[i];
                    var y = 0;
                    // Exists in points array?
                    var exists = false;
                    for (y = 0; y < upperLine.length; y++) {
                        var currPoint = upperLine[y];
                        if(currPoint.x == currentLeft.x) {
                            exists = true;
                            if (currPoint.y > currentLeft.y) {
                                currPoint.y = currentLeft.y;
                            }
                        }
                    }

                    // Does not exist? add.
                    if (!exists) {
                        upperLine.push(currentLeft);
                    }
                }
            }
            return upperLine;
        };

        sup.drawTetris = function( ctx ) {

            // necessary vars
            var move = false,
            i = 0;

            // If down-arrow is pressed, go faster!
            // Adjust speed to score
            var scoredSpeed = 30 - score * 2;

            sup.speed =  sup.faster ? 5 : (scoredSpeed < 5 ? 5 : scoredSpeed);

            // Check for flags
            if(sup.moveRightEnabled) {
                passedResponseRight++;
                if (passedResponseRight >= sup.moveResponse) {
                    passedResponseRight = 0;

                    // Move right
                    sup.moveRight();
                }
            } else {
                passedResponseRight = 0;
            }
            if(sup.moveLeftEnabled) {
                passedResponseLeft++;
                if (passedResponseLeft >= sup.moveResponse) {
                    passedResponseLeft = 0;

                    // Move right
                    sup.moveLeft();
                }
            } else {
                passedResponseLeft = 0;
            }

            // Clear self
            sup.draw(ctx);

            // Draw Background
            sup.drawBg( ctx, '#C4C4C4' );

            // Handle pieces
            if (pieces.length > 0) {

                // Handle piece movement
                passedSpeed++;
                if (passedSpeed >= sup.speed) {
                    // Time to move
                    move = true;
                    passedSpeed = 0;
                }

                // Move current piece
                var moved = false, deterdEnd = false;
                if (move === true && pieces.length > 0 && canPieceMove()) {
                    pieces[pieces.length - 1].bumpDown();
                    pieces[pieces.length - 1].draw(ctx);
                    pieces[pieces.length - 1].moveable = canPieceMove();
                    moved = true;
                    if(!pieces[pieces.length - 1].moveable) {
                        // Slide to right twice, if key down
                        if(sup.moveRightEnabled) {
                            sup.moveRight(pieces[pieces.length - 1]);
                            if (canPieceMove()) {
                                // entered a convex where you can move
                                pieces[pieces.length - 1].moveable = true;
                            } else {
                                sup.moveRight(pieces[pieces.length - 1]);
                                pieces[pieces.length - 1].moveable = canPieceMove();
                            }
                            determineEndPos(pieces[pieces.length - 1].bumpBase());
                            deterdEnd = true;
                        }
                        if(sup.moveLeftEnabled) {
                            sup.moveLeft(pieces[pieces.length - 1]);
                            if (canPieceMove()) {
                                // entered a convex where you can move
                                pieces[pieces.length - 1].moveable = true;
                            } else {
                                sup.moveLeft(pieces[pieces.length - 1]);
                                pieces[pieces.length - 1].moveable = canPieceMove();
                            }
                            determineEndPos(pieces[pieces.length - 1].bumpBase());
                            deterdEnd = true;
                        }

                        // Check for rows to delete and score, if any
                        score += checkAndRemoveRows();
                    }
                    if(!deterdEnd) {
                        determineEndPos(pieces[pieces.length - 1].bumpBase());
                    }
                }

                // Draw guides, if enabled
                if(pieces.length > 0 && sup.guidesEnabled) {
                    var bumpBaseCurr = pieces[pieces.length - 1].bumpBase(),
                    paras = (function() {
                        var highestTop = bumpBaseCurr[0].y,
                        lowestX = bumpBaseCurr[0].x,
                        highestX = bumpBaseCurr[0].x;
                        for(var i = 0, max = bumpBaseCurr.length; i < max; i++) {
                            if(bumpBaseCurr[i].y > highestTop) {
                                highestTop = bumpBaseCurr[i].y;
                            }
                            if(bumpBaseCurr[i].x > highestX) {
                                highestX = bumpBaseCurr[i].x;
                            }
                            if(bumpBaseCurr[i].x < lowestX) {
                                lowestX = bumpBaseCurr[i].x;
                            }
                        }
                        return {
                            maxY: highestTop - 20,
                            minX: lowestX,
                            maxX: highestX + 20,
                            width: highestX + 20 - lowestX
                        }
                    })();

                    // Draw end position
                    var oLumps = pieces[pieces.length - 1].getLumps();
                    (function() {
                        // Draw lumps
                        ctx.globalAlpha = 0.3;
                        for(y = oLumps.length - 1; y >= 0; y--) {
                            ctx.fillStyle = oLumps[y].fill;
                            ctx.strokeStyle = oLumps[y].stroke;
                            ctx.fillRect(oLumps[y].x, oLumps[y].y + currentEndPoint.y, oLumps[y].width, oLumps[y].height);
                            ctx.strokeRect(oLumps[y].x, oLumps[y].y + currentEndPoint.y, oLumps[y].width, oLumps[y].height);
                        }
                        ctx.globalAlpha = 1;
                    })();

                }

                // Draw pieces
                var max = moved ? pieces.length -1 : pieces.length;
                for (i = 0; i < max; i++) {
                    pieces[i].draw(ctx);
                }
            } else {
                passedSpeed = 0;
            }

        };

        sup.getScore = function() {
            return score;
        };

        sup.pushPiece = function() {
            var type = sup.nextPiece;
            if (sup.nextPiece === undefined) {
                // Make random piece for next
                type = PIECE_TYPES[PIECE_TYPE_INDEXES[Math.floor(Math.random() * PIECE_TYPE_INDEXES.length)]];
            } else {
                type = sup.nextPiece;
            }
            sup.nextPiece = PIECE_TYPES[PIECE_TYPE_INDEXES[Math.floor(Math.random() * PIECE_TYPE_INDEXES.length)]];

            var cols = (sup.width / sup.sqDim);
            var newPiece = new Tetrical.Piece(sup.x + (cols / 2 -1) * sup.sqDim, sup.y, type, {
                minX: sup.x,
                minY: sup.y,
                maxX: sup.x + sup.width,
                maxY: GRID_END
            }),
            canBeAdded = canPieceBeAdded(newPiece.getLumpPoints());

            if(!canBeAdded)
                return false;

            pieces.push(newPiece);
            determineEndPos(pieces[pieces.length - 1].bumpBase());
		
            return true;
        };

        sup.isCurrPieceMoving = function() {
            // Any pieces on the grid?
            if (pieces.length === 0) {
                return false;
            }

            // Can current piece move?
            var currPiece = pieces[pieces.length-1];
            var bumpBase = currPiece.bumpBase();
            var result = canPieceMove(upperBases, bumpBase);
            return result;
        };

        sup.pieceCount = function() {
            return pieces.length;
        };

        sup.turn = function() {
            if (pieces.length > 0) {
                var turned = pieces[pieces.length-1].turn();
                if (turned) {
                    // Piece did not overlap with grid borders
                    // Check if piece overlaps with other pieces
                    var max = pieces.length - 1,
                    points = pieces[pieces.length-1].getLumpPoints();
                    for (i = 0; i < max; i++) {
                        if (pieces[i].containsPoints(points)) {
                            pieces[pieces.length-1].revertTurn();

                            // We are done here!
                            break;
                        }
                    }

                    // Determine new endPoint
                    determineEndPos(pieces[pieces.length - 1].bumpBase());
                }
            }
        };

        sup.skipMove = function() {
            if (pieces.length > 0 && pieces[pieces.length - 1].moveable) {
                pieces[pieces.length - 1].skipDown(currentEndPoint.y);
                pieces[pieces.length - 1].moveable = false;
                score += checkAndRemoveRows();
            }
        };

        // Required
        return sup;
    }

    Tetrical.TetrisSidebar = function(x, y, width, height) {
        // Define "Superclass"
        var sup = new Tetrical.Area(x, y, width, height);

        // Define properties
        var currentElement = new Tetrical.CurrentElementPart(x + 10, y + 10, width - 20, 200, 20, '#8C8C8C');

        // Define methods
        sup.updateCurrentElement = function(type) {
            currentElement.setCurrentPiece(type);
        };

        sup.drawSide = function( ctx ) {

            sup.draw(ctx);

            // Draw Background
            sup.drawBg( ctx, '#474747' );

            // Draw test
            currentElement.drawPart( ctx );

        };

        // Required
        return sup;
    }
    
    Tetrical.CurrentElementPart = function (x, y, width, height, rad, fill) {
        // Define "Superclass"
        var sup = new Tetrical.RoundBorderedElement(x, y, width, height, rad, fill);

        // Define properties
        sup.currentPiece = undefined;
        sup.currentPieceInit = undefined;

        // Define methods
        sup.setCurrentPiece = function(type) {
            sup.currentPiece = type;
            if (type !== undefined) {
                sup.currentPieceInit = new Tetrical.Piece(x  + width / 2, y + height / 2, sup.currentPiece);
                sup.currentPieceInit.moveToCenter();
            } else {
                sup.currentPieceInit = undefined;
            }
        };

        sup.drawPart = function(ctx) {
            // Draw parent
            sup.draw(ctx);

            // Draw current piece
            if (sup.currentPieceInit !== undefined) {
                sup.currentPieceInit.draw(ctx);
            }
        };

        // Required
        return sup;
    }
    
    return Tetrical;
})();
