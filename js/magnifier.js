var Magnifier = Class.create({
	initialize: function(selector, options) {
		$$(selector).each(function(element) {
			new Magnifier.Instance(element, options);
		}.bind(this));
	}
});

// Different pan modes
Magnifier.Modes = {
	MousePan: 'MousePan',
	MouseDrag: 'MouseDrag'
};

Magnifier.Instance = Class.create({
	defaults: {
		mode: Magnifier.Modes.MouseDrag
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
		this.preCalculateConversions();
	},
	
	setupSmallImage: function() {
		// Find the small image
		this.smallImage = this.element.select('img')[0];
		
		// Grab the absolute position and size of the element for later calculations (optimisation)
		this.smallPosition = this.smallImage.cumulativeOffset();
		this.smallSize = this.smallImage.getDimensions();
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
		
		// Grab the size of the large image for small to large conversions (optimisation)
		this.largeSize = this.largeImage.getDimensions();
		this.magnifiedContainerSize = this.magnifiedContainer.getDimensions();
		
		// Setup drag events if in drag mode
		switch (this.options.mode) {
			case Magnifier.Modes.MouseDrag:
				this.magnifiedContainer.observe('mousedown', function(event) {
					this.magnifiedContainerStartDrag = true;

					// Grab the starting positions to calculate offsets later
					this.magnifiedContainerDragStartPosition = this.magnifiedContainer.cumulativeOffset();
					this.magnifiedContainerDragStartMousePosition = { left: event.pageX, top: event.pageY };

					event.stop();
					return false;
				}.bind(this));

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

				$(document.body).observe('mouseup', function(event) {
					this.magnifiedContainerStartDrag = false;
					if (this.magnifiedContainerDragging) {
						this.magnifiedContainerDragging = false;					
						event.stop();
						return false;
					}
				}.bind(this));
				
				break;
			case Magnifier.Modes.MousePan:
				// Since container shows above the small image, we need to attach mousemove events on it too
				this.magnifiedContainer.observe('mousemove', this.mouseUpdateMagnifyPosition.bind(this));

				// Update magnifying whenever mouse moves inside the element
				this.element.observe('mousemove', this.mouseUpdateMagnifyPosition.bind(this));

				break;
		}
		
		this.magnifiedContainer.observe('mouseup', this.toggleMagifier.bind(this));
		this.element.observe('mouseup', this.toggleMagifier.bind(this));
	},
	
	preCalculateConversions: function() {
		// Calculates the size difference between small and large image (optimisation)
		this.sizeRatio = {
			height: (this.largeSize.height - this.magnifiedContainerSize.height) / this.smallSize.height,
			width: (this.largeSize.width - this.magnifiedContainerSize.width) / this.smallSize.width
		};
	},
	
	convertSmallToLarge: function(position) {
		// Converts x,y positions from the small image to match where it should be in the large image
		return {
			left: (this.magnifiedContainerSize.width / 2) + parseInt(position.left * this.sizeRatio.width),
			top: (this.magnifiedContainerSize.height / 2) + parseInt(position.top * this.sizeRatio.height)
		};
	},
	
	mouseUpdateMagnifyPosition: function(event) {
		// Calculate the point on the small image on where to magnify into
		this.magnifyPosition = {
			left: event.pageX - this.smallPosition.left,
			top: event.pageY - this.smallPosition.top
		};
		
		this.updateMagnifiedPosition();
	},
	
	updateMagnifiedPosition: function(event) {
		// Clamp values
		if (this.magnifyPosition.left < 0) { this.magnifyPosition.left = 0; }
		if (this.magnifyPosition.top < 0) { this.magnifyPosition.top = 0; }
		if (this.magnifyPosition.left >= this.smallSize.width) { this.magnifyPosition.left = this.smallSize.width; }
		if (this.magnifyPosition.top >= this.smallSize.height) { this.magnifyPosition.top = this.smallSize.height; }
		
		// Convert that to the position we should be displaying the large image at
		this.magnifiedPosition = this.convertSmallToLarge(this.magnifyPosition);
		
		// Update display of the magnified container
		this.updateMagnifiedContainer();
	},
	
	updateMagnifiedContainer: function() {
		// Adjust magnified position
		this.magnifiedContainer.scrollTop = this.magnifiedPosition.top - (this.magnifiedContainerSize.height / 2);
		this.magnifiedContainer.scrollLeft = this.magnifiedPosition.left - (this.magnifiedContainerSize.width / 2);
		
		// Adjust magnified container display position
		this.magnifiedContainer.setStyle({
			left: (this.magnifyPosition.left + this.smallPosition.left - this.magnifiedContainerSize.width / 2) + 'px',
			top: (this.magnifyPosition.top + this.smallPosition.top - this.magnifiedContainerSize.height / 2) + 'px'
		});
	},
	
	toggleMagifier: function(event) {
		// If dragging then don't toggle magnifier
		if (this.magnifiedContainerDragging) {
			return false;
		}
		
		var visibility = this.magnifiedContainer.getStyle('visibility');
		
		// If showing it, then show it at the position of the mouse
		if (visibility == 'hidden') {
			this.mouseUpdateMagnifyPosition(event);
		}
		
		this.magnifiedContainer.setStyle({ 'visibility': (visibility == 'hidden') ? 'visible' : 'hidden'});
	}
});