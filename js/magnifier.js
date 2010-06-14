var Magnifier = Class.create({
	initialize: function(selector, options) {
		$$(selector).each(function(element) {
			new Magnifier.Instance(element, options);
		}.bind(this));
	}
});

// Different pan modes
Magnifier.Modes = {
	MousePan:  'MousePan',
	MouseDrag: 'MouseDrag',
	MouseZoom: 'MouseZoom'
};

Magnifier.Instance = Class.create({
	defaults: {
		zoomSpeed: 0.2,
		mode: Magnifier.Modes.MouseDrag,
		magnifedContainerClass: 'magnified-container'
	},
	
	initialize: function(element, options) {
        this.options = Object.extend(Object.extend({ }, this.defaults), options || { });
		this.element = element;
		
		// Preload image, then run setup once image has loaded
		this.preload();
	},
	
	preload: function() {
		// Preload the large zoomed image
		this.largeImage = new Element('img');
		this.largeImage.observe('load', this.setup.bind(this));
		this.largeImage.writeAttribute('src', this.element.readAttribute('href'));
		
		// Make large image relative as we need to move it around
		this.largeImage.setStyle({
			position: 'relative',
			display: 'block'
		});
	},
	
	setup: function() {
		// Clear the link on the small image
		this.element.writeAttribute('href', null);
		
		this.setupSmallImage();
		this.setupMagnifiedContainer();
		this.setupZoomLevel();
	},
	
	setupZoomLevel: function() {
		if (this.options.mode == Magnifier.Modes.MouseZoom) {
			// Default for MouseZoom mode is zoomed out
			this.zoomOut(false);
		} else {
			// Ohter modes don't have variable zooming
			this.zoomLevel = 1;
		}
	},
	
	setupSmallImage: function() {
		// Find the small image
		this.smallImage = this.element.select('img')[0];
		
		// Grab the absolute position and size of the element for later calculations (optimisation)
		this.smallPosition = this.smallImage.cumulativeOffset();
		this.smallSize = this.smallImage.getDimensions();
	},
	
	setupMouseToggle: function() {
		// Magnifier toggler
		this.magnifiedContainer.observe('mouseup', this.toggleMagnifier.bind(this));
		this.smallImage.observe('mouseup', this.toggleMagnifier.bind(this));
	},
	
	setupMouseMove: function() {
		// Since container shows above the small image, we need to attach mousemove events on it too
		this.magnifiedContainer.observe('mousemove', this.mouseUpdateMagnifyPosition.bind(this));
		this.smallImage.observe('mousemove', this.mouseUpdateMagnifyPosition.bind(this));
	},
	
	setupMouseDrag: function() {
		// Start drag
		this.magnifiedContainer.observe('mousedown', function(event) {
			this.magnifiedContainerStartDrag = true;

			// Grab the starting positions to calculate offsets later
			this.magnifiedContainerDragStartPosition = this.magnifiedContainer.cumulativeOffset();
			this.magnifiedContainerDragStartMousePosition = { left: event.pageX, top: event.pageY };

			event.stop();
			return false;
		}.bind(this));
		
		// Start dragging
		$(document.body).observe('mousemove', function(event) {
			if (this.magnifiedContainerStartDrag) {
				this.magnifiedContainerDragging = true;
				
				// Calculate how much mouse has moved since start of drag
				var offset = {
					left: event.pageX - this.magnifiedContainerDragStartMousePosition.left,
					top: event.pageY - this.magnifiedContainerDragStartMousePosition.top
				};
				
				// Perform the dragging
				this.magnifyPosition = {
					left: (this.magnifiedContainerDragStartPosition.left + offset.left) - this.smallPosition.left + (this.magnifiedContainerSize.width / 2),
					top: (this.magnifiedContainerDragStartPosition.top + offset.top) - this.smallPosition.top + (this.magnifiedContainerSize.height / 2)
				};
				
				this.updateMagnifiedPosition();

				event.stop();
				return false;
			}
		}.bind(this));
		
		// Stop dragging
		$(document.body).observe('mouseup', function(event) {
			this.magnifiedContainerStartDrag = false;
			if (this.magnifiedContainerDragging) {
				this.magnifiedContainerDragging = false;					
				event.stop();
				return false;
			}
		}.bind(this));
	},
	
	setupMouseZoom: function() {
		// Overlay magnifier directly on top of small image
		this.magnifiedContainer.setStyle({
			left: this.smallPosition.left + 'px',
			top: this.smallPosition.top + 'px',
			width: this.smallSize.width + 'px',
			height: this.smallSize.height + 'px'
		});
	
		this.magnifiedContainer.observe('mouseout', this.zoomOut.bind(this));
	},
	
	setupMagnifiedContainer: function() {
		// Setup magnified container
		this.magnifiedContainer = new Element('div', { 'class': this.options.magnifedContainerClass });
		this.magnifiedContainer.insert(this.largeImage);
		
		// Make sure container is absolute positioned
		this.magnifiedContainer.setStyle({
			position: 'absolute',
			visibility: 'hidden'
		});
		
		// Add to the end of the DOM
		$(document.body).insert(this.magnifiedContainer);
		
		// Setup drag events if in drag mode
		switch (this.options.mode) {
			case Magnifier.Modes.MouseDrag:
				this.setupMouseDrag();
				this.setupMouseToggle();
				break;
			case Magnifier.Modes.MousePan:
				this.setupMouseMove();
				this.setupMouseToggle();
				break;
			case Magnifier.Modes.MouseZoom:
				this.setupMouseZoom();
				this.setupMouseMove();
				
				// Show by default
				this.toggleMagnifier();
				break;
		}
		
		// Grab the size of the large image for small to large conversions (optimisation)
		this.largeSize = this.largeImage.getDimensions();
		this.magnifiedContainerSize = this.magnifiedContainer.getDimensions();
	},
	
	convertSmallToLarge: function(position) {
		var sizeRatio = {
			height: ((this.largeSize.height * this.zoomLevel) - this.magnifiedContainerSize.height) / this.smallSize.height,
			width: ((this.largeSize.width * this.zoomLevel) - this.magnifiedContainerSize.width) / this.smallSize.width
		};
		
		// Converts x,y positions from the small image to match where it should be in the large image
		return {
			left: position.left * sizeRatio.width,
			top: position.top * sizeRatio.height
		};
	},
	
	getDisplayDimensions: function(position) {
		// Convert to position to use when displaying the magnifier
		var position = {
			left: this.magnifiedPosition.left,
			top: this.magnifiedPosition.top
		};
		
		// Scale the image as well
		var size = {
			width: this.largeSize.width * this.zoomLevel,
			height: this.largeSize.height * this.zoomLevel	
		};
		
		// Clamp size
		if (position.left < 0) { position.left = 0; }
		if (position.top < 0) { position.top = 0; }
		if (position.left >= size.width) { position.left = size.width; }
		if (position.top >= size.height) { position.top = size.height; }
		
		return { position: position, size: size };
	},
	
	mouseUpdateMagnifyPosition: function(event) {
		this.zoomLevel = 1;
		
		// Calculate the point on the small image on where to magnify into
		this.magnifyPosition = {
			left: event.pageX - this.smallPosition.left,
			top: event.pageY - this.smallPosition.top
		};
		
		this.updateMagnifiedPosition();
	},
	
	updateMagnifiedPosition: function(animate) {
		// Clamp values
		if (this.magnifyPosition.left < 0) { this.magnifyPosition.left = 0; }
		if (this.magnifyPosition.top < 0) { this.magnifyPosition.top = 0; }
		if (this.magnifyPosition.left >= this.smallSize.width) { this.magnifyPosition.left = this.smallSize.width; }
		if (this.magnifyPosition.top >= this.smallSize.height) { this.magnifyPosition.top = this.smallSize.height; }
		
		// Convert that to the position we should be displaying the large image at
		this.magnifiedPosition = this.convertSmallToLarge(this.magnifyPosition);
		
		// Update display of the magnified container
		this.updateMagnifiedContainer(animate);
	},
	
	updateMagnifiedContainer: function(animate) {
		// Default is to animate
		if (animate == undefined) { animate = true; }
		
		// Adjust magnified position
		var displayDimensions = this.getDisplayDimensions();
		
		// New position and size
		var styles = {
			left: -displayDimensions.position.left + 'px',
			top: -displayDimensions.position.top + 'px',
			width: displayDimensions.size.width + 'px',
			height: displayDimensions.size.height + 'px'
		};
		
		// If animate, then we animate the repositioning/resizing, otherwise just set it
		// Only animate for MouseZoom mode
		if (animate && this.options.mode == Magnifier.Modes.MouseZoom) {
			if (this.effect) { this.effect.cancel(); }
			this.effect = new Effect.Morph(this.largeImage, {
				style: styles,
				transition: Effect.Transitions.linear,
				duration: this.options.zoomSpeed
			});
		} else {
			this.largeImage.setStyle(styles);
		}
		
		switch (this.options.mode) {
			case Magnifier.Modes.MousePan:
			case Magnifier.Modes.MouseDrag:		
				// Adjust magnified container display position
				this.magnifiedContainer.setStyle({
					left: (this.magnifyPosition.left + this.smallPosition.left - this.magnifiedContainerSize.width / 2) + 'px',
					top: (this.magnifyPosition.top + this.smallPosition.top - this.magnifiedContainerSize.height / 2) + 'px'
				});
				break;
		}
			
	},
	
	toggleMagnifier: function(event) {
		// If dragging then don't toggle magnifier
		if (this.magnifiedContainerDragging) {
			return false;
		}
		
		var visibility = this.magnifiedContainer.getStyle('visibility');
		
		// If showing it, then show it at the position of the mouse
		if (visibility == 'hidden' && event != undefined) {
			this.mouseUpdateMagnifyPosition(event);
		}
		
		this.magnifiedContainer.setStyle({ 'visibility': (visibility == 'hidden') ? 'visible' : 'hidden'});
	},
	
	zoomOut: function(animate) {
		// Default state is to show whole of large image at 0, 0
		this.magnifyPosition = { left: 0, top: 0 };
		this.zoomLevel = this.smallSize.width / this.largeSize.width;
		this.updateMagnifiedPosition(animate);
	}
});