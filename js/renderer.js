//Renders front-end

//Receive api from main thread
window.api.receive('fromMain', (event, data) => {
    //Run functions based on data.type

    console.log(`Received message with data.type: ${data.type}`)


    switch(data.type) {
        case 'selectedDirectory':
            setNewWorkingDirectory(data.content)
            break
        
        case 'showErrorMessage':
            console.log(data.content)
    }
})

//To run after DOM load is complete
$(function() {
    bindTestButton();
});



//Bind test button to open file dialog click
//Refactor to React soon :-)
function bindTestButton() {
    var testButton = $('#test-button')[0];
    $(testButton).click(() => {
        sendRequestToMain();
    });
}



function sendRequestToMain() {
    let apiProps = {};
    apiProps.type = 'openDirectoryDialog'
    //Send api prop request to main
    window.api.send('toMain', apiProps);
}



function setNewWorkingDirectory(dir) {
    console.log(`Setting new working directory to ${dir}`)
};