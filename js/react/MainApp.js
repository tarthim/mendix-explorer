var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MainApp = function (_React$Component) {
  _inherits(MainApp, _React$Component);

  function MainApp(props) {
    _classCallCheck(this, MainApp);

    var _this = _possibleConstructorReturn(this, (MainApp.__proto__ || Object.getPrototypeOf(MainApp)).call(this, props));

    _this.selectMendixFolder = function () {
      var apiProps = {};
      apiProps.type = 'openDirectoryDialog';
      //Send api prop request to main
      window.api.send('toMain', apiProps);
    };

    _this.processNewMendixScanner = function (mendixScanner) {
      //Turn mendix scanner object into JSON
      var newMendixScannerJson = JSON.parse(mendixScanner);
      _this.setState({
        mendixScanner: newMendixScannerJson
      });
    };

    _this.processNewMendixScanner = _this.processNewMendixScanner.bind(_this);
    _this.selectMendixFolder = _this.selectMendixFolder.bind(_this);
    _this.state = {
      mendixScanner: undefined,
      currentPage: 'general'
    };
    return _this;
  }

  _createClass(MainApp, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      //Receive api from main thread
      window.api.receive('fromMain', function (event, data) {
        //Run functions based on data.type
        switch (data.type) {
          case 'newMendixScanner':
            console.log('New mendix scanner JSON object');
            _this2.processNewMendixScanner(data.content);
            break;

          case 'showErrorMessage':
            console.log(data.content);
        }
      });
    }
  }, {
    key: 'render',
    value: function render() {

      var content = void 0;
      var mendixVersion = void 0;

      if (this.state.mendixScanner) {
        mendixVersion = this.state.mendixScanner.mendixVersion;
      }

      if (this.state.currentPage == 'general') {
        content = React.createElement(
          'div',
          { className: 'content' },
          React.createElement(MendixSelectorBanner, { mendixScanner: this.state.mendixScanner, onClick: this.selectMendixFolder }),
          React.createElement(
            'div',
            { className: 'general-content' },
            'Click on the banner above to select a Mendix folder to explore',
            React.createElement('br', null),
            mendixVersion
          )
        );
      }

      console.log(this.state.mendixScanner);

      return React.createElement(
        'div',
        { className: 'mendix-explorer' },
        React.createElement('div', { className: 'sidebar' }),
        React.createElement(
          'div',
          { className: 'main-content' },
          content
        )
      );
    }
  }]);

  return MainApp;
}(React.Component);