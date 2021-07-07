class MainApp extends React.Component {
  constructor(props) {
    super(props);
    this.processNewMendixScanner = this.processNewMendixScanner.bind(this);
    this.selectMendixFolder = this.selectMendixFolder.bind(this);
    this.state = {
        mendixScanner: undefined,
        currentPage: 'general'
    }
  }

  selectMendixFolder = () => {
      let apiProps = {};
      apiProps.type = 'openDirectoryDialog'
      //Send api prop request to main
      window.api.send('toMain', apiProps);
  }

  processNewMendixScanner = (mendixScanner) => {
    //Turn mendix scanner object into JSON
    let newMendixScannerJson = JSON.parse(mendixScanner)
    this.setState({
      mendixScanner: newMendixScannerJson
    })
  }

  componentDidMount() {
    //Receive api from main thread
    window.api.receive('fromMain', (event, data) => {
      //Run functions based on data.type
      switch(data.type) {
          case 'newMendixScanner':
              console.log('New mendix scanner JSON object')
              this.processNewMendixScanner(data.content)
              break
          
          case 'showErrorMessage':
              console.log(data.content)
      }
    })
  }



  render() {

    let content;
    let mendixVersion;

    if (this.state.mendixScanner) {
      mendixVersion = this.state.mendixScanner.mendixVersion;
    }

    if (this.state.currentPage == 'general') {
      content = (
        <div className="content">
          <MendixSelectorBanner mendixScanner={this.state.mendixScanner} onClick={this.selectMendixFolder} />
          <div className="general-content">
            Click on the banner above to select a Mendix folder to explore
            <br/>
            {mendixVersion}
          </div>
        </div>
      )
    }


    console.log(this.state.mendixScanner)

    return (
      <div className="mendix-explorer">
        <div className="sidebar"></div>
        <div className="main-content">
          {content}
        </div>
      </div>
    );
  }
}