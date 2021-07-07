//Renders front-end

//To run after DOM load is complete
$(function() {
    const domContainer = document.querySelector('#main-app');
    ReactDOM.render(React.createElement(MainApp), domContainer);
});