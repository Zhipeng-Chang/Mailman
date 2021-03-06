import React, { Component } from 'react';
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

import { Button, Card, Grid, Typography } from '@material-ui/core';

import MenuInput from '../MergeTemplate/MenuInput';
import Hint from '../MergeTemplate/Hint';
import { mergeTemplateInfoShape } from '../MergeTemplate/MergeTemplatePropTypes';
import {getOAuthToken} from '../../util/OAuthUtil'
export default class TabSelection extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            selectedTab: this.props.currentMergeTemplate.sheetName,
            tabsList: []
        }
    }

    componentDidMount() {
        this._isMounted = true;

        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        getOAuthToken().then(
            accessToken => {
            config.headers.accessToken = accessToken;
            fetch(`https://localhost:5001/api/Sheets/SheetNames/${this.props.spreadsheetId}`, config)
            .then(response => { // Use arrow functions so do not have to bind to "this" context
                return response.json();
            })
            .then(json => {
                if (this._isMounted) {
                    this.setState({ tabsList: json });
                }
            })
            .catch(error => {
                console.log("Error: Unable to get sheet tab data");
            })
            })
        .catch(error => {
            console.log("Error: Unable to get sheet tab data");
        })

    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    updateMenuInput = (newInput) => {
        this.setState({ selectedTab: newInput });
    }

    disableNextButton() {
        if (this.state.selectedTab) {
            if (this.state.tabsList && this.state.tabsList.includes(this.state.selectedTab)) {
                return false;
            }
            return true;
        } else {
            return true;
        }
    }

    handleRouting = () => {
        const oldSelection = this.props.currentMergeTemplate.sheetName;
        if (oldSelection !== this.state.selectedTab) {
            console.log("Different tab was selected");
            if (this._isMounted) {
                this.props.updateTabSelection(this.state.selectedTab);
            }
        } else {
            console.log("Tab selection unchanged.");
        }
    }

    render() {
        return (
            <Grid
                container
                style={styles.container}
            >
                <Card style={styles.card}>
                    <Typography variant="h5" style={styles.title}>Which tab are we sending from?</Typography>
                    <MenuInput
                        placeholder="Tab..."
                        selected={this.state.selectedTab}
                        values={this.state.tabsList}
                        callback={this.updateMenuInput}
                    />
                    <Hint title="This tab must contain all the information you may want to send in an email." />
                </Card>
                <Link to={`/mergeTemplate/title`}>
                    <Button
                        variant="contained"
                        style={styles.cancel_button}
                        onClick={() => this.handleRouting()}
                    >
                        Back
                    </Button>
                </Link>
                <Link to="/mergeTemplate/headerSelection">
                    <Button
                        color="primary"
                        variant="contained"
                        style={styles.next_button}
                        onClick={() => this.handleRouting()}
                        disabled={this.disableNextButton()}
                    >
                        Next
                    </Button>
                </Link>
            </Grid>
        );
    }

}

const styles = {
    container: {
      paddingTop: 15,
      alignItems: "center",
    },
    card: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: 15,
      justifyContent: 'center',
    },
    title: {
      marginBottom: 15
    },
    cancel_button: {
      position: "absolute",
      bottom: 15,
      left: 15
    },
    next_button: {
      position: "absolute",
      bottom: 15,
      right: 15
    },
}

TabSelection.propTypes = {
    currentMergeTemplate: mergeTemplateInfoShape.isRequired,
    updateTabSelection: PropTypes.func.isRequired,
    spreadsheetId: PropTypes.string.isRequired,
}