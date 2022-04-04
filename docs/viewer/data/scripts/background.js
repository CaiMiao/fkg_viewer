
//nwjs stuff

//Get the current window
//Check if running with nwjs
if(window.nw !== undefined)
{
  //Maximize the window on startup
  var win = nw.Window.get();
  win.maximize();
}

