# pdf-pointer
Display PDFs with a pointer, make quick annotations (that automatically disappear), and zoom them

Try it: https://dinoosauro.github.io/pdf-pointer/
## Open a file
![Screenshot 2023-07-08 alle 12 38 01](https://i.imgur.com/R94fMa0.png)
When you open the webpage, you'll be asked to open a file. Select a PDF and PDFPointer will automatically display it. You can also drag and drop the file.

At the right, you can see that it's possible to install the app for offline use. See the "Offline Use" section of this README for more information.
## Functions
You can access to all of the functions from the toolbar.
![Screenshot 2023-07-08 alle 12 26 23](https://i.imgur.com/mAyIlnL.png)

### Draw into a PDF
With PDFPointer, you can create quick annotations that disappear automatically. To do that, click the pen icon from the tools above. Start drawing, and, by default, the annotations will disappear after 15 seconds. If you want to change it, click on the Timer icon and then choosse another option. If you want to erase sooner the drawing, click on the eraser icon. You can also change the color of the drawing tool clicking the _color_ icon next to the erase one.
![Screenshot 2023-07-08 alle 12 24 26](https://i.imgur.com/eYJ2l22.png)
### Fullscreen
Click on the fullscreen icon (the one after the color one) and the document will be displayed in full screen. The bar will automatically move to the left of the screen.
![Screenshot 2023-07-08 alle 12 30 47](https://i.imgur.com/LzI3IUZ.png)
### Settings
In the settings, you can change lots of things:
- Delete/Add custom colors
- Choose if alerts should be shown (and their length)
- Change the color of the pointer
- [Change, delete or create an application theme](https://github.com/Dinoosauro/pdf-pointer/tree/main/themeCreator)
- Change the zoom option between zooming the PDF canvas or scrolling it; kepp annotations when zooming (even if it'll be a lot buggy) and enable a button to expand the PDF canvas size.
- Change the background color/image/video of the application.
- Change the language of the application
- See keyboard shortcuts
- See the licenses of the open source libraries 
### Zoom in/out
You can zoom the PDF by clicking the magnifying glass icon. 
### Expand and contract PDF
Those two strange symbols before the "Next page" one and after the "Previous page" one arte he expand and contract button. These can optionally be enabled by the settings, and allow the user to control in a greater way than zooming the dimension of the canvas where the PDF is displayed. You can use them in both zoom modes.
### Next/Previous page
Click the next/previous icon to go to the next/previous page.

## Offline use
You can use PDFPointer offline by installing the website as a Progressive Web App (currently supported only on Chromium). Make sure to be online the first time and to open a PDF, then everything should work just fine.
## Keyboard shortcuts
The following keyboard shortcuts are supported:
| Key | What it does | 
| --- | ---- |
| ⇧ (Shift) | Start (or finish) an annotation |
| ⌥/Alt (Option) | Force stop an annotation |
| ⌫ (Backspace) | Delete an annotation |
| ▶ (Right arrow) | Next page |
| ◀ (Left arrow) | Previous page |
| + (Plus sign) | Increase zoom |
| - (Minus sign) | Decrease zoom |

You can see them also from the website's settings.

## Change background image/video

You can change the background with a local image, the default background color and YouTube videos. Yes, this means you can keep those Minecraft parkour backgrounds also when reading PDF. 

![An image showing Minecraft parkour in the background while displaying a PDF.](https://i.imgur.com/LI8VHGd.png)

*The industrial revolution and its consequences...*


## Privacy
Your PDF files are never uplaoded to the cloud. Everything is elaborated locally on your device.

PDFPointer connects to the following domains:

- Google Fonts: to download the fonts used for the text, no data is shared with Google
- JSDelivr/GitHub/CloudFlare: download libraries that make the software work
- GitHub Pages: hosting of pdf-pointer
- YouTube: only if you enable YouTube videos as a background from Settings