# How to use

## Installation

Download the zip file containing all source files.

In `Settings -> Advanced` activate `Developer Mode`. 

Now you can install the plugin after unpacking the zip file in the `Plugins` panel by clicking on `Load unpacked plugin`

- Go to a news site using the template, the format of the page name should be "DD.MM.YYYY - DD.MM.YYYY"
```md
  template:: news
  page-type:: news
  author::
  topics::
  
	- ### **[[Good News]]**
	  background-color:: green
	- ### **Sat, **
	  background-color:: yellow
	- ### **Fri, **
	  background-color:: red
	- ### **Thu, **
	  background-color:: pink
	- ### **Wed, **
	  background-color:: blue
	- ### **Tue, **
	  background-color:: purple
	- ### **Mon, **
	  background-color:: gray
	- ### **Sun, **
```
- Click on the extension icon
- Run the helper.
