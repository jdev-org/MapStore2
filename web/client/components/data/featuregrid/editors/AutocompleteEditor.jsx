/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import PropTypes from 'prop-types';
import React from 'react';

import { createPagedUniqueAutompleteStream } from '../../../../observables/autocomplete';
import ConfigUtils from '../../../../utils/ConfigUtils';
import { AutocompleteCombobox } from '../../../misc/AutocompleteCombobox';
import AttributeEditor from './AttributeEditor';

/**
 * Editor for FeatureGrid, used for strings with auto-complete
 *
 * @name AutocompleteEditor
 * @memberof components.data.featuregrid.editors
 * @type {Object}
 */
class AutocompleteEditor extends AttributeEditor {
    static propTypes = {
        column: PropTypes.object,
        dataType: PropTypes.string,
        inputProps: PropTypes.object,
        isValid: PropTypes.func,
        onBlur: PropTypes.func,
        autocompleteStreamFactory: PropTypes.func,
        url: PropTypes.string,
        typeName: PropTypes.string,
        value: PropTypes.string
    };
    static defaultProps = {
        isValid: () => true,
        dataType: "string"
    };
    constructor(props) {
        super(props);
        this.validate = (value) => {
            try {
                return this.props.isValid(value[this.props.column && this.props.column.key]);
            } catch (e) {
                return false;
            }
        };
        this.getValue = () => {
            const updated = super.getValue();
            return updated;
        };
    }
    render() {
        return <AutocompleteCombobox disabled={!this.props?.column?.editable} {...this.props} url={ConfigUtils.getParsedUrl(this.props.url, {"outputFormat": "json"})} filter="contains" autocompleteStreamFactory={createPagedUniqueAutompleteStream}/>;
    }
}

export default AutocompleteEditor;
