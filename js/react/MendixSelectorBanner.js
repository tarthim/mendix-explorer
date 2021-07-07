var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MendixSelectorBanner = function (_React$Component) {
    _inherits(MendixSelectorBanner, _React$Component);

    function MendixSelectorBanner(props) {
        _classCallCheck(this, MendixSelectorBanner);

        var _this = _possibleConstructorReturn(this, (MendixSelectorBanner.__proto__ || Object.getPrototypeOf(MendixSelectorBanner)).call(this, props));

        _this.onClick = _this.props.onClick;
        return _this;
    }

    _createClass(MendixSelectorBanner, [{
        key: "render",
        value: function render() {
            var mendixProjectName = void 0;

            if (this.props.mendixScanner !== undefined) {
                mendixProjectName = this.props.mendixScanner.projectName;
            }

            var noMendixScanner = React.createElement(
                "div",
                { className: "banner-content" },
                "Please select a Mendix folder"
            );

            var hasMendixScanner = React.createElement(
                "div",
                { className: "banner-content" },
                mendixProjectName
            );

            return React.createElement(
                "div",
                { className: "selector-banner", onClick: this.onClick },
                this.props.mendixScanner !== undefined ? hasMendixScanner : noMendixScanner
            );
        }
    }]);

    return MendixSelectorBanner;
}(React.Component);