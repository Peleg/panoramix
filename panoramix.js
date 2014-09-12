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
    this.scale     = null;

    this.loadImage(options.imageUrl, function () {
      that.showImage();
      that.bindDragging();
      that.layout();
      that.$window.resize(function () {
        setTimeout(function () {
          that.layout();
        }, 500);
      });
      if (typeof that.options.load === 'function') {
        that.options.load();
      }
    });

    this.setupHtml();
    this.setupChildren();
  };

  Panoramix.PREFIX = 'pmx-';

  Panoramix.DEFAULTS = {
    walls  : 1,
    load   : null
  };

  Panoramix.prototype.layout = function () {
    this.updateScale();
    this.placeItems();
  };

  // Caches children data attributes (dimensions + positions)
  // when arent passed in an array
  Panoramix.prototype.setupChildren = function () {
    var data;
    var $children = this.$childrenCont.children().css('position', 'absolute');
    this.children = $children.map(function (_i, child) {
      data = $(child).data();
      return {
        '$element' : $(child),
        'width'    : data.width,
        'top'      : data.top,
        'left'     : data.left
      };
    });
  };

  // Loads panorama image asyncly and calls cb when done
  Panoramix.prototype.loadImage = function(imageUrl, cb) {
    var image = new Image();
    image.onload = cb;
    image.src = imageUrl;
    this.image = image;
  };

  Panoramix.prototype.showImage = function () {
    this.$imageCont.fadeIn();
  };

  Panoramix.prototype.newLeft = function (px) {
    var newLeft = parseInt(this.$imageCont.css('backgroundPosition')) + px;
    return Math.min(0, Math.max(newLeft, this.maxLeft)) + 'px';
  };

  Panoramix.prototype.moveLeft = function (px) {
    var newLeft = this.newLeft(px);
    this.$imageCont.css('backgroundPosition', newLeft + ' 0px');
    this.$childrenCont.css('left', newLeft);
  },

  Panoramix.prototype.slide = function (direction) {
    var px = (direction === 'right' ? -1 : 1) * parseInt(this.$imageCont.width());
    var newLeft = this.newLeft(px);
    this.$imageCont.animate({
      'backgroundPosition' : newLeft
    }, {
      'easing'   : 'swing',
      'duration' : 1000
    });
    this.$childrenCont.animate({
      'left' : newLeft
    }, {
      'easing'   : 'swing',
      'duration' : 1000
    });
  };

  Panoramix.prototype.bindDragging = function () {
    var mousemove = function (e) {
      e.preventDefault();
      e.clientX || (e = window.event.touches[0]);
      if (that.lastX) that.moveLeft(e.clientX - that.lastX);
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
    //using $window dimensions to avoid scrollbars.
    var scaleX = this.$window.width() / (this.image.width / this.options.walls);
    var scaleY = (this.$window.height()) / this.image.height;
    this.scale = Math.min(scaleX, scaleY);

    this.$element.css({
      'width'  : this.scale * this.image.width / this.options.walls,
      'height' : this.scale * this.image.height
    });
    this.maxLeft = - (this.scale * this.image.width - this.$element.width());
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
    this.addArrows();
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
      'user-select'           : 'none',
      'margin'                : '0 auto'
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
        'backgroundRepeat'    : 'no-repeat',
        'backgroundSize'      : 'cover',
        'backgroundPosition'  : '0px 0px',
        'width'               : '100%',
        'height'              : '100%',
        'display'             : 'none'
      }
    })).parent();
  };

  Panoramix.prototype.addArrows = function () {
    var $leftArrow = $('<a>', {
      'data-direction' : 'left',
      'html'           : '&#8249;',
      'href'           : '#',
      'css'            : {
        'color'          : 'white',
        'position'       : 'absolute',
        'fontSize'       : '50px',
        'height'         : '80px',
        'top'            : '0',
        'bottom'         : '0',
        'left'           : '0',
        'zIndex'         : '1',
        'textDecoration' : 'none',
        'margin'         : 'auto 15px'
      },
      click : function (e) {
        e.preventDefault();
        that.slide($(this).data('direction'));
      }
    });

    var $rightArrow = $leftArrow
      .clone(true)
      .data('direction', 'right')
      .html('&#8250;')
      .css({
        'left'  : 'auto',
        'right' : '0'
      });

    this.$element.prepend($leftArrow, $rightArrow);
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
