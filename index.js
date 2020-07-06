/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

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
var imageSource = new Marzipano.ImageUrlSource.fromString("still.png");

// Whether playback has started.
var started = false;

var video = document.createElement('video');
video.src = 'TuinComp_V3_tim.mp4'
// video.src = 'TuinComp_V3_tim.webm';
video.crossOrigin = 'anonymous'
video.preload = 'auto'

// Try to start playback.
function tryStart() {
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
  //only switch to video if it plays successfully
  video.onplaying = function() {
    console.log('Video is now loaded and playing');
    videoScene.switchTo();
  }


  waitForReadyState(video, video.HAVE_METADATA, 100, function() {
    waitForReadyState(video, video.HAVE_ENOUGH_DATA, 100, function() {
      videoAsset.setVideo(video);
    });
  });
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
var imgScene = viewer.createScene({
  source: imageSource,
  geometry: geometry,
  view: view,
});

var videoScene = viewer.createScene({
  source: videoSource,
  geometry: geometry,
  view: view,
});

// Display scene.
imgScene.switchTo();

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
