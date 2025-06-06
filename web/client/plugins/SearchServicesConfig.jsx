/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';

import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Glyphicon } from 'react-bootstrap';
import ConfirmButton from '../components/buttons/ConfirmButton';
import Dialog from '../components//misc/Dialog';
import Portal from '../components/misc/Portal';
import Message from './locale/Message';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { toggleControl } from '../actions/controls';
import { setSearchConfigProp, updateService, restServiceConfig } from '../actions/searchconfig';
import ServiceList from '../components/mapcontrols/searchservicesconfig/ServicesList.jsx';
import WFSServiceProps from '../components/mapcontrols/searchservicesconfig/WFSServiceProps.jsx';
import ResultsProps from '../components/mapcontrols/searchservicesconfig/ResultsProps.jsx';
import WFSOptionalProps from '../components/mapcontrols/searchservicesconfig/WFSOptionalProps.jsx';
import PropTypes from 'prop-types';
import ButtonMisc from '../components/misc/Button';
import tooltip from '../components/misc/enhancers/tooltip';
import { createPlugin } from '../utils/PluginsUtils';
import searchconfigReducer from '../reducers/searchconfig';

const Button = tooltip(ButtonMisc);

/**
 * Text Search Services Editor Plugin. Allow to add and edit additional
 * text serch service used by text search plugin. User has to
 * save the map to persist service changes.
 *
 * @class SearchServicesConfig
 * @memberof plugins
 * @static
 *
 * @prop {string} cfg.id identifier of the Plugin
 * @prop {object} cfg.panelStyle inline style for the panel
 * @prop {string} cfg.panelClassName className for the panel
 * @prop {string} cfg.containerClassName className for the container
 */
class SearchServicesConfigPanel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        enabled: PropTypes.bool,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        containerClassName: PropTypes.string,
        closeGlyph: PropTypes.string,
        titleText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        toggleControl: PropTypes.func,
        pages: PropTypes.arrayOf(PropTypes.shape({
            Element: PropTypes.func.isRequired,
            validate: PropTypes.func.isRequired
        })),
        page: PropTypes.number,
        service: PropTypes.object,
        initServiceValues: PropTypes.object,
        onPropertyChange: PropTypes.func,
        newService: PropTypes.object.isRequired,
        updateService: PropTypes.func,
        restServiceConfig: PropTypes.func,
        textSearchConfig: PropTypes.object,
        editIdx: PropTypes.number
    };

    static defaultProps = {
        id: "search-services-config-editor",
        enabled: false,
        panelStyle: {
            minWidth: "400px",
            zIndex: 2000,
            position: "absolute",
            // overflow: "auto",
            top: "100px",
            minHeight: "300px",
            left: "calc(50% - 150px)",
            backgroundColor: "white"
        },
        panelClassName: "toolbar-panel",
        containerClassName: '',
        closeGlyph: "1-close",
        titleText: <Message msgId="search.configpaneltitle" />,
        closePanel: () => {},
        onPropertyChange: () => {},
        page: 0,
        newService: {
            type: "wfs",
            name: "",
            displayName: "",
            subTitle: "",
            priority: 1,
            options: {
                url: "",
                typeName: "",
                queriableAttributes: "",
                sortBy: "",
                maxFeatures: 5,
                srsName: "EPSG:4326"}
        }
    };

    canProceed = () => {
        const {page, pages, service} = this.props;
        return pages[page].validate(service);
    };

    isDirty = () => {
        const {service, initServiceValues} = this.props;
        return !isEqual(service, initServiceValues);
    };

    renderFooter = () => {
        const {page, pages} = this.props;
        if (page === 0) {
            return (
                <span role="footer">
                    <Button onClick={this.addService} bsStyle="primary">
                        <Message msgId="search.addbtn" />
                    </Button>
                </span>);
        } else if (page === pages.length - 1) {
            return (
                <span role="footer">
                    <Button onClick={this.prev} bsStyle="primary">
                        <Message msgId="search.prevbtn" />
                    </Button>
                    <Button disabled={!this.canProceed()} onClick={this.update} bsStyle="success">
                        <Message msgId="search.savebtn" />
                    </Button>
                </span>);
        }
        return (
            <span role="footer">
                {page === 1 && this.isDirty() ? (
                    <ConfirmButton onConfirm={this.prev} bsStyle="primary"
                        confirming={{text: <Message msgId="search.cancelconfirm" />}}
                        text={(<Message msgId="search.cancelbtn" />)}/>
                ) : (
                    <Button onClick={this.prev} bsStyle="primary">
                        <Message msgId={page === 1 ? "search.cancelbtn" : "search.prevbtn"} />
                    </Button>)
                }
                <Button disabled={!this.canProceed()} onClick={this.next} bsStyle="primary">
                    <Message msgId="search.nextbtn" />
                </Button>
            </span>);
    };

    render() {
        const { enabled, pages, page, id, panelStyle, panelClassName, titleText, closeGlyph, onPropertyChange, service, textSearchConfig = {}, containerClassName} = this.props;
        const Section = pages && pages[page] || null;
        return enabled ? (
            <Portal>
                <Dialog id={id} style={{...panelStyle, display: enabled ? 'block' : 'none'}} containerClassName={containerClassName}className={panelClassName} draggable={false} modal>
                    <span role="header">
                        <span className="modal-title">{titleText}</span>
                        { this.isDirty() ? (
                            <ConfirmButton className="close" confirming={{
                                text: <Message msgId="search.cancelconfirm" />, className: "btn btn-sm btn-warning services-config-editor-confirm-close"}} onConfirm={this.onClose} bsStyle="primary" text={(<Glyphicon glyph={closeGlyph}/>)}/>) : (<button onClick={this.onClose} className="close">{closeGlyph ? <Glyphicon glyph={closeGlyph}/> : <span>×</span>}</button>)
                        }
                    </span>
                    <div role="body" className="services-config-editor">
                        <Section.Element
                            services={textSearchConfig.services}
                            override={textSearchConfig.override}
                            onPropertyChange={onPropertyChange}
                            service={service}/>
                    </div>
                    {this.renderFooter()}
                </Dialog>
            </Portal>) : null;
    }

    onClose = () => {
        this.props.toggleControl("searchservicesconfig");
        this.props.restServiceConfig(0);
    };

    addService = () => {
        const {newService} = this.props;
        this.props.onPropertyChange("init_service_values", newService);
        this.props.onPropertyChange("service", newService);
        this.props.onPropertyChange("page", 1);
    };

    prev = () => {
        const {page} = this.props;
        if (page > 1) {
            this.props.onPropertyChange("page", page - 1);
        } else if (page === 1 ) {
            this.props.restServiceConfig(0);
        }
    };

    next = () => {
        const {page, pages} = this.props;
        if (page < pages.length - 1) {
            this.props.onPropertyChange("page", page + 1);
        }
    };

    update = () => {
        const {service, editIdx} = this.props;
        this.props.updateService(service, editIdx);
    };
}

