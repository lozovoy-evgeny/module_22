const btn = document.querySelector('.buttons__button');
const chart = document.querySelector('.buttons__button__icon');

const statusGeo = document.querySelector('#info-on-screen__status-geo');
const statusScreen = document.querySelector('#info-on-screen__status-screen');
const btnInfoOnScreen = document.querySelector('.info-on-screen__button');

const statusDate = document.querySelector('#time-zone__status-date');
const statusTimeZone = document.querySelector('#time-zone__status-screen');
const btnTimeZone = document.querySelector('.time-zone__button');

const wsUri = "wss://echo-ws-service.herokuapp.com/";
const btnSendMessage = document.querySelector('.echo__button__message');
const btnSendGeo = document.querySelector('.echo__button__geo');
const output = document.querySelector('.echo__out');


let websocket;

websocket = new WebSocket(wsUri);

btn.addEventListener('click', () => {
    let icon = document.getElementById('firstIcon');
    if (icon != null) {
        chart.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-left-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 0 0 8a8 8 0 0 0 16 0m-5.904-2.803a.5.5 0 1 1 .707.707L6.707 10h2.768a.5.5 0 0 1 0 1H5.5a.5.5 0 0 1-.5-.5V6.525a.5.5 0 0 1 1 0v2.768z"/>
            </svg>
        `;
    } else {
        chart.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" id = 'firstIcon' width="16" height="16" fill="currentColor" class="bi bi-arrow-down-left-circle" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-5.904-2.854a.5.5 0 1 1 .707.708L6.707 9.95h2.768a.5.5 0 1 1 0 1H5.5a.5.5 0 0 1-.5-.5V6.475a.5.5 0 1 1 1 0v2.768z"/>
            </svg>
        `;
    }
});

function useRequest(latitude, longitude) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `https://api.ipgeolocation.io/timezone?apiKey=32bcd4a6e4b548968e7afcdb682ac679&lat=${latitude}&long=${longitude}`, true);
    
    xhr.onload = function() {
      if (xhr.status != 200) {
        console.log('Статус ответа: ', xhr.status);
      } else {
        const result = JSON.parse(xhr.response);
        statusTimeZone.textContent = `Временная зона, в которой находится пользователь: ${result.timezone} `;
        statusDate.textContent = `Местные дата и время: ${result.date_time_txt}`
      }
    };
    
    xhr.onerror = function() {
      console.log('Ошибка! Статус ответа: ', xhr.status);
    };
    
    xhr.send();
};
  
const error = () => {
    statusGeo.textContent = 'Информация о местоположении недоступна';
}

const success = (position) => {
    const latitude  = position.coords.latitude;
    const longitude = position.coords.longitude;
  
    statusGeo.textContent = `Широта: ${latitude} °, Долгота: ${longitude} °`;
}

const successTimeZone = (position) => {
    const latitude  = position.coords.latitude;
    const longitude = position.coords.longitude;
    
    let infoDate = useRequest(latitude, longitude);
    console.log(infoDate);
}

btnInfoOnScreen.addEventListener('click', () => {
    if (!navigator.geolocation) {
       statusGeo.textContent = 'Информация о местоположении недоступна';
    } else {
       statusGeo.textContent = 'Определение местоположения…';
       navigator.geolocation.getCurrentPosition(success, error);
    }

    let heightScreen = window.screen.height;
    let widthScreen = window.screen.width;
    statusScreen.textContent = `Высота монитора: ${heightScreen}, Ширина монитора: ${widthScreen}`;
}); 

btnTimeZone.addEventListener('click', () => {
    if (!navigator.geolocation) {
        statusDate.textContent = 'Информация о местоположении недоступна';
    } else {
        statusDate.textContent = 'Определение местоположения…';
        navigator.geolocation.getCurrentPosition(successTimeZone, error);
    }
}); 

function writeToScreenRequest(message) {
    let pre = document.createElement("div");
    pre.classList.add('request');
    pre.innerHTML = message;
    output.appendChild(pre);
}

function writeToScreenAnswer(message) {
    let pre = document.createElement("div");
    pre.classList.add('answer');
    pre.innerHTML = message;
    output.appendChild(pre);
}

const successGeoChat = (position) => {
    const latitude  = position.coords.latitude;
    const longitude = position.coords.longitude;
    writeToScreenRequest(`<a href="https://www.openstreetmap.org/#map=18/${latitude}/${longitude}">Гео-локация</a>`)
}

btnSendGeo.addEventListener('click', () => {
    if (!navigator.geolocation) {
        writeToScreenRequest('Информация о местоположении недоступна');
    } else {
        navigator.geolocation.getCurrentPosition(successGeoChat, error);
    }
    
    websocket.send(navigator.geolocation);
});
      
btnSendMessage.addEventListener('click', () => {
    const message = document.querySelector('.echo__input').value;
    writeToScreenRequest(message);
    
    websocket.onmessage = function(evt) {
        if (evt.data != '[object Geolocation]') {
            writeToScreenAnswer(evt.data);
        }

    };

    websocket.send(message);
});