import React from "react";
import DatePicker from "react-datepicker";
import { NavLink } from "react-router-dom";
import { fetchRover } from "./NasaAPIs";
import Loading from "./Loading";
import { formatDisplayDate } from "./Formatting";
import moment from "moment";
import DocumentTitle from "react-document-title";

export default class MarsRover extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
      currentDate: "",
      previousDate: "",
      loading: false,
      overRequested: false
    };
  }
  componentDidMount = async () => {
    this.setState({ loading: true });
    var today = new Date();
    if (this.props.location.dateProps) {
      var dateComponents = this.props.location.dateProps.earth_date.split("-");
      console.log(dateComponents);
      today.setDate(Number(dateComponents[2]));
      today.setMonth(Number(dateComponents[1]) - 1);
      today.setFullYear(Number(dateComponents[0]));
      const photos = await fetchRover(this.props.location.dateProps.earth_date);
      this.setState({ photos });
    } else {
      var year = today.getFullYear(),
        month = today.getMonth() + 1,
        day = today.getDate();

      console.log(today);
      while (this.state.photos.length === 0) {
        var todayString = moment(today).format("YYYY-M-D");
        console.log("2:" + todayString);
        const photos = await fetchRover(todayString);
        if (!photos) {
          this.setState({ overRequested: true });
          break;
        }
        if (photos.length > 0) {
          this.setState({ photos });
          console.log(photos);
        } else {
          if (Number(day) === 1) {
            month -= 1;
            if (
              Number(month) === 5 ||
              Number(month) === 7 ||
              Number(month) === 8 ||
              Number(month) === 10 ||
              Number(month) === 12
            ) {
              day = 30;
            } else if (Number(month) === 3) {
              if (Number(year) % 4 === 0) {
                day = 29;
              } else {
                day = 28;
              }
            } else if (Number(month) === 1) {
              day = 31;
              month = 12;
              year -= 1;
            } else {
              day = 30;
            }
          } else {
            day -= 1;
          }
          today.setMonth(month - 1);
          today.setFullYear(year);
          today.setDate(day);
        }
      }
    }
    this.setState({ currentDate: today, previousDate: today, loading: false });
  };
  componentDidUpdate = async () => {
    if (this.state.currentDate !== this.state.previousDate) {
      this.setState({
        previousDate: this.state.currentDate,
        photos: [],
        loading: true,
        overRequested: false
      });
      var todayString = moment(this.state.currentDate).format("YYYY-M-D");
      const photos = await fetchRover(todayString);
      console.log(photos);
      console.log(photos.length);
      if (photos.length === 0) {
        this.setState({ photos, loading: false });
      }
      if (photos === null) {
        this.setState({ overRequested: true, loading: false });
      }
      if (photos.length > 0) {
        this.setState({ photos });
        this.setState({ loading: false });
      }
    }
  };
  handleChange = event => {
    this.setState({ currentDate: event });
  };
  render() {
    return (
      <DocumentTitle title="Mars Images">
        <div id="marsPage">
          {this.state.overRequested ? (
            <div>Too many requests to Nasa API </div>
          ) : (
            <div>
              <div className="container">
                <h1 className="page-title d-xs-block d-md-none">
                  <div>NASA</div>
                  <div>Mars Rover Photos</div>
                </h1>
                <h1 className="page-title d-none d-md-block">
                  NASA Mars Rover Photos
                </h1>
                <div className="row photo-section">
                  {/* <div id="mars-photo-date" className="col-12">{formatDisplayDate(this.state.currentDate)}</div> */}
                  <div id="mars-date-picker" className="col-12">
                    <DatePicker
                      selected={this.state.currentDate}
                      onChange={this.handleChange}
                    />
                  </div>
                </div>
                {this.state.loading ? (
                  <Loading />
                ) : (
                  <div className="photo-container">
                    {this.state.photos.length === 0 ? (
                      <div id="mars-photo-error">
                        No photos on {formatDisplayDate(this.state.currentDate)}
                      </div>
                    ) : (
                      <div className="row photo-section">
                        {this.state.photos.map(photo => {
                          return (
                            <div
                              className="mars-photo col-lg-3 col-md-4 col-sm-6"
                              key={photo.id}
                            >
                              <NavLink
                                to={`/mars/earth_date=${photo.earth_date}&photo_id=${photo.id}`}
                              >
                                <img
                                  src={photo.img_src}
                                  alt={photo.camera.full_name}
                                />
                              </NavLink>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DocumentTitle>
    );
  }
}
