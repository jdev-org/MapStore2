/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {
    ADD_FILTER_FIELD,
    REMOVE_FILTER_FIELD,
    UPDATE_FILTER_FIELD,
    UPDATE_EXCEPTION_FIELD,
    ADD_GROUP_FIELD,
    UPDATE_LOGIC_COMBO,
    REMOVE_GROUP_FIELD,
    CHANGE_CASCADING_VALUE
} = require('../actions/queryform');

const assign = require('object-assign');

const initialState = {
    groupFields: [
        {
            id: 1,
            logic: "OR",
            index: 0
        }
    ],
    filterFields: [
        {
            rowId: 0,
            groupId: 1,
            attribute: null,
            operator: "=",
            value: null,
            exception: null
        }
    ]
};

function queryform(state = initialState, action) {
    switch (action.type) {
        case ADD_FILTER_FIELD: {
            //
            // Calculate the key number, this should be different for each new element
            //
            const newFilterField = {
                rowId: new Date().getUTCMilliseconds(),
                groupId: action.groupId,
                attribute: null,
                operator: "=",
                value: null,
                exception: null
            };

            return assign({}, state, {filterFields: (state.filterFields ? [...state.filterFields, newFilterField] : [newFilterField])});
        }
        case REMOVE_FILTER_FIELD: {
            return assign({}, state, {filterFields: state.filterFields.filter((field) => field.rowId !== action.rowId)});
        }
        case UPDATE_FILTER_FIELD: {
            return assign({}, state, {filterFields: state.filterFields.map((field) => {
                if (field.rowId === action.rowId) {
                    return assign({}, field, {[action.fieldName]: action.fieldValue});
                }
                return field;
            })});
        }
        case UPDATE_EXCEPTION_FIELD: {
            return assign({}, state, {filterFields: state.filterFields.map((field) => {
                if (field.rowId === action.rowId) {
                    return assign({}, field, {exception: action.exceptionMessage});
                }
                return field;
            })});
        }
        case ADD_GROUP_FIELD: {
            const newGroupField = {
                id: new Date().getUTCMilliseconds(),
                logic: "OR",
                groupId: action.groupId,
                index: action.index + 1
            };
            return assign({}, state, {groupFields: (state.groupFields ? [...state.groupFields, newGroupField] : [newGroupField])});
        }
        case UPDATE_LOGIC_COMBO: {
            return assign({}, state, {groupFields: state.groupFields.map((field) => {
                if (field.id === action.groupId) {
                    return assign({}, field, {logic: action.logic});
                }
                return field;
            })});
        }
        case REMOVE_GROUP_FIELD: {
            return assign({}, state, {
                filterFields: state.filterFields.filter((field) => field.groupId !== action.groupId),
                groupFields: state.groupFields.filter((group) => group.id !== action.groupId)
            });
        }
        case CHANGE_CASCADING_VALUE: {
            return assign({}, state, {filterFields: state.filterFields.map((field) => {
                for (let i = 0; i < action.attributes.length; i++) {
                    if (field.attribute === action.attributes[i].id) {
                        return assign({}, field, {value: null});
                    }
                }
                return field;
            })});
        }
        default:
            return state;
    }
}

module.exports = queryform;
