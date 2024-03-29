/*

The extensions selected for this game project are (1) using the p5.js sound effects and (2) creating enemies.

*/

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var trees_x;
var clouds;
var mountains;
var collectables;
var canyons;

var game_score;
var flagpole;
var lives;
var enemies;

var jumpSound;
var fallSound;
var gameOverSound;
var meowSound;



function preload() {

    soundFormats('mp3', 'wav', 'ogg');

    //load your sounds here
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.2);

    fallSound = loadSound('assets/fall.wav');
    fallSound.setVolume(0.1);

    gameOverSound = loadSound('assets/over.wav');
    gameOverSound.setVolume(0.2);

    meowSound = loadSound('assets/meow.wav');
    meowSound.setVolume(0.7);

    successSound = loadSound('assets/success.wav');
    successSound.setVolume(0.2);

    happyCatSound = loadSound('assets/happycat.wav');
    happyCatSound.setVolume(0.5);

    weaselSound = loadSound('assets/ferretdook.wav');

    music = loadSound('assets/retromusic2.wav');
    music.setVolume(0.1);

    // Plays the happy cat sound straight after the level completed sound
    successSound.addCue(1, function() {
        happyCatSound.play();
    });
}

function setup() {

    createCanvas(1024, 576);

    floorPos_y = height * 3 / 4;

    lives = 3;

    startGame();

}

function draw() {

    // Fill the sky blue
    background(135, 206, 235);

    // Draw some green ground
    noStroke();
    fill(0, 155, 0);
    rect(0, floorPos_y, width, height / 4);

    push();
    translate(scrollPos, 0);

    // Draw clouds.
    drawClouds();

    // Draw mountains.
    drawMountains();

    // Draw trees.
    drawTrees();

    // Draw canyons.
    for (var i = 0; i < canyons.length; i++) {
        drawCanyon(canyons[i]);
        checkCanyon(canyons[i]);
    }

    // Draw collectable items.
    for (var i = 0; i < collectables.length; i++) {
        if (!collectables[i].isFound) {
            drawCollectable(collectables[i], "red");
            checkCollectable(collectables[i]);
        }
    }

    // Draw enemies (weasels)
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].draw();

    }

    // Draw flagpole
    renderFlagpole();

    // End background drawing
    pop();

    // Draw game character.
    drawGameChar();

    // Show number of lives
    displayLives();

    // Display score
    fill(0);
    noStroke();
    textSize(20);
    text("Score: " + game_score, 20, 20);


    if (lives < 1) {

        // Checks if background music is playing and stops it once the game is over
        if (music.isPlaying()) {
            music.stop();
        }

        // Sets "played" property of the sound object to true, so not played again in this try
        if (!gameOverSound.played) {
            gameOverSound.play();
            gameOverSound.played = true;
        }

        // Print "game over" text if no lives are left
        push();
        stroke(50);
        textSize(100);
        fill(255, 0, 0);
        text("GAME OVER", width / 4, height / 2);
        textSize(60);
        fill(0);
        text("Press space to continue.", width / 4, height / 2 + 120);
        pop();

        return;

    }

    // Print "level complete" text if flagpole reached
    if (flagpole.isReached) {
        if (music.isPlaying()) {
            music.stop();
        }
        // Plays success, level finished sound once and then sets played property to true
        if (!successSound.played) {
            successSound.play();
            successSound.played = true;
        }

        // Makes character fall if it jumped onto flagpole
        if (gameChar_y < floorPos_y + 5) {
            isFalling = true;
            isPlummeting = false;
            gameChar_y += 2;
        }
        push();
        stroke(100);
        textSize(50);
        fill(0, 0, 255);
        text("Level complete. Press space to continue.", 60, height / 2);
        pop();

        return;
    }


    // Logic to make the game character move or the background scroll.
    if (isLeft) {
        if (gameChar_x > width * 0.2) {
            gameChar_x -= 5;
        } else {
            scrollPos += 5;
        }
    }

    if (isRight) {
        if (gameChar_x < width * 0.8) {
            gameChar_x += 5;
        } else {
            scrollPos -= 5; // negative for moving against the background
        }
    }

    // Logic to make the game character rise and fall.
    if (gameChar_y < floorPos_y) {
        gameChar_y += 2;
        isFalling = true;
    } else {
        isFalling = false;
    }

    if (isPlummeting) {
        if (!fallSound.played) {
            fallSound.play()
            fallSound.played = true;

        }
        gameChar_y += 8;
    }

    if (!flagpole.isReached) {
        checkFlagpole();
    }

    checkPlayerDie();

    // Update real position of gameChar for collision detection.
    gameChar_world_x = gameChar_x - scrollPos;

}


