# PreviewLink
Puppeteer Code to copy preview links from the DV360 creative Tab
The code to be able to go to the creatives Tab in DV360 and pull up the preview links using the creative IDs

Cross checked the inspect elements tab and can see that the creative ID is only twice but in the same target element, once as an ID and another time as part of an URL

IF this changes in future, we'll need to see

I was able to hover over the element in the inspect elements tab and the respective creative ID got hovered over in the DV360 UI. 

Some Notes:
1. The use of executable path for chrome is not needed if your default google account has access to DV360. This code was optimised for the purpose that that only chrome had the account logged in that had dv360 access
2. initial_login.js shoudl be run in case you're running the code for the first time. This is because puppeter browser will have to introduce itself to the domain "displayvideo.google.com" so we'll have some cookies stored as well.
