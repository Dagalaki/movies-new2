 // Use SockJS
Stomp.WebSocketClass = SockJS;

var rabbitMQURL = 'lora.anixa.tv';

var username = "test",
    password = "test",
    vhost    = "/",
    url      = 'https://' + rabbitMQURL + ':15674/stomp',
//    queue    = '/application/#';
    queue    = '/topic/application.#',
    queue2   = Array('/topic/application.#','/topic/gateway.#');
//    queue    = "/topic/sensor.jons-house.#"; // To translate mqtt topics to
                             // stomp we change slashes
                             // to dots
var consol;

function on_connect() {
  consol.innerHTML += 'Connected to RabbitMQ-Web-Stomp<br />';
  console.log(client);
  //console.innerHTML += client;
  client.subscribe(queue, on_message);
}
function on_connection_error() {
  console.log(client);
  consol.innerHTML += 'Connection failed!<br />';
}

var decodePHP = new XMLHttpRequest();

decodePHP.onload = function() {
        decodedMessage = this.responseText;
        addMessage(decodedMessage);
}

function addMessage(decodedMessage) {
  consol.innerHTML = "(" + devEUI + ") at '" + time + "' saying '" + decodedMessage + "', RSSI: " + rssi + "<br />" + consol.innerHTML;
}

var devEUI = "";
var time = "";
var data = "";
var rssi = "";

function on_message(m) {
  //console.log('Received:' + m);
  var messageObject = JSON.parse(m.body);
  devEUI = messageObject.devEUI;
  time = messageObject.time;
  data = messageObject.data;
  rssi = messageObject.rssi;
  if(typeof data !== 'undefined') {
    decodePHP.open("post", "http://lora.anixa.tv/mqttlive/stringFormat.php?bsstring=" + data);
    decodePHP.send();
  } else {
    console.log(messageObject);
  }
  //consol.innerHTML += "(" + devEUI + ") at '" + time + "' saying '" + data + "', RSSI:" + rssi + '<br />';
}

var ws = new SockJS(url);
var client = Stomp.over(ws);

window.onload = function () {
  consol = document.getElementById("console");
  // Connect
  client.connect(
    username,
    password,
    on_connect,
    on_connection_error,
    vhost
  );
}