const SearchServicesPlugin = connect(({controls = {}, searchconfig = {}}) => ({
    enabled: get(controls, "searchservicesconfig.enabled", false),
    pages: [ServiceList, WFSServiceProps, ResultsProps, WFSOptionalProps],
    page: get(searchconfig, "page", 0),
    service: get(searchconfig, "service", {}),
    initServiceValues: get(searchconfig, "init_service_values", {}),
    textSearchConfig: get(searchconfig, "textSearchConfig", {}),
    editIdx: searchconfig && searchconfig.editIdx
}), {
    toggleControl,
    onPropertyChange: setSearchConfigProp,
    restServiceConfig,
    updateService})(SearchServicesConfigPanel);

function SearchServiceButton({
    activeTool,
    enabled,
    onToggleControl
}) {

    if (activeTool === 'addressSearch') {
        return (<Button
            bsStyle="default"
            pullRight
            className="square-button-md no-border"
            tooltipId="search.searchservicesbutton"
            tooltipPosition="bottom"
            onClick={() => {
                if (!enabled) {
                    onToggleControl('searchservicesconfig');
                }
            }}
        >
            <Glyphicon glyph="cog"/>
        </Button>);
    }

    return null;
}

const ConnectedSearchServicesConfigButton = connect(
    createSelector([
        state => state.search || null,
        state => state?.controls?.searchservicesconfig?.enabled || false
    ], (searchState, enabled) => ({
        activeTool: get(searchState, 'activeSearchTool', 'addressSearch'),
        enabled
    })),
    {
        onToggleControl: toggleControl
    }
)(SearchServiceButton);

export default createPlugin('SearchServicesConfig', {
    component: SearchServicesPlugin,
    containers: {
        Search: {
            name: 'SearchServicesConfigButton',
            target: 'button',
            component: ConnectedSearchServicesConfigButton
        }
    },
    reducers: {
        searchconfig: searchconfigReducer
    }
});
