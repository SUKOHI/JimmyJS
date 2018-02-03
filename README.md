# JimmyJS
A JavaScript package for HTML5 canvas.  
This package is maintained under Google Chrome.

[Demo](http://demo-laravel52.capilano-fw.com/jimmy)

# Preparation

You can install the package through bower.

    bower install jimmyjs

And load `jimmy.js` like so.

    <script src="/YOUR-PATH/jimmy/jimmy.js"></script>
    
That' all!

# Usage

(HTML)

    <canvas id="my-canvas"></canvas>

(JavaScript)

    window.onload = function() {

        JIMMY.init('my-canvas', {
            size: {
                width: 600,
                height: 400
            }
        });

    };
    
# Method
## setType(type)

Set drawing type.  

* arrow
* line
* lineWithDot
* strokeOval
* fillOval
* strokeCircle
* fillCircle
* strokeRect
* fillRect
* strokeText
* fillText

    JIMMY.setType('arrow');
    
## setLineWidth(width)

Set line width.

    JIMMY.setLineWidth(5);   // Default is 4.

## setColor(color)

Set color.

    JIMMY.setColor('#ff0000');

## setFontFamily(family)

Set font family.

    JIMMY.setFontFamily('sans-serif'); // Default is 'sans-serif'.

## setFontSize(size)

Set font size.

    JIMMY.setFontSize(20);  // Default is 18.
    
## setBackgroundColor(color)

Set background color of canvas.

    JIMMY.setBackgroundColor('#eef');
    
## setBackgroundImage(datUrl, x, y)

Set background image.

    let imageSource = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAsVBMVEUAAAA0SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV40SV5dKuabAAAAOnRSTlMAAQIDBQYHCAsPEBESExccISUnMTY4OkFFRltod3uLj5KdpaawtbrFyMrM09na4OLk6e3v8fX3+fv9zCm2swAAAH1JREFUGBmdwdkWgWAAhdEvMguZ58wkQxLqvP+D+VcXXVv25geWFC6Dd3Q4SR0MK1WuhVFLlPMwVpJ8P7wdL5KaQKxXnUxfGgCRZuWwDM61cNYQ2GnqyoWRnI26wET7SlCChm8/UxtjrUUVw55rTKa3/SSPexx5bXJFg399AbqrEjVdfvwUAAAAAElFTkSuQmCC';
    let x = 170;
    let y = 60;
    JIMMY.setBackgroundImage(imageSource, x, y);
    
## setCallback(callbacks)

    JIMMY.setCallback({
        mouseup: function() {

            console.log('mouseup');

        },
        mousedown: function() {

            console.log('mousedown');

        },
        mousemove: function() {

            console.log('mousemove');

        },
        undo: function() {
        
            console.log('undo')
        
        },
        redo: function() {
        
            console.log('redo')
        
        },
        clear: function() {
        
            console.log('clear')
        
        },
        selected: function(drawing) {
        
            console.log('selected', drawing.type)
        
        }
    });
    
## toDataURL(fileType, quality, callback)

Get Base64 encoding image.

    let fileType = 'image/png';
    let quality = 100;
    JIMMY.toDataURL(fileType, quality, function(dataUrl){

        console.log(dataUrl);

    });
    
## download(fileType, quality, filename)

Download image.

    let fileType = 'image/png';
    let quality = 100;
    let finename = 'screenshot.png';
    JIMMY.download(fileType, quality, finename);
    
## Undo
## Redo

Undo/Redo drawings.

    JIMMY.undo();
    JIMMY.redo();
    
## Clear

Clear all drawings.

    JIMMY.clear();
    
## clearSelectingItem()

Clear selecting Item.

    JIMMY.clearSelectingItem();

## clearBackgroundColor()

Clear background color.

    JIMMY.clearBackgroundColor();
    
## clearBackgroundImage()

Clear background image.

    JIMMY.clearBackgroundImage();
    
## alignCanvas()

Initialize canvas position.  
You could use this method when an element moved or element size changed.  
For example, when you need to call jQuery's animate().

## isSelecting()

Check if a specific drawing is being selected by user.

    if(JIMMY.isSelecting()) {
    
        // Something..
    
    }

## hasUndo(), hasRedo()

Check if undo-drawing or redo-drawing exists.  
I believe that this method will be used for disabling your button or link. 

    if(JIMMY.hasUndo()) {
    
        // Something..
    
    }
    
    if(JIMMY.hasRedo()) {
    
        // Something..
    
    }

# License
This package is licensed under the MIT License.  
Copyright 2018 Sukohi Kuhoh