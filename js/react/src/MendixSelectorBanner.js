class MendixSelectorBanner extends React.Component {
    constructor(props) {
      super(props);
      this.onClick = this.props.onClick;
    }

    render() {
        let mendixProjectName;

        if (this.props.mendixScanner !== undefined) {
            mendixProjectName = this.props.mendixScanner.projectName;
        }

        let noMendixScanner = (
            <div className="banner-content">
                Please select a Mendix folder
            </div>
        )

        let hasMendixScanner = (
            <div className="banner-content">
                {mendixProjectName}
            </div>
        )

      return (
        <div className="selector-banner" onClick={this.onClick}>
            {this.props.mendixScanner !== undefined ? hasMendixScanner : noMendixScanner}
        </div>
      );
    }
  }