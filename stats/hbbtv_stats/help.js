function createHttpRequest(url, callback, options, param1, param2) {
    var req = new XMLHttpRequest();
    if (callback) {
        req.onreadystatechange = function() {
            if (req.readyState !== 4) {
                return;
            }
            if (callback) {
                try {
                    if (req.status >= 200 && req.status < 300) {
                        callback(req.responseText, param1, param2);
                    } else {
                        callback(null);
                    }
                } catch (e) {
                    if (console && console.log) {
                        console.log('Error while processing URL ' + url + ': ' + e + ' - Result was: ' + req.status + '/' + req.responseText);
                        console.log(e);
                    }
                }
            }
            req.onreadystatechange = null;
            req = null;
        };
    }
   /* if (GLOBALS.baseurl && url.indexOf(':/') < 1) {
        url = GLOBALS.baseurl + url;
    }*/
    try {
        req.open((options ? options.method : null) || 'GET', url, true);
        if (!options || !options.dosend) {
            req.send(null);
        } else {
            options.dosend(req);
        }
    } catch (e) {
        req.onreadystatechange = null;
        if (GLOBALS.demomode && console && console.log) {
            console.log(["Cannot open URL " + url, e]);
        }
        try {
            callback(null);
        } catch (e2) {}
        req = null;
    }
    return req;
}


function createClassDiv(xpos, ypos, className) {
    var ret = document.createElement('div');
    if (xpos !== false) {
        ret.style.left = xpos + 'px';
    }
    if (ypos !== false) {
        ret.style.top = ypos + 'px';
    }
    ret.className = className;
    return ret;
}

function createInput(xpos, ypos, className, type, value, width) {
    var ret = document.createElement("input");
    if (xpos !== false) {
        ret.style.left = xpos + 'px';
    }
    if (ypos !== false) {
        ret.style.top = ypos + 'px';
    }
    ret.className = className;
    ret.type = type;
    ret.value = value;
    ret.style.width = width + "px";
    return ret;
}


function sendFiles(){
	
    
   const files = document.querySelectorAll(".obj");
    
   const formData = new FormData();
    
    // Append files to files array
	for (var i = 0; i < files.length; i++) {
	    var file = files[i].file;
	
	    formData.append('files[]', file);
	}
	
	fetch("actions.php", {
	    method: 'POST',
	    body: formData
	}).then(response => {
	    console.log(response);
	});
}
