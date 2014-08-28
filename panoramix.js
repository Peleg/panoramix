!function (window, $) {

  'use strict';

  //
  // $element = top container to hold panorama image
  // options  = optional
  //

  var that;

  var Panoramix = function ($element, options) {
    that           = this;
    this.$element  = $element;
    this.options   = $.extend(Panoramix.DEFAULTS, options);
    this.$window   = $(window);
    this.maxLeft   =
    this.scaleX    =
    this.scaleY    =
    this.scale     = null;

    this.loadImage(options.imageUrl, function () {
      that.showImage();
      that.bindDragging();
      that.layout();
      that.$window.resize(function () {
        that.layout();
      });
      if (typeof that.options.load === 'function') {
        that.options.load();
      }
    });

    this.setupHtml();
    this.setupChildren();

  };

  Panoramix.PREFIX = 'pmx-';

    // TODO: add: startingPoint, css arrows + jumps
  Panoramix.DEFAULTS = {
    repeat : 'no-repeat',
    load   : null
  };

  Panoramix.prototype.layout = function () {
    this.updateScale();
    this.placeItems();
  };

  // Caches children data attributes (dimensions + positions)
  // when arent passed in an array
  Panoramix.prototype.setupChildren = function () {
    var $child;
    var $children = this.$childrenCont.children().css('position', 'absolute');
    this.children = $children.map(function (_i, child) {
      $child = $(child);
      return {
        '$element' : $child,
        'width'    : $child.data('width'),
        'top'      : $child.data('top'),
        'left'     : $child.data('left')
      };
    });
  };

  // Loads panorama image asyncly and calls cb when done
  Panoramix.prototype.loadImage = function(imageUrl, cb) {
    this.image = new Image();
    this.image.onload = cb;
    this.image.src = imageUrl;
  };

  Panoramix.prototype.showImage = function () {
    this.$imageCont.fadeIn();
  };

  Panoramix.prototype.bindDragging = function () {
    var newLeft;

    var mousemove = function (e) {
      e.preventDefault();
      e.clientX || (e = window.event.touches[0]);
      if (that.lastX) {
        // TODO: make sure clientX is correct
        newLeft = parseInt(that.$imageCont.css('backgroundPosition')) + (e.clientX - that.lastX);
        newLeft = Math.min(0, Math.max(newLeft, that.maxLeft)) + 'px';
        that.$imageCont.css('backgroundPosition', newLeft);
        that.$childrenCont.css('left', newLeft);
      }
      that.lastX = e.clientX;
    };

    var mouseup = function (e) {
      that.$window.off('mousemove.pmx, touchmove.pmx');
      that.lastX = null;
    };

    this.$element.on('mousedown.pmx, touchstart.pmx', function (e) {
      that.$window.on('mousemove.pmx, touchmove.pmx', mousemove);
      that.$window.one('mouseup.pmx, touchend.pmx', mouseup);
    });
  };

  Panoramix.prototype.updateScale = function () {
    this.scaleX  = this.$imageCont.width() / this.image.width;
    this.scaleY  = this.$imageCont.height() / this.image.height;
    this.scale   = Math.max(this.scaleX, this.scaleY);
    this.maxLeft = this.options.repeat === 'no-repeat' ? this.$imageCont.width() - (this.scaleY * this.image.width) : -Infinity;
  };

  Panoramix.prototype.placeItems = function () {
    this.children.each(function (_i, child) {
      child.$element.css({
        width : child.width * that.scale,
        top   : child.top * that.scale,
        left  : child.left * that.scale
      });
    });
  };

  //
  // HTML/CSS setup
  //

  Panoramix.prototype.setupHtml = function () {
    this.setupContainer();
    this.setupChildrenCont();
    this.setupImageCont();
  };

  Panoramix.prototype.setupContainer = function () {
    this.$element.css({
      'position'              : 'relative',
      'overflow'              : 'hidden',
      '-webkit-user-drag'     : 'none',
      '-moz-user-select'      : 'none',
      '-ms-user-select'       : 'none',
      '-webkit-touch-callout' : 'none',
      '-webkit-user-select'   : 'none',
      'user-select'           : 'none'
    }).on('dragstart', function (e) {
      e.preventDefault();
      return false;
    });
  };

  Panoramix.prototype.setupChildrenCont = function () {
    this.$childrenCont = this.$element.children().wrapAll($('<div/>', {
      'class' : Panoramix.PREFIX + 'children',
      'css'   : {
        'top'      : '0',
        'left'     : '0',
        'width'    : '100%',
        'height'   : '100%',
        'position' : 'absolute',
      }
    })).parent();
  };

  Panoramix.prototype.setupImageCont = function () {
    this.$imageCont = this.$childrenCont.wrap($('<div/>', {
      'class' : Panoramix.PREFIX + 'image',
      'css'   : {
        'backgroundImage'     : 'url(' + this.image.src + ')',
        'backgroundRepeat'    : this.options.repeat,
        'backgroundSize'      : 'cover',
        'backgroundPosition'  : '0px',
        'width'               : '100%',
        'height'              : '100%',
        'display'             : 'none'
      }
    })).parent();
  };

  //
  // jQuery plugin definition
  //

  $.fn.panoramix = function(option) {
    var data    = this.data('pmx');
    var options = typeof option == 'object' && option;

    if (!data) this.data('pmx', new Panoramix(this, options));
    if (typeof option == 'string') data[option]();
  };

}(window, jQuery);