function keyPressed() {

    // Key code for left arrow = 37
    if (keyCode == 37) {
        isLeft = true;
    }

    // Key code for right arrow = 39
    if (keyCode == 39) {
        isRight = true;
    }

    // Key code for space
    if (keyCode == 32) {

        if (gameChar_y == floorPos_y) {
            // Fixes bug where if character had reached flagpole, still could jump
            if (!flagpole.isReached) {
                gameChar_y -= 100;
            }
            jumpSound.play();
        }

        // If "game over" and space pressed, then restart the game
        if (lives < 1) {
            setup();
            draw();
        }

    }
}

function keyReleased() {
    if (keyCode == 37) {
        isLeft = false;
    }

    if (keyCode == 39) {
        isRight = false;
    }
}


// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar() {
    // Add your jumping-left code
    if (isLeft && isFalling) {

        // Draw tail
        stroke(100);
        strokeWeight(6);
        line(
            gameChar_x + 4,
            gameChar_y - 14,
            gameChar_x + 18,
            gameChar_y - 55
        );
        strokeWeight(1);
        noStroke();

        // Draw ear
        fill(150);
        triangle(
            gameChar_x - 16,
            gameChar_y - 60,
            gameChar_x - 4,
            gameChar_y - 60,
            gameChar_x - 6,
            gameChar_y - 74
        );

        // Draw back arm and leg
        fill(100);
        ellipse(gameChar_x - 12, gameChar_y - 28, 8);
        ellipse(gameChar_x - 2, gameChar_y - 12, 8);

        // Draw head and body
        fill(150);
        angleMode(DEGREES);
        push();
        translate(gameChar_x + 64, gameChar_y + 20);
        rotate(-2 * PI - 19);
        ellipse(-36, -70, 30, 45);
        ellipse(-36, -100, 20, 25);
        fill(255);
        ellipse(-46, -70, 8, 20);
        pop();

        // Draw whiskers
        stroke(0);
        strokeWeight(1);
        line(
            gameChar_x - 6,
            gameChar_y - 55,
            gameChar_x + 10,
            gameChar_y - 65
        );
        line(
            gameChar_x - 6,
            gameChar_y - 55,
            gameChar_x + 10,
            gameChar_y - 60
        );
        noStroke();

        // Draw nose
        fill(100)
        triangle(
            gameChar_x - 20,
            gameChar_y - 56,
            gameChar_x - 22,
            gameChar_y - 52,
            gameChar_x - 20,
            gameChar_y - 52
        )

        // Draw eye
        fill(200, 200, 0);
        ellipse(gameChar_x - 16, gameChar_y - 58, 4);

        // Draw front arm and leg
        fill(100);
        ellipse(gameChar_x + 8, gameChar_y - 10, 8);
        ellipse(gameChar_x, gameChar_y - 28, 8);

    }
    // Add your jumping-right code
    else if (isRight && isFalling) {

        // Draw tail
        stroke(100);
        strokeWeight(6);
        line(gameChar_x - 4, gameChar_y - 14, gameChar_x - 18, gameChar_y - 55);
        strokeWeight(1);
        noStroke();

        // Draw ear
        fill(150);
        triangle(
            gameChar_x + 16,
            gameChar_y - 60,
            gameChar_x + 4,
            gameChar_y - 60,
            gameChar_x + 6,
            gameChar_y - 74
        );

        // Draw back arm and leg
        fill(100);
        ellipse(gameChar_x + 12, gameChar_y - 28, 8);
        ellipse(gameChar_x, gameChar_y - 12, 8);

        // Draw head and body
        fill(150);
        angleMode(DEGREES);
        push();
        translate(gameChar_x, gameChar_y + 50);
        rotate(2 * PI + 20);
        ellipse(-36, -70, 30, 45);
        ellipse(-36, -100, 20, 25);
        fill(255);
        ellipse(-26, -70, 8, 20);
        pop();

        // Draw whiskers
        stroke(0);
        strokeWeight(1);
        line(gameChar_x + 6, gameChar_y - 55, gameChar_x - 10, gameChar_y - 65);
        line(gameChar_x + 6, gameChar_y - 55, gameChar_x - 10, gameChar_y - 60);
        noStroke();

        // Draw nose
        fill(100)
        triangle(
            gameChar_x + 20,
            gameChar_y - 56,
            gameChar_x + 20,
            gameChar_y - 52,
            gameChar_x + 22,
            gameChar_y - 52
        )

        // Draw eye
        fill(200, 200, 0);
        ellipse(gameChar_x + 16, gameChar_y - 58, 4);

        // Draw front arm and leg
        fill(100);
        ellipse(gameChar_x - 8, gameChar_y - 10, 8);
        ellipse(gameChar_x, gameChar_y - 28, 8);

    }
    // Add your walking left code
    else if (isLeft) {

        // Draw tail
        stroke(100);
        strokeWeight(4);
        line(
            gameChar_x,
            gameChar_y - 5,
            gameChar_x + 22,
            gameChar_y - 25
        );
        noStroke();

        // Draw ear
        fill(150);
        triangle(
            gameChar_x - 10,
            gameChar_y - 55,
            gameChar_x + 4,
            gameChar_y - 55,
            gameChar_x + 2,
            gameChar_y - 69
        );

        // Draw head
        fill(150);
        ellipse(gameChar_x - 6, gameChar_y - 50, 25, 28);

        // Draw body
        ellipse(gameChar_x - 2, gameChar_y - 20, 30, 40);
        fill(255);
        ellipse(gameChar_x - 12, gameChar_y - 20, 3, 20);

        // Draw the whiskers
        stroke(0);
        strokeWeight(1);
        line(
            gameChar_x - 6,
            gameChar_y - 50,
            gameChar_x + 10,
            gameChar_y - 55
        )
        line(
            gameChar_x - 6,
            gameChar_y - 50,
            gameChar_x + 10,
            gameChar_y - 45
        )
        noStroke();

        // Draw the nose
        fill(100);
        triangle(
            gameChar_x - 18,
            gameChar_y - 49,
            gameChar_x - 16,
            gameChar_y - 45,
            gameChar_x - 18,
            gameChar_y - 45
        );

        // Draw eye
        fill(200, 200, 0);
        ellipse(gameChar_x - 12, gameChar_y - 53, 4);

        // Draw feet
        fill(100);
        ellipse(gameChar_x - 12, gameChar_y - 1, 8);
        ellipse(gameChar_x, gameChar_y - 1, 8);

    }
    // Add your walking right code
    else if (isRight) {

        // Draw tail
        stroke(100);
        strokeWeight(4);
        line(
            gameChar_x,
            gameChar_y - 5,
            gameChar_x - 22,
            gameChar_y - 25
        );
        noStroke();

        // Draw ear
        fill(150);
        triangle(
            gameChar_x + 10,
            gameChar_y - 55,
            gameChar_x - 4,
            gameChar_y - 55,
            gameChar_x - 2,
            gameChar_y - 69
        );

        // Draw head
        fill(150);
        ellipse(gameChar_x + 6, gameChar_y - 50, 25, 28);

        // Draw body
        fill(150);
        ellipse(gameChar_x + 2, gameChar_y - 20, 30, 40);
        fill(255);
        ellipse(gameChar_x + 12, gameChar_y - 20, 3, 20);

        // Draw whiskers
        stroke(0);
        strokeWeight(1);
        line(
            gameChar_x + 6,
            gameChar_y - 50,
            gameChar_x - 10,
            gameChar_y - 55
        );
        line(
            gameChar_x + 6,
            gameChar_y - 50,
            gameChar_x - 10,
            gameChar_y - 45
        );
        noStroke();

        // Draw eye
        fill(200, 200, 0);
        ellipse(gameChar_x + 12, gameChar_y - 53, 4);

        // Draw nose
        fill(100);
        triangle(
            gameChar_x + 18,
            gameChar_y - 49,
            gameChar_x + 14,
            gameChar_y - 45,
            gameChar_x + 18,
            gameChar_y - 45
        );

        // Draw feet
        fill(100);
        ellipse(gameChar_x + 12, gameChar_y - 1, 8);
        ellipse(gameChar_x, gameChar_y - 1, 8);

    }
    // add your jumping facing forwards code
    else if (isFalling || isPlummeting) {

        // Draw tail
        noFill();
        stroke(120);
        strokeWeight(6)
        beginShape();
        vertex(gameChar_x + 5, gameChar_y - 20);
        vertex(gameChar_x + 20, gameChar_y - 50);
        vertex(gameChar_x + 21, gameChar_y - 55);
        endShape();
        noStroke();

        // Draw the ears
        fill(150)
        triangle(
            gameChar_x - 12,
            gameChar_y - 60,
            gameChar_x,
            gameChar_y - 60,
            gameChar_x - 6,
            gameChar_y - 75
        );
        triangle(
            gameChar_x + 2,
            gameChar_y - 60,
            gameChar_x + 12,
            gameChar_y - 60,
            gameChar_x + 6,
            gameChar_y - 75
        );

        // Draw head
        fill(150);
        ellipse(gameChar_x, gameChar_y - 55, 26);

        // Draw arms and feet jumping
        stroke(100);
        strokeWeight(4);
        line(
            gameChar_x - 13,
            gameChar_y - 25,
            gameChar_x - 20,
            gameChar_y - 40
        );
        line(
            gameChar_x + 13,
            gameChar_y - 25,
            gameChar_x + 20,
            gameChar_y - 40
        );
        strokeWeight(4);
        line(
            gameChar_x - 13,
            gameChar_y - 23,
            gameChar_x - 20,
            gameChar_y - 7
        );
        line(
            gameChar_x + 13,
            gameChar_y - 23,
            gameChar_x + 20,
            gameChar_y - 7
        );
        noStroke();

        // Draw the body
        fill(150);
        ellipse(gameChar_x, gameChar_y - 25, 30, 40);
        fill(245);
        ellipse(gameChar_x, gameChar_y - 25, 15, 25);
        strokeWeight(1);
        noStroke();

        // Draw whiskers
        stroke(0);
        line(
            gameChar_x - 8,
            gameChar_y - 51,
            gameChar_x - 18,
            gameChar_y - 59
        );
        line(
            gameChar_x - 8,
            gameChar_y - 49,
            gameChar_x - 18,
            gameChar_y - 51
        );
        line(
            gameChar_x + 8,
            gameChar_y - 51,
            gameChar_x + 18,
            gameChar_y - 59
        );
        line(
            gameChar_x + 8,
            gameChar_y - 49,
            gameChar_x + 18,
            gameChar_y - 51
        );

        // Draw nose
        noStroke();
        fill(100);
        triangle(
            gameChar_x,
            gameChar_y - 53,
            gameChar_x - 3,
            gameChar_y - 49,
            gameChar_x + 3,
            gameChar_y - 49
        );

        // Draw dead eyes
        if (isPlummeting) {
            stroke(0);
            strokeWeight(1.2);
            line(gameChar_x - 7, gameChar_y - 60, gameChar_x - 3, gameChar_y - 55);
            line(gameChar_x - 3, gameChar_y - 60, gameChar_x - 7, gameChar_y - 55);
            line(gameChar_x + 7, gameChar_y - 60, gameChar_x + 3, gameChar_y - 55);
            line(gameChar_x + 3, gameChar_y - 60, gameChar_x + 7, gameChar_y - 55);
            noStroke();
        } else
        // Draw normal eyes
        {
            fill(200, 200, 0);
            ellipse(gameChar_x - 5, gameChar_y - 57, 4);
            ellipse(gameChar_x + 5, gameChar_y - 57, 4);
        }
    }
    // Facing forwards code
    else {
        // Draw ears
        fill(150);
        triangle(
            gameChar_x - 12,
            gameChar_y - 55,
            gameChar_x,
            gameChar_y - 55,
            gameChar_x - 6,
            gameChar_y - 70
        );
        triangle(
            gameChar_x + 2,
            gameChar_y - 55,
            gameChar_x + 12,
            gameChar_y - 55,
            gameChar_x + 6,
            gameChar_y - 70
        );

        // Draw tail
        stroke(120);
        strokeWeight(4);
        line(
            gameChar_x + 5,
            gameChar_y - 20,
            gameChar_x + 20,
            gameChar_y - 5
        );
        strokeWeight(1);
        noStroke();

        // Draw head
        fill(150);
        ellipse(gameChar_x, gameChar_y - 50, 26);

        // Draw body
        fill(150);
        ellipse(gameChar_x, gameChar_y - 20, 30, 40);
        fill(245);
        ellipse(gameChar_x, gameChar_y - 20, 15, 25);

        // Draw whiskers  
        stroke(0);
        line(
            gameChar_x - 8,
            gameChar_y - 46,
            gameChar_x - 18,
            gameChar_y - 54
        );
        line(
            gameChar_x - 8,
            gameChar_y - 44,
            gameChar_x - 18,
            gameChar_y - 46
        );
        line(
            gameChar_x + 8,
            gameChar_y - 46,
            gameChar_x + 18,
            gameChar_y - 54
        );
        line(
            gameChar_x + 8,
            gameChar_y - 44,
            gameChar_x + 18,
            gameChar_y - 46
        );

        // Draw nose
        noStroke();
        fill(100);
        triangle(
            gameChar_x,
            gameChar_y - 48,
            gameChar_x - 3,
            gameChar_y - 44,
            gameChar_x + 3,
            gameChar_y - 44
        );

        // Draw eyes
        fill(200, 200, 0);
        ellipse(gameChar_x - 5, gameChar_y - 52, 4);
        ellipse(gameChar_x + 5, gameChar_y - 52, 4);

        // Draw feet
        fill(100);
        ellipse(gameChar_x - 10, gameChar_y - 2, 8, 8);
        ellipse(gameChar_x + 10, gameChar_y - 2, 8, 8);
    }
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawClouds() {
    for (var i = 0; i < clouds.length; i++) {
        fill(255)
            // Anchor cloud
        ellipse(clouds[i].x_pos, clouds[i].y_pos, 95 * clouds[i].size);
        // Relative point c;ouds
        ellipse(
            clouds[i].x_pos + 50 * clouds[i].size,
            clouds[i].y_pos,
            95 * clouds[i].size
        );
        ellipse(
            clouds[i].x_pos - 50 * clouds[i].size,
            clouds[i].y_pos + 5 * clouds[i].size,
            70 * clouds[i].size
        );
        ellipse(
            clouds[i].x_pos + 100 * clouds[i].size,
            clouds[i].y_pos + 5 * clouds[i].size,
            70 * clouds[i].size
        );
    }
}

