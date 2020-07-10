'use strict';

//Set the backButtonMode options: disabled, home, back
var backButtonMode = "home"

function backButton(){
  if ( backButtonMode == "disabled" ) {
    return;
  } else if ( backButtonMode == "home" || document.referrer == "") {
    window.open("https://slagwerkdenhaag.nl/", "_self"); //TODO: change to /?
  } else if ( backButtonMode == "back" ) {
    window.history.back();
  } else {
    return;
  }
}

// var backButton = document.getElementById("close");
// backButton.


// Create viewer.
// Video requires WebGL support.
var viewerOpts = { stageType: 'webgl' };
var viewer = new Marzipano.Viewer(document.getElementById('pano'), viewerOpts);
var data = window.data;

// Register the custom control method.
var deviceOrientationControlMethod = new DeviceOrientationControlMethod();
var controls = viewer.controls();
controls.registerMethod('deviceOrientation', deviceOrientationControlMethod);

// Create source.
var videoAsset = new VideoAsset();
var videoSource = new Marzipano.SingleAssetSource(videoAsset);
var imageSource = new Marzipano.ImageUrlSource.fromString("//timfi.github.io/sdh_360player/still.jpg");

// Whether playback has started.
var started = false;

var video = document.createElement('video');
video.src = '//timfi.github.io/sdh_360player/video/TuinComp_V4.mp4'
video.crossOrigin = 'anonymous'
video.preload = 'auto'

function hideIntro(){
    var intro = document.getElementById("intro");
    intro.style.display = "none";
    intro.style.zIndex = -100;
}

// Try to start playback.
function tryStart() {
  if (started) {
    return;
  }
  hideIntro();
  started = true;

  //video.autoplay = true;
  video.loop = true;

  // Prevent the video from going full screen on iOS.
  video.playsInline = true;
  video.webkitPlaysInline = true;
  video.play();

  

  waitForReadyState(video, video.HAVE_METADATA, 100, function() {
    console.log("Video has metadata");
    waitForReadyState(video, video.HAVE_ENOUGH_DATA, 100, function() {
      console.log("Video has enough data");
      videoAsset.setVideo(video);
    });
  });

  //only switch to video if it plays successfully
  video.onplaying = function() {
    console.log('Video is now loaded and playing');
    scene.createLayer({
      source: videoSource,
      geometry: geometry,
    });  }

}



function waitForReadyState(element, readyState, interval, done) {
  var timer = setInterval(function() {
    if (element.readyState >= readyState) {
      clearInterval(timer);
      done(null, true);
    }
  }, interval);
}


// Create geometry.
var geometry = new Marzipano.EquirectGeometry([ { width: 1 } ]);

// Create view.
var limiter = Marzipano.RectilinearView.limit.vfov(90*Math.PI/180, 90*Math.PI/180);
var view = new Marzipano.RectilinearView({ fov: Math.PI/2 }, limiter);

// Create scene.
var scene = viewer.createScene({
  source: imageSource,
  view: view,
  geometry: geometry
});

//create imglayer
scene.createLayer({
  source: imageSource,
  geometry: geometry,
  //make this a fallback layer
  pinFirstLevel: true
});

// Display scene.
scene.switchTo();


// Start playback on click.
// Playback cannot start automatically because most browsers require the play()
// method on the video element to be called in the context of a user action.
document.body.addEventListener('click', tryStart);
document.body.addEventListener('touchstart', tryStart);

// Set up control for enabling/disabling device orientation.

var enabled = false;

var toggleElement = document.getElementById('toggleDeviceOrientation');

function enable() {
  // Request permission for iOS 13+ devices
  console.log("RANNN");
  if (
    DeviceMotionEvent &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    DeviceMotionEvent.requestPermission();
  }
  deviceOrientationControlMethod.getPitch(function(err, pitch) {
    if (!err) {
      view.setPitch(pitch);
    }
  });
  controls.enableMethod('deviceOrientation');
  enabled = true;
  toggleElement.className = 'enabled';
}

function disable() {
  controls.disableMethod('deviceOrientation');
  enabled = false;
  toggleElement.className = '';
}

function toggle() {
  if (enabled) {
    disable();
  } else {
    enable();
  }
}

toggleElement.addEventListener('click', toggle);

//hotspots
var container = scene.hotspotContainer();

var pitch01 = 0 * Math.PI/180
var pitch02 = 0 * Math.PI/180
var pitch03 = 2 * Math.PI/180
var pitch04 = -3 * Math.PI/180
var yaw01 = 332 * Math.PI/180 //plant
var yaw02 = 70 * Math.PI/180 //drumstokken
var yaw03 = 149 * Math.PI/180 //emmer
var yaw04 = 230 * Math.PI/180 //microfoon

container.createHotspot(document.getElementById('iframespot01'), { yaw: yaw01, pitch: pitch01 }, 
  { perspective: { radius: 1640, extraTransforms: "rotateX(5deg)" }});
container.createHotspot(document.getElementById('iframespot02'), { yaw: yaw02, pitch: pitch02 }, 
  { perspective: { radius: 1640, extraTransforms: "rotateX(5deg)" }});
container.createHotspot(document.getElementById('iframespot03'), { yaw: yaw03, pitch: pitch03 }, 
  { perspective: { radius: 1640, extraTransforms: "rotateX(5deg)" }});
container.createHotspot(document.getElementById('iframespot04'), { yaw: yaw04, pitch: pitch04 }, 
  { perspective: { radius: 1640, extraTransforms: "rotateX(5deg)" }});

function iframespot01Clicked(){
  console.log("CLICKED1");
}
function iframespot02Clicked(){
  console.log("CLICKED2");
}
function iframespot03Clicked(){
  console.log("CLICKED3");
}
function iframespot04Clicked(){
  console.log("CLICKED4");
}

// var wrapper01 = document.getElementById('iframespot01');
// wrapper01.innerHTML = '<iframe width="640" height="1200">';

// var wrapper02 = document.getElementById('iframespot02');
// wrapper02.innerHTML = '<iframe width="640" height="1100">';

// var wrapper03 = document.getElementById('iframespot03');
// wrapper03.innerHTML = '<iframe width="640" height="1200">';

// var wrapper04 = document.getElementById('iframespot04');
// wrapper04.innerHTML = '<iframe width="640" height="1200">';

