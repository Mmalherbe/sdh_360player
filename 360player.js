'use strict';

//Set the backButtonMode options: disabled, home, back

var overlayVideo = document.getElementById('overlayVideo');
var backButton = document.getElementById('close');
var intro = document.getElementById("intro");
var toggleElement = document.getElementById('toggleDeviceOrientation');
var hotspot01 = document.getElementById('iframespot01');
var hotspot02 = document.getElementById('iframespot02');
var hotspot03 = document.getElementById('iframespot03');
var hotspot04 = document.getElementById('iframespot04');
var hotspotImages = document.getElementsByClassName("transparant-img");

backButton.style.display = 'none';
toggleElement.style.display = 'none';

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
// var imageSource = new Marzipano.ImageUrlSource.fromString("//timfi.github.io/sdh_360player/still.jpg");
var imageSource = new Marzipano.ImageUrlSource.fromString("still.jpg");

// Whether playback has started.
var started = false;

var video = document.createElement('video');
// video.src = '//timfi.github.io/sdh_360player/video/TuinComp_V4.mp4'
video.src = 'video/TuinComp_V4.mp4'
video.crossOrigin = 'anonymous'
video.preload = 'auto'

function hideIntro(){
    intro.style.display = "none";
    intro.style.zIndex = -100;
    tryStart();
    video.play();
    enable();
}

function showToggleElement(){
  // if mobile
  if (/Mobi|Android/i.test(navigator.userAgent )) {
    console.log("MOBILE!!");
    toggleElement.style.display = 'block';
  } else {
    console.log("NOT MOBILE");
  }
}

// Try to start playback.
function tryStart() {
  closeIframe()
  if (started) {
    return;
  }
  started = true;

  //video.autoplay = true;
  video.loop = true;

  // Prevent the video from going full screen on iOS.
  video.playsInline = true;
  video.webkitPlaysInline = true;
  video.play();

  

  waitForReadyState(video, video.HAVE_METADATA, 100, function() {
    // console.log("Video has metadata");
    waitForReadyState(video, video.HAVE_ENOUGH_DATA, 100, function() {
      // console.log("Video has enough data");
      videoAsset.setVideo(video);
    });
  });

  //only switch to video if it plays successfully
  video.onplaying = function() {
    // console.log('Video is now loaded and playing');
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
// intro.addEventListener('click', tryStart);
// intro.addEventListener('touchstart', tryStart);
// document.body.addEventListener('click', tryStart);
// document.body.addEventListener('touchstart', tryStart);

// Set up control for enabling/disabling device orientation.

var enabled = false;

// if ( DeviceMotionEvent ){
//   toggleElement.style.zIndex = '-100';
// }


function enable() {
  // Request permission for iOS 13+ devices
  // console.log("RANNN");
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

container.createHotspot(hotspot01, { yaw: yaw01, pitch: pitch01 }, 
  { perspective: { radius: 1640, extraTransforms: "rotateX(5deg)" }});
container.createHotspot(hotspot02, { yaw: yaw02, pitch: pitch02 }, 
  { perspective: { radius: 1640, extraTransforms: "rotateX(5deg)" }});
container.createHotspot(hotspot03, { yaw: yaw03, pitch: pitch03 }, 
  { perspective: { radius: 1640, extraTransforms: "rotateX(5deg)" }});
container.createHotspot(hotspot04, { yaw: yaw04, pitch: pitch04 }, 
  { perspective: { radius: 1640, extraTransforms: "rotateX(5deg)" }});


function closeIframe(){
  // console.log("TRYING TO CLOSE IFRAME")
  overlayVideo.innerHTML = '';
  overlayVideo.style.display = 'none';
  backButton.style.display = 'none';
  showToggleElement()
  for (var i = 0; i < hotspotImages.length; i++) {
    hotspotImages[i].style.display = 'block';
  }
}

function iframespotClicked(input = input){
  // console.log(input);
  overlayVideo.style.zIndex = 100;
  overlayVideo.style.display = 'block';
  backButton.style.display = 'block';
  disable();
  video.pause();
  toggleElement.style.display = 'none';
  for (var i = 0; i < hotspotImages.length; i++) {
    hotspotImages[i].style.display = 'none';
  }
  // console.log("READDDDASDASD");
  if ( input == 1 ){
    //window.open("01_planten.html", "_self"); //TODO: change to /?
    overlayVideo.innerHTML = '<iframe src="https://player.vimeo.com/video/436186152?autoplay=1&title=0&byline=0&portrait=0" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe><script src="https://player.vimeo.com/api/player.js"></script>'
  } else if ( input == 2 ){
    // window.open("02_potjes.html", "_self"); //TODO: change to /?
    overlayVideo.innerHTML = '<iframe src="https://player.vimeo.com/video/436186014?autoplay=1&title=0&byline=0&portrait=0" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe><script src="https://player.vimeo.com/api/player.js"></script>'
  } else if ( input == 3 ){
    // window.open("03_water.html", "_self"); //TODO: change to /?
    overlayVideo.innerHTML = '<iframe src="https://player.vimeo.com/video/436185732?autoplay=1&title=0&byline=0&portrait=0" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe><script src="https://player.vimeo.com/api/player.js"></script>'
  } else if ( input == 4 ){
    // window.open("04_zingen.html", "_self"); //TODO: change to /?
    overlayVideo.innerHTML = '<iframe src="https://player.vimeo.com/video/436185904?autoplay=1&title=0&byline=0&portrait=0" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe><script src="https://player.vimeo.com/api/player.js"></script>'
  } else {
    return;
  }
}