// Function to draw mountains objects.
function drawMountains() {
    for (var i = 0; i < mountains.length; i++) {

        // First large triangle in dark grey
        fill(90);
        triangle(
            // Anchor
            mountains[i].x_pos,
            mountains[i].y_pos,
            // Relative points
            mountains[i].x_pos + 120 * mountains[i].size,
            mountains[i].y_pos,
            mountains[i].x_pos + 60 * mountains[i].size,
            mountains[i].y_pos - 176 * mountains[i].size
        );

        // Snow cap of first large triangle
        fill(190);
        triangle(
            mountains[i].x_pos + 60 * mountains[i].size,
            mountains[i].y_pos - 175.5 * mountains[i].size,
            mountains[i].x_pos + 40 * mountains[i].size,
            mountains[i].y_pos - 117 * mountains[i].size,
            mountains[i].x_pos + 80 * mountains[i].size,
            mountains[i].y_pos - 117 * mountains[i].size
        );
        fill(90);
        triangle(
            mountains[i].x_pos + 39.7 * mountains[i].size,
            mountains[i].y_pos - 116 * mountains[i].size,
            mountains[i].x_pos + 60.5 * mountains[i].size,
            mountains[i].y_pos - 140 * mountains[i].size,
            mountains[i].x_pos + 80.4 * mountains[i].size,
            mountains[i].y_pos - 116 * mountains[i].size
        );

        // Second right-hand side smaller mountain
        triangle(
            mountains[i].x_pos + 90 * mountains[i].size,
            mountains[i].y_pos,
            mountains[i].x_pos + 160 * mountains[i].size,
            mountains[i].y_pos,
            mountains[i].x_pos + 120 * mountains[i].size,
            mountains[i].y_pos - 112 * mountains[i].size
        );

        // Snow cap for second dark grey triangle
        fill(190);
        triangle(
            mountains[i].x_pos + 120 * mountains[i].size,
            mountains[i].y_pos - 112 * mountains[i].size,
            mountains[i].x_pos + 110.8 * mountains[i].size,
            mountains[i].y_pos - 77 * mountains[i].size,
            mountains[i].x_pos + 132.2 * mountains[i].size,
            mountains[i].y_pos - 77 * mountains[i].size
        );
        fill(90);
        triangle(
            mountains[i].x_pos + 110 * mountains[i].size,
            mountains[i].y_pos - 75 * mountains[i].size,
            mountains[i].x_pos + 133.3 * mountains[i].size,
            mountains[i].y_pos - 75 * mountains[i].size,
            mountains[i].x_pos + 120 * mountains[i].size,
            mountains[i].y_pos - 90 * mountains[i].size
        );

    }
}

