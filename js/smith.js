// smith chart
var gWide = 400;
var gCenter = 200;

var roundTo(num, place){
    return Math.round(num * place) / place;
}

function log10(val) {
    return Math.log(val) / Math.LN10;
}

var drawSmithChart = function(){
    // center point object
    var center = {
        x:gCenter,
        y:gCenter
    };
    
    // dimension
    var dimensions = {
        width:gWide,
        height:gWide
    };
    
    noFill(); // no fill!
    stroke(0, 0, 0); // black
    strokeWeight(1);
    
    // main boundry
    ellipse(center.x, center.y, dimensions.width, dimensions.height);
    
    stroke(128, 134, 135); // grayish

    // resistive circles
    ellipse(300, center.y, 200, 200);
    ellipse(350, center.y, 100, 100);
    
    // positive
    arc(400, 0, 400, 400, 90, 180);
    
    // negative
    arc(400, 400, 400, 400, 180, 270);
    
    // main horizontal
    line(0, center.y, dimensions.width, center.y);
};


void setup(){
    size( 600, 600 );
    strokeWeight( 1 );
    frameRate(10);
    background(255);
    noFill();
    PFont fontA = loadFont("courier");
    textFont(fontA, 14);  
}

var gammaReal = -1.0;
var gammaImag = -1.0;

// gamma mag (reflection coefficient)
var gamma_mag = function(){
    return Math.sqrt(Math.pow(gammaReal, 2) + Math.pow(gammaImag, 2));
}

// calc vswr
var vswr = function(){
    return (1 + gamma_mag()) / (1 - gamma_mag());
};

// calc mismatch loss
var mismatch_loss = function(){
    return -10 * log10(1 - Math.pow(gamma_mag(), 2))
}

// resistance value
var zReal = function(){
    // R = (1 - gR^2 - gI^2) / ((1 - gR)^2 + gI^2)
    var num = 1 - Math.pow(gammaReal, 2) - Math.pow(gammaImag, 2);
    var den = Math.pow(1-gammaReal, 2) + Math.pow(gammaImag, 2);
    return 50 * (num / den);
};

// reactance value
var zImag = function(){
    // X = 2*gI / ((1 - gR)^2 + gI^2)
    var num = 2 * gammaImag;
    var den = Math.pow(1-gammaReal, 2) + Math.pow(gammaImag, 2);
    return 50 * (num / den);
};

var return_loss = function(){
    return -20 * log10(gamma_mag())
}

// x pixel of resistance cirlce
var zRealPixel = function(a, b){
    var x1 = Math.pow(gWide, 2) + Math.pow(gCenter, 2);
    var x2 = x1 - Math.pow(a, 2) - Math.pow(b, 2);
    var den = (x2/2) - gCenter*(gCenter-b);
    return den / (gWide - a);
};

// y pixel of reactance cirlce
var zImagPixel = function(a, b){
    var x1 = Math.pow(gWide, 2) + Math.pow(gCenter, 2);
    var x2 = x1 - Math.pow(a, 2) - Math.pow(b, 2);
    var den = (x2/2) - gWide*(gWide-a);
    return den / (gCenter - b);
};

// y pixel of reactance cirlce
var zImagPixel2 = function(a, b){
    var x1 = Math.pow(gWide, 2) + Math.pow(gCenter, 2);
    var x2 = x1 - Math.pow(a, 2) - Math.pow(b, 2);
    var den = (x2/2) - gWide*(gWide-a);
    return den / (gCenter - b);
};

void draw() {
    // reset
    background(250, 250, 250);
    //return;
    // smith chart
    drawSmithChart();
    
    // calculate 'next' gamma point 
    gammaReal += 0.05;
    if (gammaReal > 1.0){
        gammaReal = -1;
        gammaImag += 0.05;
        if (gammaImag > 1.0){
            gammaImag = -1;
        }
    }
    
    gammaReal = (mouseX - gCenter) / gCenter;
    gammaImag = (mouseY - gCenter) / gCenter;
    
    // get gamma as pixel
    var pixelGammaReal =  (gammaReal + 1) * 200;
    var pixelGammaImag =  (gammaImag + 1) * 200;
    
    // draw vswr circle
    stroke(255, 0, 0);
    var radius2 = Math.sqrt(Math.pow(pixelGammaReal-gCenter, 2) + Math.pow(pixelGammaImag-gCenter, 2));
    ellipse(gCenter, gCenter, 2*radius2, 2*radius2);
    
    // draw constant resistance circle
    stroke(0, 0, 255);
    var centerX = zRealPixel(pixelGammaReal, pixelGammaImag);
    var radius = (gWide - centerX);
    ellipse(centerX, gCenter, 2*radius, 2*radius);
    
    // draw constant reactance circle
    stroke(255, 0, 255);
    var centerY = 0;
    if (pixelGammaImag < gCenter){
        centerY = zImagPixel(pixelGammaReal, pixelGammaImag);
        var radius = (gCenter - centerY);
        ellipse(gWide, centerY, 2*radius, 2*radius);
    }
    else{
        centerY = zImagPixel2(pixelGammaReal, pixelGammaImag);
        var radius = (centerY - gCenter);
        ellipse(gWide, centerY, 2*radius, 2*radius);
    }
    
    // draw gamma point 
    fill(50, 224, 27);
    stroke(50, 224, 27);
    ellipse(pixelGammaReal, pixelGammaImag, 10, 10);
    
    // write vswr
    fill(0, 0, 0);
    text("vswr = " + roundTo(vswr(), 100), 1, 450);
    
    // write Z
    var zR = roundTo(zReal(), 10);
    var zI = Math.abs(roundTo(zImag(), 10));
    var operator = (zImag() > 0) ? " - " : " + j";
    text("z = " + zR + operator + zI, 1, 463);
    
    // write gamma
    var gR = roundTo(gammaReal, 100);
    var gI = Math.abs(roundTo(gammaImag , 100));
    text("gamma = " + gR + operator + gI, 1, 476);

    // reflection coeff
    text("reflection coeff (gamma magnitude) = " + roundTo(gamma_mag(), 100), 1, 489);

    // return loss
    text("return loss = " + roundTo(return_loss(), 100), 1, 502);

    // mismatch loss
    text("mismatch loss = " + roundTo(mismatch_loss(), 100), 1, 515);
};

