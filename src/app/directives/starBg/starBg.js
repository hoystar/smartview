"use strict";

require('./starBg.less');

var moduleName = "app.starBg";

require("three.js");
require("../../libs/Projector.js");
require("../../libs/CanvasRenderer.js");

var app = angular.module(moduleName, []);

app.directive("starBg", [
  function() {
    return {
      restrict: "AE",
      replace: true,
      controller: [
        "$scope",
        function($scope) {

        }
      ],
      controllerAs: "starBg",
      link: function(scope, element, attrs) {
        let mouseX = 20;
        let mouseY = 20;
        let windowWidth = $(element).width();
        let windowHeight = $(element).height();
        let windowHalfX = windowWidth / 2;
        let windowHalfY = windowHeight / 2;
        let SEPARATION = 200;
        let AMOUNTX = 110;
        let AMOUNTY = 10;
        let camera;
        let scene;
        let renderer;

        _init();

        function _init() {

          init();
          animate();
        }

        function init() {

          var container, separation = 100,
            amountX = 50,
            amountY = 50,
            particles, particle;

          container = $(".star-bg")[0];

          camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 1, 10000);
          camera.position.z = 100;

          scene = new THREE.Scene();

          renderer = new THREE.CanvasRenderer();
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.setSize($(element).width(), $(element).height());
          container.appendChild(renderer.domElement);

          var PI2 = Math.PI * 2;
          var material = new THREE.SpriteCanvasMaterial({

            color: 0xffffff,
            program: function(context) {

              context.beginPath();
              context.arc(0, 0, 0.5, 0, PI2, true);
              context.fill();

            }

          });

          var geometry = new THREE.Geometry();

          for (var i = 0; i < 100; i++) {

            particle = new THREE.Sprite(material);
            particle.position.x = Math.random() * 2 - 1;
            particle.position.y = Math.random() * 2 - 1;
            particle.position.z = Math.random() * 2 - 1;
            particle.position.normalize();
            particle.position.multiplyScalar(Math.random() * 10 + 750);
            particle.scale.x = particle.scale.y = 10;
            scene.add(particle);

            geometry.vertices.push(particle.position);

          }

          var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5 }));
          scene.add(line);

          document.addEventListener('mousemove', onDocumentMouseMove, false);
          document.addEventListener('touchstart', onDocumentTouchStart, false);
          document.addEventListener('touchmove', onDocumentTouchMove, false);

          window.addEventListener('resize', onWindowResize, false);
        }

        function animate() {
          requestAnimationFrame(animate);

          render();
        }

        function onDocumentMouseMove(event) {

          mouseX = event.clientX - windowHalfX;
          mouseY = event.clientY - windowHalfY;

        }

        function onDocumentTouchStart(event) {

          if (event.touches.length > 1) {

            event.preventDefault();

            mouseX = event.touches[0].pageX - windowHalfX;
            mouseY = event.touches[0].pageY - windowHalfY;

          }

        }

        function onDocumentTouchMove(event) {

          if (event.touches.length == 1) {

            event.preventDefault();

            mouseX = event.touches[0].pageX - windowHalfX;
            mouseY = event.touches[0].pageY - windowHalfY;

          }

        }

        function onWindowResize() {

          let _width = $(element).width();
          let _height = $(element).height();

          windowHalfX = _width / 2;
          windowHalfY = _height / 2;

          camera.aspect = windowHalfX / windowHalfY;
          camera.updateProjectionMatrix();

          renderer.setSize(_width, _height);

        }

        function render() {

          camera.position.x += (mouseX - camera.position.x) * .05;
          camera.position.y += (-mouseY + 200 - camera.position.y) * .05;
          camera.lookAt(scene.position);

          renderer.render(scene, camera);

        }
      },
      template: require('./starBg.html')
    }
  }
])


module.exports = moduleName;