// Function to draw trees objects.
function drawTrees() {
    for (var i = 0; i < trees_x.length; i++) {
        noStroke();
        fill(120, 100, 40);

        // Anchor (the tree trunk)
        rect(trees_x[i], floorPos_y - 150, 60, 150);

        // Relative points (branches)
        fill(0, 155, 0);
        ellipse(trees_x[i] + 30, floorPos_y - 154, 110, 110);
        ellipse(trees_x[i] - 30, floorPos_y - 154, 90, 90);
        ellipse(trees_x[i] + 75, floorPos_y - 154, 90, 90);
        ellipse(trees_x[i] - 5, floorPos_y - 210, 90, 90);
        ellipse(trees_x[i] + 57, floorPos_y - 210, 92, 92);

        // Blossoms on the trees
        fill(255, 99, 71);
        ellipse(trees_x[i], floorPos_y - 150 - 4, 20, 20);
        ellipse(trees_x[i] + 60, floorPos_y - 154, 20, 20);
        ellipse(trees_x[i] + 30, floorPos_y - 204, 20, 20);
        ellipse(trees_x[i] - 20, floorPos_y - 204, 20, 20);
        ellipse(trees_x[i] + 85, floorPos_y - 204, 20, 20);
    }
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon) {
    fill(30);
    // Main hole
    rect(
        t_canyon.x_pos,
        t_canyon.y_pos,
        t_canyon.width,
        height - t_canyon.y_pos
    );
    // Canyon borders
    fill(128, 70, 27);
    triangle(
        t_canyon.x_pos,
        t_canyon.y_pos,
        t_canyon.x_pos,
        height,
        t_canyon.x_pos + t_canyon.width / 2 - 15,
        height
    );
    triangle(
        t_canyon.x_pos + t_canyon.width,
        t_canyon.y_pos,
        t_canyon.x_pos + t_canyon.width / 2 + 15,
        height,
        t_canyon.x_pos + t_canyon.width,
        height
    );
}

// Function to check character is over a canyon.

function checkCanyon(t_canyon) {
    if (
        t_canyon.x_pos + 15 < gameChar_world_x &&
        gameChar_world_x < t_canyon.x_pos + t_canyon.width - 15 &&
        gameChar_y >= floorPos_y
    ) {
        isPlummeting = true;
        isLeft = false;
        isRight = false;
        gameChar_world_x = t_canyon.x_pos + t_canyon.width / 2;

    }
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.

function drawCollectable(t_collectable, color) {
    // Draw collectable items
    fill(color);
    noStroke();
    // Anchor (LHS circle making up the heart)
    ellipse(
        t_collectable.x_pos,
        t_collectable.y_pos,
        t_collectable.size
    );
    // RHS circle making up the heart
    ellipse(
        t_collectable.x_pos + t_collectable.size / 2,
        t_collectable.y_pos,
        t_collectable.size
    );
    // Bottom of the heart
    triangle(
        t_collectable.x_pos - t_collectable.size / 2.2,
        t_collectable.y_pos + t_collectable.size * 0.21,
        t_collectable.x_pos + t_collectable.size * 0.958,
        t_collectable.y_pos + t_collectable.size * 0.21,
        t_collectable.x_pos + t_collectable.size / 3.9,
        t_collectable.y_pos + t_collectable.size
    );
}

// Function to display num of lives left

function displayLives() {
    textSize(20);
    fill(0);
    text("Lives: " + lives, 20, 60);
}

// Function to check character has collected an item.

function checkCollectable(t_collectable) {
    if (
        dist(
            gameChar_world_x,
            gameChar_y - 50,
            t_collectable.x_pos,
            t_collectable.y_pos) <= 50
    ) {
        t_collectable.isFound = true;
        meowSound.play();
        game_score += 1;
    }
}

// Enemy (the weasel/ferret) constructor function
function Weasel(x, range, size) {

    // Define the object/weasel's properties
    this.x_pos = x;
    this.current_x_pos = x;
    this.size = size;
    this.y_pos = floorPos_y - 50 * this.size;
    this.current_y_pos = floorPos_y - 50 * this.size;
    this.range = range;
    this.x_incr = 1;
    this.y_incr = 0;

    // Function which moves the weasel backwards and forwards
    this.update = function() {

        this.current_x_pos += this.x_incr;
        this.current_y_pos += this.y_incr;

        if (this.current_x_pos >= this.x_pos + this.range) {
            this.x_incr = -1;
            this.current_y_pos = this.y_pos;
            this.y_incr = 0;
        } else if (this.current_x_pos < this.x_pos) {
            this.x_incr = 1;
        }

        // Weasel/ferret "jumps" when moving backwards -
        // if you want to know why, then watch 
        // https://www.youtube.com/watch?v=EcX8fdxtNqM
        if (this.x_incr == 1) {
            if (frameCount % 10 == 0) {
                this.y_incr = -9;
            } else {
                this.y_incr = 1;
            }
        }

    }

    // Function which checks if game character has collided with the weasel
    this.checkContact = function() {

        if (
            gameChar_world_x > this.current_x_pos - 26 * this.size &&
            gameChar_world_x < this.current_x_pos + 166 * this.size &&
            gameChar_y > this.current_y_pos + 2 * this.size
        ) {
            // Play the happy ferret/weasel sound if hasn't already been played
            if (!weaselSound.played) {
                weaselSound.play(0, 1, 0.5, 0, 2);
                weaselSound.played = true;
            }
            // Character falls down/dead eyes when plummeting is set to trrue
            isPlummeting = true;
        } else {
            // Weasels only move if game is actively being played
            // (not if "Game Over" or "Level Completed")
            if (lives > 0 && !flagpole.isReached) {
                this.update();
            }
        }
    }

    // Function which draws the enemy
    this.draw = function() {

        // Calls checkContact every time enemy is rendered
        this.checkContact();

        // Draw ear in beige
        fill(255, 235, 205);
        ellipse(
            this.current_x_pos + (10 * this.size),
            this.current_y_pos, (10 * this.size),
            (20 * this.size)
        );

        // Draw body
        fill(84, 66, 52);
        beginShape();
        curveVertex(
            this.current_x_pos + (15 * this.size),
            this.current_y_pos + (20 * this.size)
        );
        curveVertex(
            this.current_x_pos + (20 * this.size),
            this.current_y_pos + (24 * this.size)
        );
        curveVertex(
            this.current_x_pos + (22 * this.size),
            this.current_y_pos + (26 * this.size)
        );
        curveVertex(
            this.current_x_pos + (15 * this.size),
            this.current_y_pos
        );
        curveVertex(
            this.current_x_pos,
            this.current_y_pos
        );
        curveVertex(
            this.current_x_pos - (12 * this.size),
            this.current_y_pos + (4 * this.size)
        );
        curveVertex(
            this.current_x_pos - (18 * this.size),
            this.current_y_pos + (12 * this.size)
        );
        curveVertex(
            this.current_x_pos - (18 * this.size),
            this.current_y_pos + (14 * this.size)
        );
        curveVertex(
            this.current_x_pos - (18 * this.size),
            this.current_y_pos + (14 * this.size)
        );
        curveVertex(
            this.current_x_pos - (12 * this.size),
            this.current_y_pos + (18 * this.size)
        );
        curveVertex(
            this.current_x_pos,
            this.current_y_pos + (22 * this.size)
        );
        curveVertex(
            this.current_x_pos + (16 * this.size),
            this.current_y_pos + (28 * this.size)
        );
        endShape();

        beginShape();
        // anchor point
        curveVertex(
            this.current_x_pos,
            this.current_y_pos
        );
        curveVertex(
            this.current_x_pos,
            this.current_y_pos + (10 * this.size)
        );
        curveVertex(
            this.current_x_pos + (12 * this.size),
            this.current_y_pos + (40 * this.size)
        );
        curveVertex(
            this.current_x_pos + (15 * this.size),
            this.current_y_pos + (44 * this.size)
        );
        curveVertex(
            this.current_x_pos + (18 * this.size),
            this.current_y_pos + (48 * this.size)
        );
        curveVertex(
            this.current_x_pos + (25 * this.size),
            this.current_y_pos + (50 * this.size)
        );
        curveVertex(
            this.current_x_pos + (27 * this.size),
            this.current_y_pos + (50 * this.size)
        );
        curveVertex(
            this.current_x_pos + (80 * this.size),
            this.current_y_pos + (50 * this.size)
        );
        curveVertex(
            this.current_x_pos + (82 * this.size),
            this.current_y_pos + (48 * this.size)
        );
        curveVertex(
            this.current_x_pos + (92 * this.size),
            this.current_y_pos + (48 * this.size)
        );
        curveVertex(
            this.current_x_pos + (100 * this.size),
            this.current_y_pos + (50 * this.size)
        );
        curveVertex(
            this.current_x_pos + (118 * this.size),
            this.current_y_pos + (50 * this.size)
        );
        endShape();

        beginShape();
        curveVertex(
            this.current_x_pos,
            this.current_y_pos
        );
        curveVertex(
            this.current_x_pos + (20 * this.size),
            this.current_y_pos + (40 * this.size)
        );
        curveVertex(
            this.current_x_pos + (40 * this.size),
            this.current_y_pos + (30 * this.size)
        );
        curveVertex(
            this.current_x_pos + (80 * this.size),
            this.current_y_pos + (20 * this.size)
        );
        curveVertex(
            this.current_x_pos + (120 * this.size),
            this.current_y_pos + (30 * this.size)
        );
        curveVertex(
            this.current_x_pos + (140 * this.size),
            this.current_y_pos + (50 * this.size)
        );
        curveVertex(
            this.current_x_pos + (160 * this.size),
            this.current_y_pos + (50 * this.size)
        );
        endShape();
        ellipse(
            this.current_x_pos + (104 * this.size),
            this.current_y_pos + (50 * this.size),
            (60 * this.size),
            (12 * this.size));

        // Draw legs
        stroke(84, 66, 52);
        strokeWeight(3);
        line(
            this.current_x_pos + (20 * this.size),
            this.current_y_pos + (44 * this.size),
            this.current_x_pos + (24 * this.size),
            this.current_y_pos + (58 * this.size)
        );
        line(
            this.current_x_pos + (26 * this.size),
            this.current_y_pos + (44 * this.size),
            this.current_x_pos + (30 * this.size),
            this.current_y_pos + (60 * this.size)
        );
        line(
            this.current_x_pos + (116 * this.size),
            this.current_y_pos + (46 * this.size),
            this.current_x_pos + (114 * this.size),
            this.current_y_pos + (60 * this.size)
        );
        line(
            this.current_x_pos + (122 * this.size),
            this.current_y_pos + (48 * this.size),
            this.current_x_pos + (120 * this.size),
            this.current_y_pos + (62 * this.size)
        );

        //Draw tail
        strokeWeight(6);
        line(
            this.current_x_pos + (120 * this.size),
            this.current_y_pos + (46 * this.size),
            this.current_x_pos + (162 * this.size),
            this.current_y_pos + (50 * this.size)
        );

        // Draw body markings
        fill(255, 235, 205);
        noStroke();
        ellipse(
            this.current_x_pos + 84 * this.size,
            this.current_y_pos + 34 * this.size,
            50 * this.size, 18 * this.size
        );

        // Draw eye
        fill(0);
        ellipse(
            this.current_x_pos - 3.5 * this.size,
            this.current_y_pos + 6.5 * this.size,
            5 * this.size,
            5 * this.size
        );
        fill(255);
        ellipse(
            this.current_x_pos - 3.5 * this.size,
            this.current_y_pos + 6.5 * this.size,
            1 * this.size,
            1 * this.size);

        // Draw nose
        fill(255, 192, 203);
        ellipse(
            this.current_x_pos - (18 * this.size),
            this.current_y_pos + (14 * this.size),
            5 * this.size);

        // Draw whiskers
        stroke(0);
        strokeWeight(1);
        line(
            this.current_x_pos - (12 * this.size),
            this.current_y_pos + (14 * this.size),
            this.current_x_pos - (2 * this.size),
            this.current_y_pos + (10 * this.size)
        );
        line(
            this.current_x_pos - (12 * this.size),
            this.current_y_pos + (14 * this.size),
            this.current_x_pos - (2 * this.size),
            this.current_y_pos + (14 * this.size)
        );

        noStroke();
    }

}

// Function for drawing the flagpole
function renderFlagpole() {

    push();
    strokeWeight(7);
    stroke(20);

    line(
        flagpole.x_pos,
        floorPos_y,
        flagpole.x_pos,
        floorPos_y - 246
    );

    noStroke();
    fill(255, 0, 255);

    if (flagpole.isReached) {
        rect(flagpole.x_pos - 2, floorPos_y - 250, 80, 40);
    } else {
        rect(flagpole.x_pos - 2, floorPos_y - 50, 80, 40);
    }

    pop();
}

// Function checking if character reached end of level
function checkFlagpole() {
    var distance = abs(gameChar_world_x - flagpole.x_pos);

    if (distance < 15) {
        flagpole.isReached = true;
    }
}

// Function checking if character has died
function checkPlayerDie() {
    if (gameChar_y - 200 > height) {
        lives -= 1;
        if (lives > 0) {
            startGame();
        }
    }
}

function startGame() {

    // Sets new property of each sound, 'played', at the beginning of the game to 'false'
    weaselSound.played = false;
    successSound.played = false;
    gameOverSound.played = false;
    fallSound.played = false;

    // Stops music when character has lost a life and game must be loaded again
    if (music.isPlaying()) {
        music.stop();
    }

    gameChar_x = width / 2;
    gameChar_y = floorPos_y;

    // Variable to control the background scrolling.
    scrollPos = 0;

    // Variable to store the real position of the gameChar in the game
    // world. Needed for collision detection.
    gameChar_world_x = gameChar_x - scrollPos;

    // Boolean variables to control the movement of the game character.
    isLeft = false;
    isRight = false;
    isFalling = false;
    isPlummeting = false;

    // Initialise arrays of scenery objects.
    trees_x = [-200, 100, 800, 1200, 2000]

    clouds = [
        { x_pos: 100, y_pos: 80, size: 1 },
        { x_pos: 450, y_pos: 100, size: 0.8 },
        { x_pos: 790, y_pos: 80, size: 1.2 },
        { x_pos: 1200, y_pos: 80, size: 1.2 },
        { x_pos: 1900, y_pos: 80, size: 1.4 }
    ]

    mountains = [
        { x_pos: -450, y_pos: floorPos_y, size: 1.8 },
        { x_pos: 50, y_pos: floorPos_y, size: 1.8 },
        { x_pos: 440, y_pos: floorPos_y, size: 1 },
        { x_pos: 760, y_pos: floorPos_y, size: 1.7 },
        { x_pos: 1200, y_pos: floorPos_y, size: 2 },
        { x_pos: 1700, y_pos: floorPos_y, size: 2.2 },
        { x_pos: 2000, y_pos: floorPos_y, size: 1.6 }
    ]

    collectables = [{
            x_pos: -700,
            y_pos: floorPos_y - 100,
            size: 25,
            isFound: false
        },
        {
            x_pos: 80,
            y_pos: floorPos_y - 100,
            size: 25,
            isFound: false
        },
        {
            x_pos: 540,
            y_pos: floorPos_y - 105,
            size: 24,
            isFound: false
        },
        {
            x_pos: 900,
            y_pos: floorPos_y - 110,
            size: 22,
            isFound: false
        },
        {
            x_pos: 1600,
            y_pos: floorPos_y - 110,
            size: 22,
            isFound: false
        },
        {
            x_pos: 1800,
            y_pos: floorPos_y - 150,
            size: 22,
            isFound: false
        },
        {
            x_pos: 1400,
            y_pos: floorPos_y - 180,
            size: 20,
            isFound: false
        },
        {
            x_pos: 2300,
            y_pos: floorPos_y - 150,
            size: 24,
            isFound: false
        }
    ]

    canyons = [{
            x_pos: 200,
            y_pos: floorPos_y,
            width: 70
        },
        {
            x_pos: 900,
            y_pos: floorPos_y,
            width: 70
        },
        {
            x_pos: 1600,
            y_pos: floorPos_y,
            width: 70
        },
        {
            x_pos: 1900,
            y_pos: floorPos_y,
            width: 78
        },
        {
            x_pos: 2200,
            y_pos: floorPos_y,
            width: 65
        },
        {
            x_pos: 2200,
            y_pos: floorPos_y,
            width: 65
        }
    ]

    // Creates an array of weasels in specific positions (cannot iterate randomly over, as the
    // weasel cannot be situated over a canyon!!!)
    enemies = [];
    var w = new Weasel(1090, 90, 0.68);
    enemies.push(w);
    w = new Weasel(700, 50, 0.6);
    enemies.push(w);
    w = new Weasel(-190, 110, 0.55);
    enemies.push(w);
    w = new Weasel(-540, 50, 0.7);
    enemies.push(w);
    w = new Weasel(1400, 50, 0.6);
    enemies.push(w);
    w = new Weasel(2350, 20, 0.6);
    enemies.push(w);

    // Resets game score to 0
    game_score = 0;

    flagpole = {
        isReached: false,
        x_pos: 2500
    };

    // Re-starts music from the beginning
    music.play();
}